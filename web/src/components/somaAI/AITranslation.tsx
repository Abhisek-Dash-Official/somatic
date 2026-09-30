"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import ChatInput from "./ChatInput";

export type TranslationConversation = {
    id: string;
    userText: string;
    assistantText: string;
    targetLanguage: string;
};

type Props = {
    onConversationCreated?: (id: string) => void;
    selectedConversation?: TranslationConversation | null;
    resetKey?: number;
};

export default function AITranslation({ onConversationCreated, selectedConversation, resetKey = 0 }: Props) {
    const [input, setInput] = useState("");
    const [language, setLanguage] = useState("Hindi");
    const [result, setResult] = useState("");
    const [sourceText, setSourceText] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    useEffect(() => {
        if (selectedConversation === undefined) return;

        if (!selectedConversation) {
            setConversationId(null);
            setResult("");
            setSourceText("");
            setInput("");
            return;
        }

        setConversationId(selectedConversation.id);
        setSourceText(selectedConversation.userText);
        setResult(selectedConversation.assistantText);
        setLanguage(selectedConversation.targetLanguage);
        setInput("");
    }, [selectedConversation]);

    useEffect(() => {
        if (!resetKey) return;

        setConversationId(null);
        setResult("");
        setSourceText("");
        setInput("");
    }, [resetKey]);

    const translate = async () => {
        const text = input.trim();

        if (!text || loading) return;

        setLoading(true);
        setResult("");

        try {
            const res = await fetch("/api/soma/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, target_language: language, conversation_id: conversationId }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Unable to translate text.");

            const newConversationId = res.headers.get("X-Conversation-Id");

            if (newConversationId) {
                setConversationId(newConversationId);
                onConversationCreated?.(newConversationId);
            }

            setSourceText(text);
            setResult(data.translated_text);
            setInput("");
        } catch (error) {
            setResult(error instanceof Error ? error.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="relative flex min-h-0 flex-1 flex-col pb-28">
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-3xl">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                            <Languages className="h-5 w-5" />
                        </div>

                        <div>
                            <h1 className="text-lg font-semibold text-foreground">AI Translation</h1>
                            <p className="text-sm text-muted">Translate healthcare-related text into your preferred language.</p>
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="mb-2 block text-sm font-medium text-foreground">Translate to</label>

                        <input
                            type="text"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            disabled={loading}
                            className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary"
                        />
                    </div>

                    {sourceText && (
                        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Original</p>
                            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{sourceText}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="rounded-xl border border-border bg-surface p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted">Translation</p>
                                <span className="text-xs text-primary">Translating...</span>
                            </div>

                            <div className="space-y-2">
                                <div className="h-3 w-full animate-pulse bg-surface-secondary" />
                                <div className="h-3 w-5/6 animate-pulse bg-surface-secondary" />
                                <div className="h-3 w-2/3 animate-pulse bg-surface-secondary" />
                            </div>
                        </div>
                    ) : result ? (
                        <div className="rounded-xl border border-border bg-surface p-4">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Translation</p>
                            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{result}</p>
                        </div>
                    ) : null}
                </div>
            </div>

            <ChatInput
                value={input}
                onChange={setInput}
                onSend={translate}
                disabled={loading}
                inpPlaceholder={`Translate to ${language}...`}
            />
        </section>
    );
}