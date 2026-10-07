"use client";

import { Volume2 } from "lucide-react";
import { toast } from "react-toastify";

const langMap: Record<string, string> = {
    english: "en-US", hindi: "hi-IN", bengali: "bn-IN", telugu: "te-IN", marathi: "mr-IN",
    tamil: "ta-IN", urdu: "ur-IN", gujarati: "gu-IN", kannada: "kn-IN", malayalam: "ml-IN",
    odia: "or-IN", punjabi: "pa-IN",
};

export default function PlayAudioButton({ text, lang }: { text: string; lang: string }) {
    const playAudio = () => {
        if (!("speechSynthesis" in window)) {
            toast.error("Text-to-speech isn't supported by your browser.");
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langMap[lang.trim().toLowerCase()] || "en-US";
        utterance.onerror = () => toast.error("Unable to play the audio.");

        window.speechSynthesis.speak(utterance);
    };

    return (
        <button type="button" onClick={playAudio} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary transition hover:bg-accent hover:text-primary-hover">
            <Volume2 className="h-4 w-4" />
            Listen
        </button>
    );
}