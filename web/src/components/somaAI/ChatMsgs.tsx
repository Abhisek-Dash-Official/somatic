"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import MarkdownMsg from "./MarkdownMsg";
import { Activity, Droplets, Moon, Stethoscope } from "lucide-react";

type Message = { id: string; role: "user" | "assistant"; content: string };
type Props = {
    messages: Message[];
    user?: { username?: string; avatar_id?: string | number } | null;
    error: string;
    onSuggest: (text: string) => void;
};

const suggestions = [
    { icon: Stethoscope, text: "What could be causing my headache?" },
    { icon: Activity, text: "Explain my symptoms in simple terms" },
    { icon: Moon, text: "How can I improve my sleep?" },
    { icon: Droplets, text: "What should I know before a blood test?" },
];

export default function ChatMessages({ messages, user, error, onSuggest }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "auto" });
    }, [messages, error]);

    return (
        <div ref={ref} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-3xl px-3 pb-36 pt-14 sm:px-6 sm:pb-40 sm:pt-8 lg:max-w-4xl">
                <div className="space-y-5 sm:space-y-6">
                    {messages.map((m) => {
                        const isUser = m.role === "user";

                        return (
                            <div key={m.id} className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                                <div className={`relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-border sm:h-9 sm:w-9 ${isUser ? "hidden sm:block" : ""}`}>
                                    <Image
                                        src={isUser ? `/avatars/avatar-${user?.avatar_id || "1"}.png` : "/soma-ai.png"}
                                        alt={isUser ? user?.username || "You" : "SOMA AI"}
                                        fill
                                        sizes="36px"
                                        className="object-cover"
                                    />
                                </div>

                                <div className={`flex min-w-0 flex-col ${isUser ? "max-w-[90%] items-end sm:max-w-[75%]" : "flex-1 items-start"}`}>
                                    <span className={`mb-1 px-1 text-[11px] font-medium text-muted sm:text-xs ${isUser ? "hidden sm:block" : ""}`}>
                                        {isUser ? user?.username || "You" : "SOMA AI"}
                                    </span>

                                    <div className={`min-w-0 max-w-full overflow-x-auto rounded-2xl px-3.5 py-2.5 text-[15px] leading-6 sm:px-4 sm:py-3 sm:text-sm ${isUser ? "rounded-tr-sm bg-primary text-primary-foreground shadow-sm" : "w-full rounded-tl-sm border border-border bg-surface text-foreground shadow-sm"}`}>
                                        {isUser ? (
                                            <p className="whitespace-pre-wrap wrap-anywhere">{m.content}</p>
                                        ) : m.content ? (
                                            <MarkdownMsg content={m.content} />
                                        ) : (
                                            <div className="flex items-center gap-1.5 py-1" aria-label="SOMA is typing">
                                                {[0, 150, 300].map((d) => (
                                                    <span key={d} style={{ animationDelay: `${d}ms` }} className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {messages.length === 1 && (
                    <div className="mt-7 sm:pl-12">
                        <p className="mb-2 px-1 text-xs font-semibold text-muted">Try asking</p>
                        <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
                            {suggestions.map(({ icon: Icon, text }) => (
                                <button
                                    key={text}
                                    type="button"
                                    onClick={() => onSuggest(text)}
                                    className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left text-sm text-foreground shadow-sm transition hover:border-primary/40 hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98]"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <span className="leading-5">{text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-5 text-danger">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}