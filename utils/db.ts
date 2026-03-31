import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system/legacy";
import { Asset } from "expo-asset";

const DB_NAME = "dictionary.db";

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;

    const dbDir = `${FileSystem.documentDirectory}SQLite/`;
    const dbPath = `${dbDir}${DB_NAME}`;

    const { exists } = await FileSystem.getInfoAsync(dbPath);
    if (!exists) {
        await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
        const asset = Asset.fromModule(require("../assets/dictionary.db"));
        await asset.downloadAsync();
        await FileSystem.copyAsync({ from: asset.localUri!, to: dbPath });
    }

    db = await SQLite.openDatabaseAsync(DB_NAME);
    return db;
}

export interface SearchResult {
    id: number;
    word: string;
    pos: string;
    definition: string;
}

export interface EntryMeaning {
    id: number;
    pos: string;
    definition: string;
    examples: string[];
    synonyms: string[];
    antonyms: string[];
}

export async function searchWord(query: string): Promise<SearchResult[]> {
    const database = await getDb();
    return database.getAllAsync<SearchResult>(
        "SELECT id, word, pos, definition FROM entries WHERE word = ? LIMIT 15",
        [query.toLowerCase()]
    );
}

export async function getEntry(word: string): Promise<EntryMeaning[]> {
    const database = await getDb();

    const entries = await database.getAllAsync<{
        id: number;
        pos: string;
        definition: string;
    }>("SELECT id, pos, definition FROM entries WHERE word = ?", [
        word.toLowerCase(),
    ]);

    return Promise.all(
        entries.map(async (entry) => {
            const [examples, synonyms, antonyms] = await Promise.all([
                database.getAllAsync<{ example: string }>(
                    "SELECT example FROM examples WHERE entry_id = ?",
                    [entry.id]
                ),
                database.getAllAsync<{ synonym: string }>(
                    "SELECT synonym FROM synonyms WHERE entry_id = ?",
                    [entry.id]
                ),
                database.getAllAsync<{ antonym: string }>(
                    "SELECT antonym FROM antonyms WHERE entry_id = ?",
                    [entry.id]
                ),
            ]);

            return {
                id: entry.id,
                pos: entry.pos,
                definition: entry.definition,
                examples: examples.map((e) => e.example),
                synonyms: synonyms.map((s) => s.synonym),
                antonyms: antonyms.map((a) => a.antonym),
            };
        })
    );
}
