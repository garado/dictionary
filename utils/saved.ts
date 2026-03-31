import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "saved_definitions";

export interface SavedDefinition {
    id: string;
    word: string;
    pos: string;
    definition: string;
    savedAt: number;
}

export async function getSaved(): Promise<SavedDefinition[]> {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
}

export async function saveDefinition(item: Omit<SavedDefinition, "savedAt">): Promise<void> {
    const saved = await getSaved();
    const already = saved.find((s) => s.id === item.id);
    if (already) return;
    await AsyncStorage.setItem(KEY, JSON.stringify([{ ...item, savedAt: Date.now() }, ...saved]));
}

export async function removeDefinition(id: string): Promise<void> {
    const saved = await getSaved();
    await AsyncStorage.setItem(KEY, JSON.stringify(saved.filter((s) => s.id !== id)));
}

export async function clearSaved(): Promise<void> {
    await AsyncStorage.removeItem(KEY);
}
