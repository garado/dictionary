import { useState, useEffect } from "react";
import { StyleSheet, View, Text, Pressable, Modal } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import CustomScrollView from "@/components/CustomScrollView";
import { CenteredMessage } from "@/components/CenteredMessage";
import { getEntry, EntryMeaning } from "@/utils/db";
import { saveDefinition } from "@/utils/saved";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";

function SavedToast({ visible }: { visible: boolean }) {
    return (
        <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
            <View style={styles.toast}>
                <StyledText style={styles.toastText}>saved</StyledText>
            </View>
        </Modal>
    );
}


export default function EntryScreen() {
    const params = useLocalSearchParams<{ word: string }>();
    const word = Array.isArray(params.word) ? params.word[0] : params.word;
    const { invertColors } = useInvertColors();
    const [meanings, setMeanings] = useState<EntryMeaning[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        if (!word) { setLoading(false); return; }
        setLoading(true);
        getEntry(word)
            .then((data) => { setMeanings(data); setNotFound(data.length === 0); setLoading(false); })
            .catch(() => { setNotFound(true); setLoading(false); });
    }, [word]);

    const handleSave = (meaning: EntryMeaning) => {
        saveDefinition({
            id: String(meaning.id),
            word: word ?? "",
            pos: meaning.pos,
            definition: meaning.definition,
        });
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 1000);
    };

    const title = word ?? "";

    if (loading) {
        return (
            <ContentContainer headerTitle={title} style={styles.container}>
                <CenteredMessage message="Loading..." />
            </ContentContainer>
        );
    }

    if (notFound || meanings.length === 0) {
        return (
            <ContentContainer headerTitle={title} style={styles.container}>
                <CenteredMessage message="Word not found" />
            </ContentContainer>
        );
    }

    return (
        <ContentContainer headerTitle={title} style={styles.container}>
            <SavedToast visible={toastVisible} />
            <CustomScrollView
                data={meanings}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item: meaning }) => (
                    <Pressable
                        onLongPress={() => handleSave(meaning)}
                        delayLongPress={1000}
                        android_disableSound
                    >
                        <View style={styles.meaningBlock}>
                            <StyledText style={styles.pos}>
                                {meaning.pos}
                            </StyledText>
                            <StyledText style={styles.definition}>
                                {meaning.definition}
                            </StyledText>
                            {meaning.examples[0] && (
                                <StyledText style={styles.example}>
                                    "{meaning.examples[0]}"
                                </StyledText>
                            )}
                            {meaning.synonyms.length > 0 && (
                                <StyledText style={styles.related}>
                                    Synonyms: {meaning.synonyms.join(", ")}
                                </StyledText>
                            )}
                            {meaning.antonyms.length > 0 && (
                                <StyledText style={styles.related}>
                                    Antonyms: {meaning.antonyms.join(", ")}
                                </StyledText>
                            )}
                        </View>
                    </Pressable>
                )}
                contentContainerStyle={styles.listContent}
            />
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: n(20),
    },
    listContent: {
        gap: n(24),
    },
    meaningBlock: {
        gap: n(4),
    },
    pos: {
        fontSize: n(18),
        opacity: 0.4,
    },
    definition: {
        fontSize: n(18),
    },
    example: {
        fontSize: n(16),
        opacity: 0.6,
    },
    related: {
        fontSize: n(16),
        opacity: 0.5,
    },
    toast: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    toastText: {
        fontSize: n(32),
        color: "white",
    },
});
