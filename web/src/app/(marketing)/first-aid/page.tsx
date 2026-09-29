"use client";

import { useEffect, useState } from "react";
import { Search, ShieldAlert, HeartPulse, Bandage, Thermometer, AlertTriangle, X, Image as ImageIcon, Video, ChevronLeft, ChevronRight } from "lucide-react";
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
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.short_desc.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = activeCategory === "All" || item.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "high":
                return "text-danger bg-danger/10 border-danger/20";
            case "medium":
                return "text-warning bg-warning/10 border-warning/20";
            case "low":
                return "text-info bg-info/10 border-info/20";
            default:
                return "text-muted bg-surface-secondary border-border";
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
        <div className="mx-auto w-full max-w-5xl space-y-6 p-4 pt-20 text-foreground sm:space-y-8 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        <div className="shrink-0 rounded-xl border border-danger/20 bg-danger/10 p-2.5">
                            <ShieldAlert className="h-6 w-6 text-danger" />
                        </div>
                        Emergency & First-Aid Guide
                    </h1>

                    <p className="mt-2 text-sm text-muted sm:text-base">
                        Zero-latency offline access for critical triage steps and home care protocols.
                    </p>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />

                    <p className="text-sm leading-relaxed text-foreground">
                        <strong className="font-bold text-warning">Medical Disclaimer:</strong>{" "}
                        This guide is for informational and first-aid purposes only. It does not replace professional medical advice, diagnosis, or treatment. In a severe emergency, call your local emergency services immediately.
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 md:flex-row">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for symptoms or injuries..."
                        className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                    />
                </div>

                <div className="flex w-full gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setActiveCategory(category)}
                            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${activeCategory === category
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-surface-secondary text-muted hover:bg-accent hover:text-accent-foreground"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-16">
                    <Search className="mb-4 h-10 w-10 text-muted-foreground" />
                    <p className="text-lg font-medium text-muted">No matching guides found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredData.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item as FirstAidItem)}
                            className="flex h-full cursor-pointer flex-col rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:border-primary/40 hover:bg-surface-secondary"
                        >
                            <div className="mb-3 flex gap-4">
                                <div className="h-fit shrink-0 rounded-xl border border-border bg-surface-secondary p-3">
                                    {getCategoryIcon(item.category)}
                                </div>

                                <div>
                                    <h2 className="mb-1 text-lg font-bold leading-tight text-foreground">
                                        {item.title}
                                    </h2>

                                    <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(item.severity)}`}>
                                        {item.severity}
                                    </span>
                                </div>
                            </div>

                            <p className="mt-auto line-clamp-3 text-sm text-muted">
                                {item.short_desc}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {selectedItem && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/70 p-4 backdrop-blur-sm duration-200">
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-background shadow-2xl">
                        <div className="flex shrink-0 items-start justify-between border-b border-border p-5">
                            <div className="flex gap-4">
                                <div className="h-fit shrink-0 rounded-xl border border-border bg-surface p-3">
                                    {getCategoryIcon(selectedItem.category)}
                                </div>

                                <div>
                                    <h2 className="mb-1 text-xl font-bold text-foreground">
                                        {selectedItem.title}
                                    </h2>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-muted">
                                            {selectedItem.category}
                                        </span>

                                        <span className="h-1 w-1 rounded-full bg-muted-foreground" />

                                        <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(selectedItem.severity)}`}>
                                            {selectedItem.severity}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeGuide}
                                className="rounded-lg bg-surface-secondary p-1 text-muted transition hover:bg-accent hover:text-foreground"
                                aria-label="Close guide"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-6 overflow-y-auto p-5 sm:p-6">
                            {selectedItem.img_urls && selectedItem.img_urls.length > 0 && (
                                <div>
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
                                                <div className="relative">
                                                    <img
                                                        src={imageUrl}
                                                        alt={`${selectedItem.title} reference ${index + 1}`}
                                                        loading="lazy"
                                                        className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
                                                    />

                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                                                        <span className="rounded-lg bg-black/70 px-3 py-2 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                                                            Click to view
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                                                    Image {index + 1} of {selectedItem.img_urls?.length}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="rounded-xl border border-border bg-surface-secondary p-4 text-sm text-muted">
                                {selectedItem.short_desc}
                            </p>

                            <div>
                                <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                                    <HeartPulse className="h-4 w-4 text-primary" />
                                    Action Steps
                                </h4>

                                <ol className="space-y-4">
                                    {selectedItem.steps.map((step, idx) => (
                                        <li
                                            key={idx}
                                            className="flex gap-4 rounded-xl border border-border bg-surface-secondary p-3 text-sm text-muted"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-accent text-sm font-bold text-primary">
                                                {idx + 1}
                                            </span>

                                            <span className="mt-1 leading-relaxed">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {selectedItem.video_urls && selectedItem.video_urls.length > 0 && (
                                <div>
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
                                                className="flex items-center gap-3 rounded-xl border border-border bg-surface-secondary p-3 text-sm text-primary transition hover:border-primary/40 hover:bg-accent"
                                            >
                                                <Video className="h-5 w-5 shrink-0 text-danger" />
                                                <span>Watch Video {index + 1}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedItem.warnings.length > 0 && (
                                <div className="mt-6 rounded-xl border border-danger/20 bg-danger/10 p-5">
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-danger">
                                        <ShieldAlert className="h-5 w-5" />
                                        Important Warnings
                                    </h4>

                                    <ul className="list-disc space-y-2 pl-5">
                                        {selectedItem.warnings.map((warn, idx) => (
                                            <li key={idx} className="text-sm font-medium leading-relaxed text-foreground">
                                                {warn}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex shrink-0 justify-end border-t border-border bg-surface p-4">
                            <button
                                type="button"
                                onClick={closeGuide}
                                className="rounded-xl bg-surface-secondary px-6 py-2 text-sm font-bold text-foreground transition hover:bg-accent"
                            >
                                Close Guide
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedItem && selectedImageIndex !== null && selectedItem.img_urls?.[selectedImageIndex] && (
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

                    <div className="relative flex h-full w-full items-center justify-center" onClick={(event) => event.stopPropagation()}>
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