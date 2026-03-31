import { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import CustomScrollView from "@/components/CustomScrollView";
import { ListItem } from "@/components/ListItem";
import { CenteredMessage } from "@/components/CenteredMessage";
import { searchWord, SearchResult } from "@/utils/db";
import { n } from "@/utils/scaling";

export default function SearchResultsScreen() {
    const params = useLocalSearchParams<{ query: string }>();
    const query = Array.isArray(params.query) ? params.query[0] : params.query;
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setNotFound(false);
        searchWord(query)
            .then((data) => {
                setResults(data);
                setNotFound(data.length === 0);
                setLoading(false);
            })
            .catch(() => {
                setNotFound(true);
                setLoading(false);
            });
    }, [query]);

    if (!query) {
        return <ContentContainer headerTitle=" " style={styles.container} />;
    }

    if (loading) {
        return (
            <ContentContainer headerTitle={query} style={styles.container}>
                <CenteredMessage message="Loading..." />
            </ContentContainer>
        );
    }

    if (notFound) {
        return (
            <ContentContainer headerTitle={query} style={styles.container}>
                <CenteredMessage message={`No results for "${query}"`} />
            </ContentContainer>
        );
    }

    return (
        <ContentContainer headerTitle={query} style={styles.container}>
            <CustomScrollView
                data={results}
                renderItem={({ item }) => (
                    <ListItem
                        primaryText={item.word}
                        secondaryText={`${item.pos} · ${item.definition}`}
                        onPress={() =>
                            router.push({
                                pathname: "/entry/[word]",
                                params: { word: item.word },
                            })
                        }
                    />
                )}
                keyExtractor={(item) => String(item.id)}
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
        gap: n(20),
    },
});
