#!/usr/bin/env python3
"""
Builds dictionary.db from Open English WordNet (OEWN) via the `wn` library.
Output: assets/dictionary.db

Usage:
    pip install wn
    python scripts/build_dictionary.py
"""

import sqlite3
import os
import sys
from datetime import datetime, timezone

try:
    import wn
except ImportError:
    print("Installing wn...")
    os.system(f"{sys.executable} -m pip install wn")
    import wn

print("Downloading Open English WordNet (first run only)...")
wn.download("oewn:2024")

POS_MAP = {
    "n": "noun",
    "v": "verb",
    "a": "adjective",
    "r": "adverb",
    "s": "adjective satellite",
}

os.makedirs("assets", exist_ok=True)
db_path = "assets/dictionary.db"

if os.path.exists(db_path):
    os.remove(db_path)

conn = sqlite3.connect(db_path)
c = conn.cursor()

c.executescript("""
    CREATE TABLE meta (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
    CREATE TABLE entries (
        id         INTEGER PRIMARY KEY,
        word       TEXT NOT NULL,
        pos        TEXT NOT NULL,
        definition TEXT NOT NULL
    );
    CREATE TABLE examples (
        entry_id INTEGER NOT NULL,
        example  TEXT NOT NULL
    );
    CREATE TABLE synonyms (
        entry_id INTEGER NOT NULL,
        synonym  TEXT NOT NULL
    );
    CREATE TABLE antonyms (
        entry_id INTEGER NOT NULL,
        antonym  TEXT NOT NULL
    );
    CREATE INDEX idx_word ON entries(word);
""")

built_at = datetime.now(timezone.utc).isoformat()
c.executemany("INSERT INTO meta VALUES (?,?)", [
    ("built_at", built_at),
    ("wordnet_version", "oewn:2024"),
    ("source", "https://github.com/globalwordnet/english-wordnet"),
])
conn.commit()

all_words = list(wn.words(lang="en"))
total = len(all_words)
entry_id = 0

entries_buf = []
examples_buf = []
synonyms_buf = []
antonyms_buf = []

for i, word in enumerate(all_words):
    if i % 5000 == 0:
        print(f"  {i}/{total} words processed...", flush=True)

    lemma = word.lemma()

    for sense in word.senses():
        synset = sense.synset()
        pos = POS_MAP.get(synset.pos, synset.pos)
        definition = synset.definition()
        if not definition:
            continue

        entry_id += 1
        entries_buf.append((entry_id, lemma, pos, definition))

        for ex in synset.examples():
            examples_buf.append((entry_id, ex))

        for syn_word in synset.words():
            if syn_word.lemma() != lemma:
                synonyms_buf.append((entry_id, syn_word.lemma()))

        for ant_sense in sense.get_related("antonym"):
            antonyms_buf.append((entry_id, ant_sense.word().lemma()))

    if len(entries_buf) >= 10000:
        c.executemany("INSERT INTO entries VALUES (?,?,?,?)", entries_buf)
        c.executemany("INSERT INTO examples VALUES (?,?)", examples_buf)
        c.executemany("INSERT INTO synonyms VALUES (?,?)", synonyms_buf)
        c.executemany("INSERT INTO antonyms VALUES (?,?)", antonyms_buf)
        conn.commit()
        entries_buf.clear()
        examples_buf.clear()
        synonyms_buf.clear()
        antonyms_buf.clear()

c.executemany("INSERT INTO entries VALUES (?,?,?,?)", entries_buf)
c.executemany("INSERT INTO examples VALUES (?,?)", examples_buf)
c.executemany("INSERT INTO synonyms VALUES (?,?)", synonyms_buf)
c.executemany("INSERT INTO antonyms VALUES (?,?)", antonyms_buf)
conn.commit()
conn.close()

size_mb = os.path.getsize(db_path) / 1024 / 1024
print(f"\n results: assets/dictionary.db — {entry_id:,} entries, {size_mb:.1f} MB")
