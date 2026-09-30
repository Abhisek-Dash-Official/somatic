"use client";

import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

type Props = {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled: boolean;
};

const isTouch = () => window.matchMedia("(pointer: coarse)").matches;

export default function ChatInput({
    value,
    onChange,
    onSend,
    disabled,
}: Props) {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    }, [value]);

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background px-3 pb-[env(safe-area-inset-bottom)] pt-2.5 sm:px-6 lg:left-80">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSend();
                }}
                className="mx-auto w-full max-w-3xl lg:max-w-4xl"
            >
                <div className="flex items-end gap-2 border border-border bg-surface p-1.5 shadow-sm transition focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
                    <textarea
                        ref={ref}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (
                                e.key === "Enter" &&
                                !e.shiftKey &&
                                !isTouch()
                            ) {
                                e.preventDefault();
                                onSend();
                            }
                        }}
                        rows={1}
                        maxLength={5000}
                        placeholder="Ask SOMA about your health..."
                        className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-base text-foreground outline-none placeholder:text-muted sm:text-sm"
                    />

                    <button
                        type="submit"
                        disabled={!value.trim() || disabled}
                        aria-label="Send message"
                        className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary text-primary-foreground transition hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </button>
                </div>

                <p className="py-2.5 text-center text-[10px] leading-4 text-muted sm:text-[11px]">
                    SOMA AI can make mistakes. Verify important health
                    information with a qualified professional.
                    {value.length > 4000 && (
                        <span className="ml-1">{value.length}/5000</span>
                    )}
                </p>
            </form>
        </div>
    );
}