"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import {
    X,
    Pill,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

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
            currentIndex === 0
                ? totalImages - 1
                : currentIndex - 1;

        onChangeIndex?.(newIndex);
    }, [currentIndex, totalImages, onChangeIndex]);

    const goNext = useCallback(() => {
        if (totalImages <= 1) return;

        const newIndex =
            currentIndex === totalImages - 1
                ? 0
                : currentIndex + 1;

        onChangeIndex?.(newIndex);
    }, [currentIndex, totalImages, onChangeIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }

            if (e.key === "ArrowLeft") {
                goPrevious();
            }

            if (e.key === "ArrowRight") {
                goNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, goPrevious, goNext]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <button
                type="button"
                onClick={onClose}
                aria-label="Close image preview"
                className="absolute top-5 right-5 z-20 p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-full transition-all border border-slate-700/50 shadow-lg"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">

                {/* Image Area */}
                <div className="relative w-full h-full min-h-100 flex items-center justify-center rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800">
                    {totalImages > 1 && (
                        <button
                            type="button"
                            onClick={goPrevious}
                            aria-label="Previous image"
                            className="absolute left-4 md:left-6 z-10 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/70 shadow-xl backdrop-blur-sm transition-all hover:scale-105"
                        >
                            <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
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
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                            <Pill className="w-16 h-16" />
                            <span className="text-sm">
                                No Image Available
                            </span>
                        </div>
                    )}
                    {totalImages > 1 && (
                        <button
                            type="button"
                            onClick={goNext}
                            aria-label="Next image"
                            className="absolute right-4 md:right-6 z-10 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/70 shadow-xl backdrop-blur-sm transition-all hover:scale-105"
                        >
                            <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
                        </button>
                    )}
                </div>
                <div className="mt-4 text-slate-300 text-xs font-mono bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 shadow-md">
                    {totalImages > 0
                        ? `${currentIndex + 1} / ${totalImages}`
                        : "0 / 0"}
                </div>
                {totalImages > 1 && (
                    <div className="mt-2 text-xs text-slate-500">
                        Use ← → to navigate · Esc to close
                    </div>
                )}
            </div>
        </div>
    );
}