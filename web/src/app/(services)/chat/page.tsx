import type { Metadata } from "next";
import ChatPage from "@/components/somaAI/ChatPage";

export const metadata: Metadata = {
    title: "SOMA AI | SOMATIC",
    description: "Talk to SOMA AI for clear, responsible guidance on health, symptoms, medications, reports, and healthcare.",
};

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function Page({ searchParams }: Props) {
    const params = await searchParams;
    const tab = params.tab || "chat";

    return (
        <ChatPage tab={tab} />
    );
}