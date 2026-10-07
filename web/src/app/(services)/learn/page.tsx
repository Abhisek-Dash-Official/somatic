"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    Eye,
    Clock3,
    CheckCircle2,
    X,
    RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import { type ILearnDocument } from "@/models/Learn";

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

interface ApiResponse {
    success: boolean;
    data: ILearnDocument[];
    pagination: Pagination;
    message?: string;
    code?: string;
}

const DEFAULT_LIMIT = 12;

const SORT_OPTIONS = [
    { value: "created_at:desc", label: "Newest" },
    { value: "created_at:asc", label: "Oldest" },
    { value: "updated_at:desc", label: "Recently Updated" },
    { value: "views:desc", label: "Most Viewed" },
    { value: "read_time:asc", label: "Shortest Read" },
    { value: "read_time:desc", label: "Longest Read" },
    { value: "title:asc", label: "Title A-Z" },
];

export default function LearnPage() {
    const [articles, setArticles] = useState<ILearnDocument[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [tag, setTag] = useState("");
    const [status, setStatus] = useState("published");
    const [medicallyReviewed, setMedicallyReviewed] = useState("");
    const [sort, setSort] = useState("created_at:desc");
    const [categories, setCategories] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<ILearnDocument | null>(null);

    const fetchLearn = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            params.set("page", String(page));
            params.set("limit", String(DEFAULT_LIMIT));

            if (search.trim()) params.set("search", search.trim());
            if (category) params.set("category", category);
            if (tag) params.set("tag", tag);
            if (status) params.set("status", status);
            if (medicallyReviewed) params.set("medically_reviewed", medicallyReviewed);

            const [sortBy, order] = sort.split(":");

            params.set("sortBy", sortBy);
            params.set("order", order);

            const response = await fetch(`/api/learn?${params.toString()}`);
            const result: ApiResponse = await response.json();

            if (!response.ok || !result.success) {
                const message = result.message || "Failed to fetch articles";

                if (response.status === 401) {
                    toast.error(message);
                } else if (response.status === 403) {
                    toast.error(message);
                } else {
                    toast.error(message);
                }

                throw new Error(message);
            }

            setArticles(result.data);
            setPagination(result.pagination);

            const uniqueCategories = Array.from(
                new Set(result.data.map((item) => item.category).filter(Boolean))
            );

            const uniqueTags = Array.from(
                new Set(result.data.flatMap((item) => item.tags || []).filter(Boolean))
            );

            setCategories((current) =>
                Array.from(new Set([...current, ...uniqueCategories]))
            );

            setTags((current) => Array.from(new Set([...current, ...uniqueTags])));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [page, search, category, tag, status, medicallyReviewed, sort]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLearn();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchLearn]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setSelectedArticle(null);
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    useEffect(() => {
        if (!selectedArticle) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previous;
        };
    }, [selectedArticle]);

    const resetFilters = () => {
        setSearch("");
        setCategory("");
        setTag("");
        setStatus("published");
        setMedicallyReviewed("");
        setSort("created_at:desc");
        setPage(1);
    };

    const hasFilters =
        search ||
        category ||
        tag ||
        status !== "published" ||
        medicallyReviewed ||
        sort !== "created_at:desc";

    return (
        <main className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-surface">
                <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pt-16">
                    <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        Learn about your health
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                        Evidence-informed health and wellness articles, written and reviewed
                        by healthcare professionals.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search
                                size={19}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search articles, topics, authors"
                                className="h-12 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-sm outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowFilters((value) => !value)}
                            aria-expanded={showFilters}
                            className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-medium transition-colors ${showFilters
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background hover:border-primary hover:text-primary"
                                }`}
                        >
                            <SlidersHorizontal size={17} />
                            Filters
                        </button>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-medium text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="mt-3 grid gap-4 rounded-2xl border border-border bg-background p-4 sm:grid-cols-2 lg:grid-cols-5">
                            <FilterSelect
                                label="Category"
                                value={category}
                                onChange={(value) => {
                                    setCategory(value);
                                    setPage(1);
                                }}
                                options={categories.map((item) => ({
                                    value: item,
                                    label: item,
                                }))}
                                placeholder="All categories"
                            />

                            <FilterSelect
                                label="Tag"
                                value={tag}
                                onChange={(value) => {
                                    setTag(value);
                                    setPage(1);
                                }}
                                options={tags.map((item) => ({
                                    value: item,
                                    label: item,
                                }))}
                                placeholder="All tags"
                            />

                            <FilterSelect
                                label="Status"
                                value={status}
                                onChange={(value) => {
                                    setStatus(value);
                                    setPage(1);
                                }}
                                options={[
                                    { value: "published", label: "Published" },
                                    { value: "draft", label: "Draft" },
                                    { value: "archived", label: "Archived" },
                                ]}
                                placeholder="All statuses"
                            />

                            <FilterSelect
                                label="Medical review"
                                value={medicallyReviewed}
                                onChange={(value) => {
                                    setMedicallyReviewed(value);
                                    setPage(1);
                                }}
                                options={[
                                    { value: "true", label: "Medically reviewed" },
                                    { value: "false", label: "Not reviewed" },
                                ]}
                                placeholder="Any"
                            />

                            <FilterSelect
                                label="Sort by"
                                value={sort}
                                onChange={(value) => {
                                    setSort(value);
                                    setPage(1);
                                }}
                                options={SORT_OPTIONS}
                            />
                        </div>
                    )}

                    {categories.length > 0 && (
                        <nav
                            aria-label="Categories"
                            className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
                        >
                            {["", ...categories].map((item) => (
                                <button
                                    key={item || "all"}
                                    type="button"
                                    onClick={() => {
                                        setCategory(item);
                                        setPage(1);
                                    }}
                                    aria-pressed={category === item}
                                    className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${category === item
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-background text-muted hover:border-primary hover:text-primary"
                                        }`}
                                >
                                    {item || "All"}
                                </button>
                            ))}
                        </nav>
                    )}
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {pagination && !loading && (
                    <div className="mb-5 flex items-center justify-between gap-4 text-sm text-muted">
                        <p>
                            Showing{" "}
                            <span className="font-semibold text-foreground">
                                {articles.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-foreground">
                                {pagination.total}
                            </span>{" "}
                            articles
                        </p>

                        <p>
                            Page {pagination.page} of{" "}
                            {Math.max(pagination.totalPages, 1)}
                        </p>
                    </div>
                )}

                {loading ? (
                    <LoadingGrid />
                ) : error ? (
                    <div className="rounded-2xl border border-border bg-surface p-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
                            <X size={22} />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold">
                            Unable to load Learn
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchLearn}
                            className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                        >
                            Try again
                        </button>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface p-12 text-center">
                        <Search size={30} className="mx-auto text-muted" />

                        <h2 className="mt-4 text-lg font-semibold">
                            No articles found
                        </h2>

                        <p className="mt-2 text-sm text-muted">
                            Try a different search, or clear the filters.
                        </p>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {articles.map((article) => (
                                <ArticleCard
                                    key={article._id}
                                    article={article}
                                    onClick={() => setSelectedArticle(article)}
                                />
                            ))}
                        </div>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    disabled={!pagination.hasPreviousPage || loading}
                                    onClick={() => setPage((current) => current - 1)}
                                    className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={17} />
                                    <span className="hidden sm:inline">Previous</span>
                                </button>

                                <PaginationNumbers
                                    currentPage={pagination.page}
                                    totalPages={pagination.totalPages}
                                    onPageChange={setPage}
                                />

                                <button
                                    type="button"
                                    disabled={!pagination.hasNextPage || loading}
                                    onClick={() => setPage((current) => current + 1)}
                                    className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {selectedArticle && (
                <ArticleDrawer
                    article={selectedArticle}
                    onClose={() => setSelectedArticle(null)}
                />
            )}
        </main>
    );
}

