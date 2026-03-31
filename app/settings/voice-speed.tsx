import { useState, useEffect } from "react";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OptionsSelector } from "@/components/OptionsSelector";
import { PRESETS, PresetId, PRESET_KEY } from "@/app/(tabs)/settings";

const OPTIONS = PRESETS.map((p) => ({ label: p.label, value: p.id }));

export default function VoiceSpeedScreen() {
    const [selectedPreset, setSelectedPreset] = useState<PresetId>("default");

    useEffect(() => {
        AsyncStorage.getItem(PRESET_KEY).then((id) => {
            if (id) setSelectedPreset(id as PresetId);
        });
    }, []);

    const handleSelect = (id: string) => {
        const preset = PRESETS.find((p) => p.id === id)!;
        setSelectedPreset(id as PresetId);
        AsyncStorage.setItem(PRESET_KEY, id);
        Speech.stop();
        Speech.speak("Hello", { rate: preset.rate, pitch: preset.pitch, language: "en" });
    };

    return (
        <OptionsSelector
            title="Voice Speed"
            options={OPTIONS}
            selectedValue={selectedPreset}
            onSelect={handleSelect}
            autoBack={false}
        />
    );
}
