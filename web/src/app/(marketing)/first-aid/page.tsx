"use client";

import { useEffect, useState } from "react";
import {
    Search,
    ShieldAlert,
    HeartPulse,
    Bandage,
    Thermometer,
    AlertTriangle,
    X,
    Image as ImageIcon,
    Video,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import firstAidData from "@/config/first_aid.json";

interface FirstAidItem {
    id: string;
    title: string;
    category: string;
    severity: string;
    short_desc: string;
    steps: string[];
    warnings: string[];
    img_urls?: string[];
    video_urls?: string[];
}

export default function FirstAidGuidePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedItem, setSelectedItem] = useState<FirstAidItem | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const categories = ["All", ...Array.from(new Set(firstAidData.map((item) => item.category)))];

    const filteredData = firstAidData.filter((item) => {
        const query = searchQuery.toLowerCase();

        const matchesSearch =
            item.title.toLowerCase().includes(query) ||
            item.short_desc.toLowerCase().includes(query);

        const matchesCategory = activeCategory === "All" || item.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "high":
                return "border-danger/20 bg-danger/10 text-danger";
            case "medium":
                return "border-warning/20 bg-warning/10 text-warning";
            case "low":
                return "border-info/20 bg-info/10 text-info";
            default:
                return "border-border bg-surface-secondary text-muted";
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Critical Emergencies":
                return <HeartPulse className="h-5 w-5 text-danger" />;
            case "Minor Injuries":
                return <Bandage className="h-5 w-5 text-warning" />;
            case "General Illness":
                return <Thermometer className="h-5 w-5 text-info" />;
            case "Poisoning & Bites":
                return <AlertTriangle className="h-5 w-5 text-primary" />;
            default:
                return <HeartPulse className="h-5 w-5 text-primary" />;
        }
    };

    const closeGuide = () => {
        setSelectedItem(null);
        setSelectedImageIndex(null);
    };

    const openImage = (index: number) => setSelectedImageIndex(index);
    const closeImage = () => setSelectedImageIndex(null);

    const showPreviousImage = () => {
        if (!selectedItem?.img_urls?.length || selectedImageIndex === null) return;

        setSelectedImageIndex((prev) => {
            if (prev === null) return null;
            const total = selectedItem.img_urls?.length || 0;
            return prev > 0 ? prev - 1 : total - 1;
        });
    };

    const showNextImage = () => {
        if (!selectedItem?.img_urls?.length || selectedImageIndex === null) return;

        setSelectedImageIndex((prev) => {
            if (prev === null) return null;
            const total = selectedItem.img_urls?.length || 0;
            return prev < total - 1 ? prev + 1 : 0;
        });
    };

    useEffect(() => {
        document.body.style.overflow = selectedItem ? "hidden" : "unset";

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [selectedItem]);

    useEffect(() => {
        if (selectedImageIndex === null) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeImage();

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showPreviousImage();
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                showNextImage();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [selectedImageIndex, selectedItem]);

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
            <div className="space-y-5">
                <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-danger/20 bg-danger/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-danger">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Emergency Care
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        Emergency & First-Aid Guide
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                        Quick access to essential first-aid steps and emergency care guidance.
                    </p>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning/10 p-4 sm:p-5">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />

                    <p className="text-sm leading-6 text-foreground">
                        <strong className="font-bold text-warning">Medical Disclaimer:</strong>{" "}
                        This guide is for informational and first-aid purposes only. It does not
                        replace professional medical advice, diagnosis, or treatment. In a severe
                        emergency, call your local emergency services immediately.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search symptoms, injuries, or conditions..."
                            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                    </div>

                    <div className="flex w-full gap-2 overflow-x-auto pb-1 lg:w-auto lg:max-w-[60%] lg:pb-0">
                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => setActiveCategory(category)}
                                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeCategory === category
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "border border-border bg-surface-secondary text-muted hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                        <Search className="h-6 w-6" />
                    </div>

                    <p className="text-lg font-semibold text-foreground">
                        No matching guides found
                    </p>

                    <p className="mt-1 text-sm text-muted">
                        Try searching for another symptom, injury, or category.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredData.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedItem(item as FirstAidItem)}
                            className="group flex h-full cursor-pointer flex-col rounded-2xl border border-border bg-surface p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-surface-secondary hover:shadow-lg hover:shadow-primary/5"
                        >
                            <div className="mb-5 flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent transition-transform duration-300 group-hover:scale-105">
                                    {getCategoryIcon(item.category)}
                                </div>

                                <div className="min-w-0">
                                    <h2 className="mb-2 text-lg font-bold leading-tight text-foreground">
                                        {item.title}
                                    </h2>

                                    <span
                                        className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(
                                            item.severity
                                        )}`}
                                    >
                                        {item.severity}
                                    </span>
                                </div>
                            </div>

                            <p className="mt-auto line-clamp-3 text-sm leading-6 text-muted">
                                {item.short_desc}
                            </p>

                            <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs font-semibold text-primary">
                                <span>{item.category}</span>
                                <span className="opacity-0 transition-opacity group-hover:opacity-100">
                                    View guide →
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
                        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
                            <div className="flex min-w-0 gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
                                    {getCategoryIcon(selectedItem.category)}
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-xl font-bold leading-tight text-foreground">
                                        {selectedItem.title}
                                    </h2>

                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold text-muted">
                                            {selectedItem.category}
                                        </span>

                                        <span className="h-1 w-1 rounded-full bg-muted" />

                                        <span
                                            className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(
                                                selectedItem.severity
                                            )}`}
                                        >
                                            {selectedItem.severity}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeGuide}
                                className="shrink-0 rounded-xl bg-surface-secondary p-2 text-muted transition hover:bg-accent hover:text-foreground"
                                aria-label="Close guide"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-7 overflow-y-auto p-5 sm:p-6">
                            {selectedItem.img_urls && selectedItem.img_urls.length > 0 && (
                                <section>
                                    <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                                        <ImageIcon className="h-4 w-4 text-primary" />
                                        Reference Images
                                    </h4>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {selectedItem.img_urls.map((imageUrl, index) => (
                                            <button
                                                key={`${imageUrl}-${index}`}
                                                type="button"
                                                onClick={() => openImage(index)}
                                                className="group overflow-hidden rounded-xl border border-border bg-surface-secondary text-left"
                                            >
                                                <div className="relative overflow-hidden">
                                                    <img
                                                        src={imageUrl}
                                                        alt={`${selectedItem.title} reference ${index + 1}`}
                                                        loading="lazy"
                                                        className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                                                    />

                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                                                        <span className="rounded-lg bg-black/70 px-3 py-2 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                                                            Click to view
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="border-t border-border px-3 py-2 text-xs text-muted">
                                                    Image {index + 1} of {(selectedItem.img_urls ?? []).length}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <p className="rounded-xl border border-border bg-surface-secondary p-4 text-sm leading-6 text-muted">
                                {selectedItem.short_desc}
                            </p>

                            <section>
                                <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                                    <HeartPulse className="h-4 w-4 text-primary" />
                                    Action Steps
                                </h4>

                                <ol className="space-y-3">
                                    {selectedItem.steps.map((step, idx) => (
                                        <li
                                            key={idx}
                                            className="flex gap-4 rounded-xl border border-border bg-surface-secondary p-4 text-sm text-muted"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-primary">
                                                {idx + 1}
                                            </span>

                                            <span className="pt-1 leading-6">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </section>

                            {selectedItem.video_urls && selectedItem.video_urls.length > 0 && (
                                <section>
                                    <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                                        <Video className="h-4 w-4 text-danger" />
                                        Video References
                                    </h4>

                                    <div className="space-y-2">
                                        {selectedItem.video_urls.map((videoUrl, index) => (
                                            <a
                                                key={`${videoUrl}-${index}`}
                                                href={videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 rounded-xl border border-border bg-surface-secondary p-3 text-sm font-medium text-primary transition hover:border-primary/30 hover:bg-accent"
                                            >
                                                <Video className="h-5 w-5 shrink-0 text-danger" />
                                                <span>Watch Video {index + 1}</span>
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {selectedItem.warnings.length > 0 && (
                                <section className="rounded-2xl border border-danger/20 bg-danger/10 p-5">
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-danger">
                                        <ShieldAlert className="h-5 w-5" />
                                        Important Warnings
                                    </h4>

                                    <ul className="list-disc space-y-2 pl-5">
                                        {selectedItem.warnings.map((warn, idx) => (
                                            <li
                                                key={idx}
                                                className="text-sm font-medium leading-6 text-foreground"
                                            >
                                                {warn}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>

                        <div className="flex shrink-0 justify-end border-t border-border bg-surface p-4">
                            <button
                                type="button"
                                onClick={closeGuide}
                                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                            >
                                Close Guide
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedItem &&
                selectedImageIndex !== null &&
                selectedItem.img_urls?.[selectedImageIndex] && (
                    <div
                        className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
                        onClick={closeImage}
                    >
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                closeImage();
                            }}
                            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white transition hover:bg-white/10"
                            aria-label="Close image"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                showPreviousImage();
                            }}
                            className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white transition hover:bg-white/10 sm:left-6"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-7 w-7" />
                        </button>

                        <div
                            className="relative flex h-full w-full items-center justify-center"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <img
                                src={selectedItem.img_urls[selectedImageIndex]}
                                alt={`${selectedItem.title} reference ${selectedImageIndex + 1}`}
                                className="max-h-[90vh] max-w-[90vw] object-contain"
                            />

                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                                {selectedImageIndex + 1} / {selectedItem.img_urls.length}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                showNextImage();
                            }}
                            className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white transition hover:bg-white/10 sm:right-6"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-7 w-7" />
                        </button>
                    </div>
                )}
        </div>
    );
}