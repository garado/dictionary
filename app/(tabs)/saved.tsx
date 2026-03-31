import { useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import ContentContainer from "@/components/ContentContainer";
import CustomScrollView from "@/components/CustomScrollView";
import { StyledText } from "@/components/StyledText";
import { HapticPressable } from "@/components/HapticPressable";
import { CenteredMessage } from "@/components/CenteredMessage";
import { getSaved, removeDefinition, clearSaved, SavedDefinition } from "@/utils/saved";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";

export default function SavedScreen() {
    const { invertColors } = useInvertColors();
    const [items, setItems] = useState<SavedDefinition[]>([]);
    const color = invertColors ? "black" : "white";

    const params = useLocalSearchParams<{ confirmed: string; action: string }>();

    useFocusEffect(
        useCallback(() => {
            if (params.confirmed === "true" && params.action === "clearSaved") {
                router.setParams({ confirmed: undefined, action: undefined });
                clearSaved().then(() => setItems([]));
                return;
            }
            getSaved().then(setItems);
        }, [params.confirmed, params.action])
    );

    const handleRemove = async (id: string) => {
        await removeDefinition(id);
        setItems((prev) => prev.filter((s) => s.id !== id));
    };

    const handleClearAll = () => {
        router.push({
            pathname: "/confirm",
            params: {
                title: "Clear All",
                message: "Remove all saved definitions?",
                confirmText: "Clear",
                action: "clearSaved",
                returnPath: "/(tabs)/saved",
            },
        });
    };

    return (
        <ContentContainer
            headerTitle="Saved"
            hideBackButton
            rightIcon="delete-outline"
            showRightIcon={items.length > 0}
            onRightIconPress={handleClearAll}
            style={styles.container}
        >
            {items.length === 0 ? (
                <CenteredMessage message="No saved definitions" hint="Tap and hold a definition to save" />
            ) : (
                <CustomScrollView
                    data={items}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <HapticPressable
                                style={styles.itemContent}
                                onPress={() =>
                                    router.push({
                                        pathname: "/entry/[word]",
                                        params: { word: item.word },
                                    })
                                }
                            >
                                <StyledText style={styles.word}>{item.word}</StyledText>
                                <StyledText style={styles.definition} numberOfLines={2}>
                                    <StyledText style={styles.pos}>
                                        ({item.pos === "adjective satellite" ? "adj." : item.pos.charAt(0) + "."} ){" "}
                                    </StyledText>
                                    {item.definition}
                                </StyledText>
                            </HapticPressable>
                            <HapticPressable onPress={() => handleRemove(item.id)} style={styles.deleteBtn}>
                                <MaterialIcons name="close" size={n(20)} color={color} style={{ opacity: 0.4 }} />
                            </HapticPressable>
                        </View>
                    )}
                />
            )}
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: n(20),
    },
    listContent: {
        gap: n(20),
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: n(12),
    },
    itemContent: {
        flex: 1,
        gap: n(2),
    },
    word: {
        fontSize: n(26),
    },
    pos: {
        fontSize: n(16),
        opacity: 0.4,
    },
    definition: {
        fontSize: n(16),
        opacity: 0.6,
    },
    deleteBtn: {
        padding: n(4),
    },
});
