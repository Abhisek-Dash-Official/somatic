"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pill, X } from "lucide-react";

interface Props {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onChangeIndex?: (index: number) => void;
}

export default function MedicineLightbox({
    images,
    currentIndex,
    onClose,
    onChangeIndex,
}: Props) {
    const totalImages = images.length;
    const currentImg = images[currentIndex];

    const goPrevious = useCallback(() => {
        if (totalImages <= 1) return;

        const newIndex =
            currentIndex === 0 ? totalImages - 1 : currentIndex - 1;

        onChangeIndex?.(newIndex);
    }, [currentIndex, totalImages, onChangeIndex]);

    const goNext = useCallback(() => {
        if (totalImages <= 1) return;

        const newIndex =
            currentIndex === totalImages - 1 ? 0 : currentIndex + 1;

        onChangeIndex?.(newIndex);
    }, [currentIndex, totalImages, onChangeIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") goPrevious();
            if (e.key === "ArrowRight") goNext();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, goPrevious, goNext]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <button
                type="button"
                onClick={onClose}
                aria-label="Close image preview"
                className="absolute right-5 top-5 z-20 rounded-full border border-border bg-surface-secondary p-2.5 text-muted transition-colors hover:bg-accent hover:text-accent-foreground"
            >
                <X className="h-5 w-5" />
            </button>

            <div className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col items-center justify-center">
                <div className="relative flex h-full min-h-100 w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface">
                    {totalImages > 1 && (
                        <button
                            type="button"
                            onClick={goPrevious}
                            aria-label="Previous image"
                            className="absolute left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-secondary text-foreground shadow-lg transition-colors hover:bg-accent hover:text-accent-foreground md:left-6 md:h-12 md:w-12"
                        >
                            <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
                        </button>
                    )}

                    {currentImg ? (
                        <Image
                            src={currentImg}
                            alt={`Medicine preview ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            unoptimized
                            priority
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Pill className="h-16 w-16" />
                            <span className="text-sm">No Image Available</span>
                        </div>
                    )}

                    {totalImages > 1 && (
                        <button
                            type="button"
                            onClick={goNext}
                            aria-label="Next image"
                            className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-secondary text-foreground shadow-lg transition-colors hover:bg-accent hover:text-accent-foreground md:right-6 md:h-12 md:w-12"
                        >
                            <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
                        </button>
                    )}
                </div>

                <div className="mt-4 rounded-full border border-border bg-surface-secondary px-4 py-2 text-xs font-mono text-muted">
                    {totalImages > 0
                        ? `${currentIndex + 1} / ${totalImages}`
                        : "0 / 0"}
                </div>

                {totalImages > 1 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        Use ← → to navigate · Esc to close
                    </div>
                )}
            </div>
        </div>
    );
}