"use client";
import { Volume2 } from "lucide-react";

export default function PlayAudioButton({ text, lang }: { text: string; lang: string }) {
    const playAudio = () => {
        if (!("speechSynthesis" in window)) {
            alert("Screen reader not supported.");
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        const langMap: Record<string, string> = {
            english: "en-US", hindi: "hi-IN", bengali: "bn-IN", telugu: "te-IN",
            marathi: "mr-IN", tamil: "ta-IN", urdu: "ur-IN", gujarati: "gu-IN",
            kannada: "kn-IN", malayalam: "ml-IN", odia: "or-IN", punjabi: "pa-IN",
        };
        utterance.lang = langMap[lang.toLowerCase()] || "en-US";
        window.speechSynthesis.speak(utterance);
    };

    return (
        <button
            type="button"
            onClick={playAudio}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
        >
            <Volume2 className="w-4 h-4" /> Listen
        </button>
    );
}