function ArticleCard({
    article,
    onClick,
}: {
    article: ILearnDocument;
    onClick: () => void;
}) {
    return (
        <article className="group flex overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-primary/60">
            <button
                type="button"
                onClick={onClick}
                className="flex w-full flex-col text-left focus-visible:outline-2 focus-visible:outline-primary"
            >
                <div className="aspect-16/10 w-full overflow-hidden bg-surface-secondary">
                    {article.cover_image ? (
                        <img
                            src={article.cover_image}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted">
                            No image
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                    <p className="text-sm font-semibold text-primary">
                        {article.category}
                    </p>

                    <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug">
                        {article.title}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                        {article.desc}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1.5">
                            <Clock3 size={14} />
                            {article.read_time} min read
                        </span>

                        <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {article.views ?? 0}
                        </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        <div className="flex min-w-0 items-center gap-2.5">
                            {article.author?.avatar ? (
                                <img
                                    src={article.author.avatar}
                                    alt={article.author.name}
                                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                    {article.author?.name?.charAt(0)}
                                </div>
                            )}

                            <div className="min-w-0">
                                <p className="truncate text-xs font-medium">
                                    {article.author?.name}
                                </p>

                                {article.author?.credentials && (
                                    <p className="truncate text-[11px] text-muted">
                                        {article.author.credentials}
                                    </p>
                                )}
                            </div>
                        </div>

                        {article.is_medically_reviewed && (
                            <span
                                title="Medically reviewed"
                                className="shrink-0 text-primary"
                            >
                                <CheckCircle2 size={18} />
                            </span>
                        )}
                    </div>
                </div>
            </button>
        </article>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-semibold text-muted">
                {label}
            </span>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
                {placeholder !== undefined && (
                    <option value="">{placeholder}</option>
                )}

                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function PaginationNumbers({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);

        if (currentPage > 3) pages.push("...");

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) pages.push(i);

        if (currentPage < totalPages - 2) pages.push("...");

        pages.push(totalPages);
    }

    return (
        <div className="flex items-center gap-1">
            {pages.map((page, index) =>
                page === "..." ? (
                    <span
                        key={`ellipsis-${index}`}
                        className="flex h-10 w-8 items-center justify-center text-sm text-muted"
                    >
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        type="button"
                        onClick={() =>
                            typeof page === "number" && onPageChange(page)
                        }
                        aria-current={
                            page === currentPage ? "page" : undefined
                        }
                        className={`h-10 min-w-10 rounded-xl px-3 text-sm font-medium transition-colors ${page === currentPage
                                ? "bg-primary text-primary-foreground"
                                : "border border-border hover:border-primary hover:text-primary"
                            }`}
                    >
                        {page}
                    </button>
                )
            )}
        </div>
    );
}

function LoadingGrid() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-border bg-surface"
                >
                    <div className="aspect-16/10 animate-pulse bg-surface-secondary" />

                    <div className="space-y-4 p-5">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-surface-secondary" />
                        <div className="h-5 w-full animate-pulse rounded-lg bg-surface-secondary" />
                        <div className="h-4 w-4/5 animate-pulse rounded-lg bg-surface-secondary" />
                        <div className="h-8 w-32 animate-pulse rounded-xl bg-surface-secondary" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ArticleDrawer({
    article,
    onClose,
}: {
    article: ILearnDocument;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-black/60"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={article.title}
                className="h-full w-full max-w-3xl overflow-y-auto border-l border-border bg-background"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-5 py-3 sm:px-8">
                    <span className="text-sm font-semibold text-primary">
                        {article.category}
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-primary"
                        aria-label="Close article"
                    >
                        <X size={17} />
                        Close
                    </button>
                </div>

                {article.cover_image && (
                    <img
                        src={article.cover_image}
                        alt={article.title}
                        className="aspect-16/8 w-full border-b border-border object-cover"
                    />
                )}

                <div className="px-5 pb-12 pt-8 sm:px-8">
                    <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                        {article.title}
                    </h2>

                    <p className="mt-4 text-lg leading-8 text-muted">
                        {article.desc}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border py-4 text-sm text-muted">
                        <span className="flex items-center gap-2">
                            <Clock3 size={16} />
                            {article.read_time} min read
                        </span>

                        <span className="flex items-center gap-2">
                            <Eye size={16} />
                            {article.views ?? 0} views
                        </span>

                        {article.is_medically_reviewed && (
                            <span className="flex items-center gap-2 font-medium text-primary">
                                <CheckCircle2 size={16} />
                                Medically reviewed
                            </span>
                        )}
                    </div>

                    {article.expert_summary && (
                        <div className="my-8 rounded-2xl border border-border bg-surface p-5">
                            <p className="mb-2 text-sm font-bold text-primary">
                                Expert summary
                            </p>

                            <p className="text-sm leading-7 text-foreground">
                                {article.expert_summary}
                            </p>
                        </div>
                    )}

                    <div className="prose prose-neutral max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-base leading-8 text-foreground">
                            {article.content}
                        </div>
                    </div>

                    {article.tags && article.tags.length > 0 && (
                        <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
                            {article.tags.map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-border px-3 py-1 text-xs text-muted"
                                >
                                    #{item}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
                        {article.author?.avatar ? (
                            <img
                                src={article.author.avatar}
                                alt={article.author.name}
                                className="h-12 w-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                                {article.author?.name?.charAt(0)}
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-semibold">
                                {article.author?.name}
                            </p>

                            {article.author?.credentials && (
                                <p className="text-xs text-muted">
                                    {article.author.credentials}
                                </p>
                            )}

                            {article.reviewed_by && (
                                <p className="mt-1 text-xs text-muted">
                                    Reviewed by {article.reviewed_by}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}