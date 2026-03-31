import { useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import * as Application from "expo-application";
import ContentContainer from "@/components/ContentContainer";
import { SelectorButton } from "@/components/SelectorButton";
import { n } from "@/utils/scaling";

export const PRESET_KEY = "speech_preset";

export const PRESETS = [
    { id: "default", label: "Default", rate: 0.9, pitch: 1.0 },
    { id: "slow",    label: "Slow",    rate: 0.5, pitch: 1.0 },
    { id: "fast",    label: "Fast",    rate: 1.4, pitch: 1.0 },
] as const;

export type PresetId = typeof PRESETS[number]["id"];

export const getSpeechSettings = async () => {
    const id = ((await AsyncStorage.getItem(PRESET_KEY)) ?? "default") as PresetId;
    const preset = PRESETS.find((p) => p.id === id) ?? PRESETS[0];
    return preset;
};

export default function SettingsScreen() {
    const [selectedPreset, setSelectedPreset] = useState<PresetId>("default");

    useFocusEffect(useCallback(() => {
        AsyncStorage.getItem(PRESET_KEY).then((id) => {
            if (id) setSelectedPreset(id as PresetId);
        });
    }, []));

    const presetLabel = PRESETS.find((p) => p.id === selectedPreset)?.label ?? "Default";

    const version = Application.nativeApplicationVersion;

    return (
        <ContentContainer headerTitle={`Settings (v${version})`} hideBackButton style={styles.container}>
            <SelectorButton
                label="Voice Speed"
                value={presetLabel}
                href="/settings/voice-speed"
            />
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: n(20),
    },
});
