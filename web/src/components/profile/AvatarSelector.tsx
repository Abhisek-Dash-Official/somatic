"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, X, Camera } from "lucide-react";

interface AvatarSelectorProps {
    currentAvatarId?: string;
    onSelect: (avatarId: string) => void;
    isAdmin?: boolean;
}

export default function AvatarSelector({
    currentAvatarId = "1",
    onSelect,
    isAdmin = false,
}: AvatarSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };

        if (isOpen) window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const avatarOptions = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

    if (isAdmin) avatarOptions.unshift("admin");

    const currentAvatarSrc = `/avatars/avatar-${currentAvatarId || "1"}.png`;

    return (
        <>
            <div className="group relative inline-block">
                <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-primary/30 bg-accent transition group-hover:border-primary">
                    <img
                        src={currentAvatarSrc}
                        alt="User Avatar"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/avatars/avatar-1.png";
                        }}
                    />
                </div>

                <button
                    onClick={() => setIsOpen(true)}
                    type="button"
                    className="absolute bottom-0 right-0 rounded-full border-2 border-background bg-primary p-2 text-primary-foreground transition hover:bg-primary-hover"
                >
                    <Camera className="h-4 w-4" />
                </button>
            </div>

            {mounted &&
                isOpen &&
                createPortal(
                    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                        <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
                            <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-secondary p-5">
                                <h2 className="text-lg font-bold text-foreground">
                                    Choose Avatar
                                </h2>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-lg p-1.5 text-muted transition hover:bg-accent hover:text-foreground"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                                    {avatarOptions.map((id) => {
                                        const isSelected = currentAvatarId === id;

                                        return (
                                            <button
                                                key={id}
                                                onClick={() => {
                                                    onSelect(id);
                                                    setIsOpen(false);
                                                }}
                                                className={`relative aspect-square rounded-full border-2 p-1 transition-all ${isSelected
                                                    ? "scale-105 border-primary bg-accent"
                                                    : "border-transparent hover:border-border hover:bg-surface-secondary"
                                                    }`}
                                            >
                                                <img
                                                    src={`/avatars/avatar-${id}.png`}
                                                    alt={`Avatar ${id}`}
                                                    className="h-full w-full rounded-full object-cover"
                                                />

                                                {isSelected && (
                                                    <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-surface bg-primary p-1">
                                                        <Check className="h-3 w-3 text-primary-foreground" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}