"use client";

import { useEffect, useState } from "react";
import { Menu, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { useUserStore } from "@/store/useUserStore";
import ChatSidebar from "./ChatSidebar";
import ChatMessages from "./ChatMsgs";
import ChatInput from "./ChatInput";
import SomaFeatureUnavailable from "./FeatureUnavailable";
import AITranslation, { type TranslationConversation } from "./AITranslation";

export type Conversation = { _id: string; title: string; summary: string; last_message_at: string; created_at: string };
export type Message = { id: string; role: "user" | "assistant"; content: string };
type Props = { tab?: string };

const greeting: Message = {
    id: "greeting",
    role: "assistant",
    content: "Hi! I'm **SOMA**, your healthcare assistant. Ask me about symptoms, medications, reports or wellness, and I'll help you understand your next steps.\n\nI can't give a definitive diagnosis or replace a doctor, so please see a healthcare professional for anything serious or urgent.",
};

const errMsg = (e: unknown, fallback: string) => e instanceof Error ? e.message : fallback;

const assertOk = async (res: Response, fallback: string) => {
    if (res.ok) return;
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || d.message || fallback);
};

const jsonInit = (method: string, body: unknown): RequestInit => ({
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
});

export default function ChatPage({ tab = "chat" }: Props) {
    const { user, fetchUser, isFetched } = useUserStore();
    const [messages, setMessages] = useState<Message[]>([greeting]);
    const [input, setInput] = useState("");
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [loadingList, setLoadingList] = useState(true);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [deleteConversationModal, setDeleteConversationModal] = useState<Conversation | null>(null);
    const [selectedTranslation, setSelectedTranslation] = useState<TranslationConversation | null>(null);
    const [translationResetKey, setTranslationResetKey] = useState(0);

    useEffect(() => {
        if (!isFetched) fetchUser();
    }, [fetchUser, isFetched]);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const res = await fetch("/api/soma/conversations", { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to load conversations.");
            setConversations((await res.json()).conversations || []);
        } catch (e) {
            console.error("Failed to load SOMA conversations:", e);
            toast.error(errMsg(e, "Failed to load conversations."));
        } finally {
            setLoadingList(false);
        }
    };

    const startNewChat = () => {
        if (isStreaming) return;
        setConversationId(null);
        setMessages([greeting]);
        setInput("");
        setError("");
        setSelectedTranslation(null);
        setTranslationResetKey((key) => key + 1);
        setSidebarOpen(false);
    };

    const loadConversation = async (id: string) => {
        if (isStreaming) return;

        try {
            setError("");
            const res = await fetch(`/api/soma/conversations/${id}`, { cache: "no-store" });
            await assertOk(res, "Failed to load conversation.");

            const data = await res.json();
            const conversation = data.conversation;
            const messages = data.messages || [];
            const isTranslation = conversation.summary?.startsWith("[translation]") || conversation.title?.startsWith("Translate to ");

            setConversationId(conversation._id);

            if (isTranslation) {
                const reversedMessages = [...messages].reverse();
                const userMessage = reversedMessages.find((m: { role: string }) => m.role === "user");
                const assistantMessage = reversedMessages.find((m: { role: string }) => m.role === "assistant");
                const targetLanguage = conversation.summary?.startsWith("[translation]")
                    ? conversation.summary.replace("[translation]", "").trim() || "Hindi"
                    : conversation.title?.match(/^Translate to ([^:]+):/)?.[1] || "Hindi";

                const userText = userMessage?.content?.replace(/^\[Translate to [^\]]+\]\n\n/, "") || "";

                setSelectedTranslation({
                    id: conversation._id,
                    userText,
                    assistantText: assistantMessage?.content || "",
                    targetLanguage,
                });
                setSidebarOpen(false);
                return;
            }

            setSelectedTranslation(null);
            setMessages(messages.map((m: { _id: string; role: "user" | "assistant"; content: string }) => ({
                id: m._id,
                role: m.role,
                content: m.content,
            })));
            setSidebarOpen(false);
        } catch (e) {
            const message = errMsg(e, "Failed to load conversation.");
            setError(message);
            toast.error(message);
        }
    };

    const renameConversation = async (id: string, title: string) => {
        try {
            const res = await fetch(`/api/soma/conversations/${id}`, jsonInit("PATCH", { title }));
            await assertOk(res, "Failed to rename conversation.");
            const data = await res.json();

            setConversations((list) => list.map((c) => c._id === id ? { ...c, title: data.conversation.title } : c));
            toast.success("Conversation renamed successfully.");
        } catch (e) {
            const message = errMsg(e, "Failed to rename conversation.");
            setError(message);
            toast.error(message);
        }
    };

    const openDeleteConversationModal = (id: string) => {
        if (isStreaming) return;
        const conversation = conversations.find((c) => c._id === id);
        if (conversation) setDeleteConversationModal(conversation);
    };

    const deleteConversation = async () => {
        if (!deleteConversationModal || isStreaming) return;

        const id = deleteConversationModal._id;

        try {
            setError("");
            const res = await fetch(`/api/soma/conversations/${id}`, { method: "DELETE" });
            await assertOk(res, "Failed to delete conversation.");

            setConversations((list) => list.filter((c) => c._id !== id));
            if (conversationId === id) startNewChat();
            setDeleteConversationModal(null);
            toast.success("Conversation deleted successfully.");
        } catch (e) {
            const message = errMsg(e, "Failed to delete conversation.");
            setError(message);
            toast.error(message);
        }
    };

    const sendMessage = async (value?: string) => {
        const message = (value ?? input).trim();
        if (!message || isStreaming) return;

        const assistantId = crypto.randomUUID();
        const append = (text: string) => setMessages((list) => list.map((m) => m.id === assistantId ? { ...m, content: m.content + text } : m));

        setInput("");
        setError("");
        setIsStreaming(true);

        setMessages((list) => [
            ...list,
            { id: crypto.randomUUID(), role: "user", content: message },
            { id: assistantId, role: "assistant", content: "" },
        ]);

        try {
            const res = await fetch("/api/soma/chat", jsonInit("POST", { message, conversation_id: conversationId }));
            await assertOk(res, "Unable to connect to SOMA AI.");

            const newId = res.headers.get("X-Conversation-Id");
            if (newId) setConversationId(newId);
            if (!res.body) throw new Error("No response received from SOMA AI.");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const events = buffer.split("\n\n");
                buffer = events.pop() || "";

                for (const event of events) {
                    const line = event.split("\n").find((l) => l.startsWith("data: "));
                    if (!line) continue;

                    const data = JSON.parse(line.slice(6));
                    if (data.type === "delta" && data.content) append(data.content);
                    if (data.type === "error") throw new Error(data.message || "SOMA AI encountered an error.");
                }
            }

            await loadConversations();
        } catch (e) {
            const message = errMsg(e, "Something went wrong.");
            setError(message);
            setMessages((list) => list.filter((m) => m.id !== assistantId || m.content.trim()));
            toast.error(message);
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <>
            <main className="relative flex h-[calc(100dvh-4rem)] min-h-0 overflow-hidden bg-background text-foreground">
                <ChatSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    conversations={conversations}
                    loading={loadingList}
                    activeId={conversationId}
                    activeTab={tab}
                    isStreaming={isStreaming}
                    onNew={startNewChat}
                    onSelect={loadConversation}
                    onRename={renameConversation}
                    onDelete={openDeleteConversationModal}
                />

                <section className="relative flex min-w-0 flex-1 flex-col">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open chat sidebar"
                        className="absolute left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted shadow-sm transition hover:bg-surface-secondary hover:text-foreground active:scale-95 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {tab === "chat" ? (
                        <>
                            <ChatMessages messages={messages} user={user} error={error} onSuggest={sendMessage} />
                            <ChatInput value={input} onChange={setInput} onSend={() => sendMessage()} disabled={isStreaming} />
                        </>
                    ) : tab === "translation" ? (
                        <AITranslation
                            selectedConversation={selectedTranslation}
                            resetKey={translationResetKey}
                            onConversationCreated={(id) => {
                                setConversationId(id);
                                loadConversations();
                            }}
                        />
                    ) : (
                        <SomaFeatureUnavailable />
                    )}
                </section>
            </main>

            {deleteConversationModal && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
                    onMouseDown={(e) => e.target === e.currentTarget && setDeleteConversationModal(null)}
                >
                    <div role="dialog" aria-modal="true" aria-labelledby="delete-conversation-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
                        <div className="flex items-start justify-between border-b border-border px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-danger/20 bg-danger/10 text-danger">
                                    <Trash2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 id="delete-conversation-title" className="text-sm font-semibold text-foreground">Delete conversation?</h2>
                                    <p className="mt-0.5 text-xs text-muted">This action cannot be undone.</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setDeleteConversationModal(null)} disabled={isStreaming} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-secondary hover:text-foreground disabled:opacity-50">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="px-5 py-5 sm:px-6">
                            <p className="text-sm leading-6 text-muted">
                                You are about to permanently delete
                                <span className="font-medium text-foreground">{" "}&quot;{deleteConversationModal.title}&quot;</span>.
                                All messages in this conversation will also be removed.
                            </p>
                        </div>

                        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                            <button
                                type="button"
                                onClick={() => setDeleteConversationModal(null)}
                                disabled={isStreaming}
                                className="h-10 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:bg-surface-secondary disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={deleteConversation}
                                disabled={isStreaming}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-danger px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete conversation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}