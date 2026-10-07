"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, MicOff } from "lucide-react";
import { toast } from "react-toastify";

type Props = {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled: boolean;
    inpPlaceholder?: string;
};

const isTouch = () => window.matchMedia("(pointer: coarse)").matches;

export default function ChatInput({ value, onChange, onSend, disabled, inpPlaceholder = "Ask SOMA about your health..." }: Props) {
    const ref = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    }, [value]);

    const toggleVoiceInput = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error("Voice input is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN";
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onChange(`${value}${value.trim() ? " " : ""}${transcript}`);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
    };

    useEffect(() => () => recognitionRef.current?.stop(), []);

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 pb-[env(safe-area-inset-bottom)] pt-2.5 backdrop-blur-md sm:px-5 lg:left-70">
            <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="mx-auto w-full max-w-3xl lg:max-w-4xl">
                <div className="flex items-end gap-1.5 rounded-2xl border border-border bg-surface p-1.5 shadow-lg shadow-black/5 transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                    <textarea
                        ref={ref}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && !isTouch()) {
                                e.preventDefault();
                                onSend();
                            }
                        }}
                        rows={1}
                        maxLength={5000}
                        placeholder={inpPlaceholder}
                        disabled={disabled}
                        className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-base text-foreground outline-none placeholder:text-muted disabled:opacity-60 sm:text-sm"
                    />

                    <button
                        type="button"
                        onClick={toggleVoiceInput}
                        disabled={disabled}
                        aria-label={isListening ? "Stop voice input" : "Start voice input"}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${isListening ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface-secondary hover:text-foreground"}`}
                    >
                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>

                    <button
                        type="submit"
                        disabled={!value.trim() || disabled}
                        aria-label="Send message"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </button>
                </div>

                <p className="py-2.5 text-center text-[10px] leading-4 text-muted sm:text-[11px]">
                    SOMA AI can make mistakes. Verify important health information with a qualified professional.
                    {value.length > 4000 && <span className="ml-1">{value.length}/5000</span>}
                </p>
            </form>
        </div>
    );
}