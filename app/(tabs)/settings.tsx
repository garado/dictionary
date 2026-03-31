import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { StyledButton } from "@/components/StyledButton";
import ContentContainer from "@/components/ContentContainer";
import * as Application from "expo-application";

export default function SettingsScreen() {
    const params = useLocalSearchParams<{ confirmed?: string; action?: string }>();
    const version = Application.nativeApplicationVersion;

    return (
        <ContentContainer headerTitle={`Settings (v${version})`} hideBackButton>
            <StyledButton text="Customise" onPress={() => router.push("/settings/customise" as any)} />
        </ContentContainer>
    );
}
