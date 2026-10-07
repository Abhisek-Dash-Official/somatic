"use client";

import { useEffect, useState } from "react";
import { Languages, ArrowRight } from "lucide-react";
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
        <section className="relative flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-4 pb-36 pt-14 sm:px-6 sm:pb-40 sm:pt-8">
                <div className="mx-auto w-full max-w-3xl">
                    <div className="mb-7">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                            <Languages className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">SOMA AI</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">AI Translation</h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                            Translate healthcare-related text into a language that feels easier to understand.
                        </p>
                    </div>

                    <div className="mb-5 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Translate to</label>
                        <input
                            type="text"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            disabled={loading}
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        />
                    </div>

                    {sourceText && (
                        <div className="mb-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                                <span>Original</span><ArrowRight className="h-3.5 w-3.5" />
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{sourceText}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Translation</p>
                                <span className="text-xs font-medium text-primary">Translating...</span>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-full animate-pulse rounded bg-surface-secondary" />
                                <div className="h-3 w-5/6 animate-pulse rounded bg-surface-secondary" />
                                <div className="h-3 w-2/3 animate-pulse rounded bg-surface-secondary" />
                            </div>
                        </div>
                    ) : result ? (
                        <div className="rounded-2xl border border-primary/20 bg-surface p-4 shadow-sm sm:p-5">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Translation</p>
                            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{result}</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center">
                            <Languages className="mx-auto h-6 w-6 text-muted" />
                            <p className="mt-3 text-sm font-medium text-foreground">Ready to translate</p>
                            <p className="mt-1 text-xs leading-5 text-muted">Enter text below and choose your target language.</p>
                        </div>
                    )}
                </div>
            </div>

            <ChatInput value={input} onChange={setInput} onSend={translate} disabled={loading} inpPlaceholder={`Translate to ${language}...`} />
        </section>
    );
}