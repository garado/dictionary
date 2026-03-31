import { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import CustomScrollView from "@/components/CustomScrollView";
import { CenteredMessage } from "@/components/CenteredMessage";
import { getEntry, EntryMeaning } from "@/utils/db";
import { n } from "@/utils/scaling";

export default function EntryScreen() {
    const params = useLocalSearchParams<{ word: string }>();
    const word = Array.isArray(params.word) ? params.word[0] : params.word;
    const [meanings, setMeanings] = useState<EntryMeaning[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!word) {
            setLoading(false);
            return;
        }
        setLoading(true);
        getEntry(word)
            .then((data) => {
                setMeanings(data);
                setNotFound(data.length === 0);
                setLoading(false);
            })
            .catch(() => {
                setNotFound(true);
                setLoading(false);
            });
    }, [word]);

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
            <CustomScrollView
                data={meanings}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item: meaning }) => (
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
                )}
                contentContainerStyle={styles.listContent}
            />
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: n(21),
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
});
