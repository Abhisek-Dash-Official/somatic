"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Check, X } from "lucide-react";

interface AvatarSelectorProps {
    currentAvatarId?: string;
    onSelect: (avatarId: string) => void;
    isAdmin?: boolean;
}

export default function AvatarSelector({ currentAvatarId = "1", onSelect, isAdmin = false }: AvatarSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const avatarOptions = Array.from({ length: 20 }, (_, i) => String(i + 1));
    if (isAdmin) avatarOptions.unshift("admin");

    const currentAvatarSrc = `/avatars/avatar-${currentAvatarId || "1"}.png`;

    return (
        <>
            <div className="group relative inline-flex">
                <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-surface-secondary shadow-sm transition group-hover:border-primary/50 sm:h-28 sm:w-28">
                    <img
                        src={currentAvatarSrc}
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/avatars/avatar-1.png";
                        }}
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Change avatar"
                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-primary text-primary-foreground shadow-md transition hover:bg-primary-hover active:scale-95"
                >
                    <Camera className="h-4 w-4" />
                </button>
            </div>

            {mounted && isOpen && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setIsOpen(false);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="avatar-selector-title"
                        className="flex max-h-[min(720px,90dvh)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
                    >
                        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                            <div>
                                <h2 id="avatar-selector-title" className="text-base font-semibold text-foreground">
                                    Choose your avatar
                                </h2>
                                <p className="mt-1 text-xs text-muted">
                                    Select an avatar for your SOMATIC profile.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close avatar selector"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-surface-secondary hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
                            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                                {avatarOptions.map((id) => {
                                    const isSelected = currentAvatarId === id;

                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => {
                                                onSelect(id);
                                                setIsOpen(false);
                                            }}
                                            aria-label={`Select avatar ${id}`}
                                            aria-pressed={isSelected}
                                            className={`group relative aspect-square rounded-full border-2 p-1.5 transition-all ${isSelected
                                                    ? "scale-[1.03] border-primary bg-accent shadow-sm"
                                                    : "border-transparent hover:border-border hover:bg-surface-secondary"
                                                }`}
                                        >
                                            <img
                                                src={`/avatars/avatar-${id}.png`}
                                                alt={`Avatar ${id}`}
                                                className="h-full w-full rounded-full object-cover"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = "/avatars/avatar-1.png";
                                                }}
                                            />

                                            {isSelected && (
                                                <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-primary shadow-sm">
                                                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                                                </span>
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