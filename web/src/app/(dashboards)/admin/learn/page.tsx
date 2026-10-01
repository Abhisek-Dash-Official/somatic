"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, Edit3, Eye, FileText, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";

type LearnArticle = {
    _id: string;
    title: string;
    slug: string;
    desc: string;
    content: string;
    cover_image: string;
    category: string;
    tags: string[];
    expert_summary?: string;
    read_time: number;
    status: "draft" | "published" | "archived";
    author: {
        name: string;
        credentials?: string;
        avatar?: string;
    };
    is_medically_reviewed: boolean;
    reviewed_by?: string;
    views: number;
    created_at: string;
    updated_at: string;
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

type FormData = {
    title: string;
    slug: string;
    desc: string;
    content: string;
    cover_image: string;
    category: string;
    tags: string;
    expert_summary: string;
    read_time: string;
    status: "draft" | "published" | "archived";
    author_name: string;
    author_credentials: string;
    author_avatar: string;
    is_medically_reviewed: boolean;
    reviewed_by: string;
};

const emptyForm: FormData = {
    title: "",
    slug: "",
    desc: "",
    content: "",
    cover_image: "",
    category: "",
    tags: "",
    expert_summary: "",
    read_time: "5",
    status: "draft",
    author_name: "",
    author_credentials: "",
    author_avatar: "",
    is_medically_reviewed: false,
    reviewed_by: "",
};

const LIMIT = 10;

export default function AdminLearnPage() {
    const [articles, setArticles] = useState<LearnArticle[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [category, setCategory] = useState("");
    const [medicallyReviewed, setMedicallyReviewed] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<LearnArticle | null>(null);
    const [editingArticle, setEditingArticle] = useState<LearnArticle | null>(null);
    const [form, setForm] = useState<FormData>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", String(LIMIT));

            if (search.trim()) params.set("search", search.trim());
            if (status) params.set("status", status);
            if (category) params.set("category", category);
            if (medicallyReviewed) params.set("medically_reviewed", medicallyReviewed);

            const response = await fetch(`/api/admin/learn?${params.toString()}`, { cache: "no-store" });
            const result = await response.json();

            if (!response.ok || !result.success) throw new Error(result.message || "Failed to fetch articles");

            setArticles(result.data || []);
            setPagination(result.pagination || null);

            const newCategories: string[] = (result.data || []).map((item: LearnArticle) => item.category).filter(Boolean);
            setCategories((current) => Array.from(new Set<string>([...current, ...newCategories])));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch articles");
        } finally {
            setLoading(false);
        }
    }, [page, search, status, category, medicallyReviewed]);

    useEffect(() => {
        const timer = setTimeout(fetchArticles, 300);
        return () => clearTimeout(timer);
    }, [fetchArticles]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowModal(false);
                setShowViewModal(false);
                setShowDeleteModal(false);
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    const resetFilters = () => {
        setSearch("");
        setStatus("");
        setCategory("");
        setMedicallyReviewed("");
        setPage(1);
    };

    const openCreate = () => {
        setEditingArticle(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (article: LearnArticle) => {
        setEditingArticle(article);
        setForm({
            title: article.title,
            slug: article.slug,
            desc: article.desc,
            content: article.content,
            cover_image: article.cover_image,
            category: article.category,
            tags: (article.tags || []).join(", "),
            expert_summary: article.expert_summary || "",
            read_time: String(article.read_time),
            status: article.status,
            author_name: article.author?.name || "",
            author_credentials: article.author?.credentials || "",
            author_avatar: article.author?.avatar || "",
            is_medically_reviewed: article.is_medically_reviewed,
            reviewed_by: article.reviewed_by || "",
        });
        setShowModal(true);
    };

    const openView = (article: LearnArticle) => {
        setSelectedArticle(article);
        setShowViewModal(true);
    };

    const openDelete = (article: LearnArticle) => {
        setSelectedArticle(article);
        setShowDeleteModal(true);
    };

    const updateForm = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSave = async () => {
        if (!form.title.trim()) return toast.error("Title is required.");
        if (!form.slug.trim()) return toast.error("Slug is required.");
        if (!form.desc.trim()) return toast.error("Description is required.");
        if (!form.content.trim()) return toast.error("Content is required.");
        if (!form.cover_image.trim()) return toast.error("Cover image is required.");
        if (!form.category.trim()) return toast.error("Category is required.");
        if (!form.author_name.trim()) return toast.error("Author name is required.");

        const readTime = Number(form.read_time);

        if (!Number.isFinite(readTime) || readTime <= 0) {
            return toast.error("Read time must be greater than 0.");
        }

        setSaving(true);

        try {
            const payload = {
                title: form.title.trim(),
                slug: form.slug.trim().toLowerCase(),
                desc: form.desc.trim(),
                content: form.content.trim(),
                cover_image: form.cover_image.trim(),
                category: form.category.trim(),
                tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
                expert_summary: form.expert_summary.trim(),
                read_time: readTime,
                status: form.status,
                author: {
                    name: form.author_name.trim(),
                    credentials: form.author_credentials.trim(),
                    avatar: form.author_avatar.trim(),
                },
                is_medically_reviewed: form.is_medically_reviewed,
                reviewed_by: form.reviewed_by.trim(),
            };

            const response = await fetch(editingArticle ? `/api/admin/learn/${editingArticle._id}` : "/api/admin/learn", {
                method: editingArticle ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) throw new Error(result.message || "Failed to save article");

            toast.success(editingArticle ? "Article updated successfully." : "Article created successfully.");

            setShowModal(false);
            setEditingArticle(null);
            setForm(emptyForm);
            await fetchArticles();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save article");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedArticle) return;

        setDeleting(true);

        try {
            const response = await fetch(`/api/admin/learn/${selectedArticle._id}`, { method: "DELETE" });
            const result = await response.json();

            if (!response.ok || !result.success) throw new Error(result.message || "Failed to delete article");

            toast.success("Article deleted successfully.");

            setShowDeleteModal(false);
            setSelectedArticle(null);

            if (articles.length === 1 && page > 1) {
                setPage((current) => current - 1);
            } else {
                await fetchArticles();
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete article");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Learn</h1>
                        <p className="mt-1 text-sm text-muted">Manage health and wellness articles.</p>
                    </div>

                    <button type="button" onClick={openCreate} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">
                        <Plus size={17} />
                        Add Article
                    </button>
                </div>

                <div className="mb-6 border border-border bg-card p-4">
                    <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px_auto]">
                        <div className="relative">
                            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search articles..." className="h-10 w-full border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary" />
                        </div>

                        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 border border-border bg-background px-3 text-sm outline-none focus:border-primary">
                            <option value="">All status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>

                        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="h-10 border border-border bg-background px-3 text-sm outline-none focus:border-primary">
                            <option value="">All categories</option>
                            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>

                        <select value={medicallyReviewed} onChange={(event) => { setMedicallyReviewed(event.target.value); setPage(1); }} className="h-10 border border-border bg-background px-3 text-sm outline-none focus:border-primary">
                            <option value="">Medical review</option>
                            <option value="true">Reviewed</option>
                            <option value="false">Not reviewed</option>
                        </select>

                        <button type="button" onClick={resetFilters} className="flex h-10 items-center justify-center gap-2 border border-border px-4 text-sm font-medium text-muted transition hover:border-primary hover:text-primary">
                            <RotateCcw size={15} />
                            Reset
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-225 text-left">
                            <thead className="border-b border-border bg-surface-secondary">
                                <tr>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Article</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Category</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Review</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Views</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <LoadingRows />
                                ) : articles.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center">
                                            <FileText className="mx-auto h-8 w-8 text-muted" />
                                            <p className="mt-3 font-medium">No articles found</p>
                                            <p className="mt-1 text-sm text-muted">Create an article or change your filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    articles.map((article) => (
                                        <ArticleRow key={article._id} article={article} onView={() => openView(article)} onEdit={() => openEdit(article)} onDelete={() => openDelete(article)} />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-5 flex items-center justify-between gap-4">
                        <p className="text-sm text-muted">
                            Showing <span className="font-medium text-foreground">{articles.length}</span> of <span className="font-medium text-foreground">{pagination.total}</span>
                        </p>

                        <div className="flex items-center gap-2">
                            <button type="button" disabled={!pagination.hasPreviousPage || loading} onClick={() => setPage((current) => current - 1)} className="border border-border px-3 py-2 text-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">
                                Previous
                            </button>

                            <span className="px-2 text-sm text-muted">{pagination.page} / {pagination.totalPages}</span>

                            <button type="button" disabled={!pagination.hasNextPage || loading} onClick={() => setPage((current) => current + 1)} className="border border-border px-3 py-2 text-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showModal && <ArticleFormModal form={form} editing={!!editingArticle} saving={saving} onChange={updateForm} onClose={() => setShowModal(false)} onSave={handleSave} />}

            {showViewModal && selectedArticle && <ArticleViewModal article={selectedArticle} onClose={() => setShowViewModal(false)} onEdit={() => { setShowViewModal(false); openEdit(selectedArticle); }} />}

            {showDeleteModal && selectedArticle && <DeleteModal article={selectedArticle} deleting={deleting} onClose={() => setShowDeleteModal(false)} onDelete={handleDelete} />}
        </main>
    );
}

function ArticleRow({ article, onView, onEdit, onDelete }: { article: LearnArticle; onView: () => void; onEdit: () => void; onDelete: () => void }) {
    return (
        <tr className="transition hover:bg-surface-secondary">
            <td className="px-5 py-4">
                <div className="flex min-w-75 items-center gap-3">
                    {article.cover_image ? (
                        <img src={article.cover_image} alt="" className="h-14 w-20 shrink-0 object-cover" />
                    ) : (
                        <div className="flex h-14 w-20 shrink-0 items-center justify-center bg-surface-secondary">
                            <FileText size={18} className="text-muted" />
                        </div>
                    )}

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{article.title}</p>
                        <p className="mt-1 truncate text-xs text-muted">{article.author?.name}</p>
                    </div>
                </div>
            </td>

            <td className="px-5 py-4">
                <span className="text-sm text-muted">{article.category}</span>

                {article.tags?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground">#{tag}</span>
                        ))}
                    </div>
                )}
            </td>

            <td className="px-5 py-4">
                <StatusBadge status={article.status} />
            </td>

            <td className="px-5 py-4">
                {article.is_medically_reviewed ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                        <CheckCircle2 size={15} />
                        Reviewed
                    </span>
                ) : (
                    <span className="text-xs text-muted">Not reviewed</span>
                )}
            </td>

            <td className="px-5 py-4">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                    <Eye size={14} />
                    {article.views ?? 0}
                </span>
            </td>

            <td className="px-5 py-4">
                <div className="flex justify-end gap-1">
                    <button type="button" onClick={onView} title="View" className="flex h-9 w-9 items-center justify-center text-muted transition hover:bg-accent hover:text-foreground">
                        <Eye size={16} />
                    </button>

                    <button type="button" onClick={onEdit} title="Edit" className="flex h-9 w-9 items-center justify-center text-muted transition hover:bg-accent hover:text-primary">
                        <Edit3 size={16} />
                    </button>

                    <button type="button" onClick={onDelete} title="Delete" className="flex h-9 w-9 items-center justify-center text-muted transition hover:bg-danger/10 hover:text-danger">
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function StatusBadge({ status }: { status: LearnArticle["status"] }) {
    const config = {
        published: "bg-primary/10 text-primary",
        draft: "bg-accent text-accent-foreground",
        archived: "bg-danger/10 text-danger",
    };

    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${config[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

function ArticleFormModal({ form, editing, saving, onChange, onClose, onSave }: { form: FormData; editing: boolean; saving: boolean; onChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void; onClose: () => void; onSave: () => void }) {
    return (
        <Modal onClose={onClose} size="xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                    <h2 className="text-lg font-semibold">{editing ? "Edit Article" : "Create Article"}</h2>
                    <p className="mt-1 text-xs text-muted">{editing ? "Update the article details." : "Add a new health and wellness article."}</p>
                </div>

                <button type="button" onClick={onClose} className="text-muted transition hover:text-foreground">
                    <X size={20} />
                </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
                <div className="grid gap-5 lg:grid-cols-2">
                    <Input label="Title" value={form.title} onChange={(value) => onChange("title", value)} placeholder="Article title" />
                    <Input label="Slug" value={form.slug} onChange={(value) => onChange("slug", value)} placeholder="article-slug" />
                    <Input label="Category" value={form.category} onChange={(value) => onChange("category", value)} placeholder="Ayurveda" />
                    <Input label="Read time (minutes)" type="number" value={form.read_time} onChange={(value) => onChange("read_time", value)} placeholder="5" />

                    <div className="lg:col-span-2">
                        <Input label="Cover image URL" value={form.cover_image} onChange={(value) => onChange("cover_image", value)} placeholder="/learn/example.jpg" />
                    </div>

                    <div className="lg:col-span-2">
                        <TextArea label="Description" value={form.desc} onChange={(value) => onChange("desc", value)} rows={3} placeholder="Short article description..." />
                    </div>

                    <div className="lg:col-span-2">
                        <TextArea label="Content" value={form.content} onChange={(value) => onChange("content", value)} rows={12} placeholder="Write the complete article content..." />
                    </div>

                    <div className="lg:col-span-2">
                        <TextArea label="Expert summary" value={form.expert_summary} onChange={(value) => onChange("expert_summary", value)} rows={4} placeholder="Optional expert summary..." />
                    </div>

                    <div className="lg:col-span-2">
                        <Input label="Tags" value={form.tags} onChange={(value) => onChange("tags", value)} placeholder="ayurveda, immunity, wellness" />

                        {form.tags && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {form.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                                    <span key={tag} className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="mb-3 text-sm font-semibold">Author</div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input label="Name" value={form.author_name} onChange={(value) => onChange("author_name", value)} placeholder="Author name" />
                            <Input label="Credentials" value={form.author_credentials} onChange={(value) => onChange("author_credentials", value)} placeholder="BAMS, MD" />

                            <div className="sm:col-span-2">
                                <Input label="Avatar URL" value={form.author_avatar} onChange={(value) => onChange("author_avatar", value)} placeholder="/members/author.png" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-semibold text-muted">Status</label>

                        <select value={form.status} onChange={(event) => onChange("status", event.target.value as FormData["status"])} className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary">
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <Input label="Reviewed by" value={form.reviewed_by} onChange={(value) => onChange("reviewed_by", value)} placeholder="Doctor / reviewer name" />

                    <div className="lg:col-span-2">
                        <label className="flex cursor-pointer items-center gap-3 border border-border bg-surface-secondary p-3">
                            <input type="checkbox" checked={form.is_medically_reviewed} onChange={(event) => onChange("is_medically_reviewed", event.target.checked)} className="h-4 w-4 accent-primary" />

                            <div>
                                <p className="text-sm font-medium">Medically reviewed</p>
                                <p className="mt-0.5 text-xs text-muted">Mark this article as reviewed by a healthcare professional.</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
                <button type="button" onClick={onClose} disabled={saving} className="border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-surface-secondary disabled:opacity-50">Cancel</button>

                <button type="button" onClick={onSave} disabled={saving} className="flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
                    {saving && <span className="animate-spin">◌</span>}
                    {saving ? "Saving..." : editing ? "Update Article" : "Create Article"}
                </button>
            </div>
        </Modal>
    );
}

function ArticleViewModal({ article, onClose, onEdit }: { article: LearnArticle; onClose: () => void; onEdit: () => void }) {
    return (
        <Modal onClose={onClose} size="lg">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                    <StatusBadge status={article.status} />

                    {article.is_medically_reviewed && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            <CheckCircle2 size={13} />
                            Reviewed
                        </span>
                    )}
                </div>

                <button type="button" onClick={onClose} className="text-muted transition hover:text-foreground">
                    <X size={20} />
                </button>
            </div>

            <div className="max-h-[78vh] overflow-y-auto">
                {article.cover_image && <img src={article.cover_image} alt={article.title} className="aspect-16/7 w-full object-cover" />}

                <div className="px-6 py-6">
                    <p className="text-sm font-semibold text-primary">{article.category}</p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight">{article.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted">{article.desc}</p>

                    <div className="mt-5 flex flex-wrap gap-4 border-y border-border py-3 text-xs text-muted">
                        <span className="flex items-center gap-1.5"><Clock3 size={14} />{article.read_time} min read</span>
                        <span className="flex items-center gap-1.5"><Eye size={14} />{article.views ?? 0} views</span>
                        <span>By {article.author?.name}</span>
                    </div>

                    {article.tags?.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-1.5">
                            {article.tags.map((tag) => <span key={tag} className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">#{tag}</span>)}
                        </div>
                    )}

                    {article.expert_summary && (
                        <div className="mt-6 border border-border bg-surface-secondary p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Expert Summary</p>
                            <p className="mt-2 text-sm leading-6">{article.expert_summary}</p>
                        </div>
                    )}

                    <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-foreground/90">{article.content}</div>

                    <div className="mt-8 flex items-center gap-3 border-t border-border pt-5">
                        {article.author?.avatar ? (
                            <img src={article.author.avatar} alt={article.author.name} className="h-10 w-10 object-cover" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center bg-primary/10 font-semibold text-primary">{article.author?.name?.charAt(0)}</div>
                        )}

                        <div>
                            <p className="text-sm font-semibold">{article.author?.name}</p>
                            {article.author?.credentials && <p className="text-xs text-muted">{article.author.credentials}</p>}
                            {article.reviewed_by && <p className="mt-0.5 text-xs text-muted">Reviewed by {article.reviewed_by}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
                <button type="button" onClick={onClose} className="border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-surface-secondary">Close</button>

                <button type="button" onClick={onEdit} className="flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">
                    <Edit3 size={15} />
                    Edit
                </button>
            </div>
        </Modal>
    );
}

function DeleteModal({ article, deleting, onClose, onDelete }: { article: LearnArticle; deleting: boolean; onClose: () => void; onDelete: () => void }) {
    return (
        <Modal onClose={onClose} size="sm">
            <div className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    <Trash2 size={20} />
                </div>

                <h2 className="mt-4 text-lg font-semibold">Delete article?</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                    This will permanently delete <span className="font-medium text-foreground">{article.title}</span>. This action cannot be undone.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={deleting} className="border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-surface-secondary disabled:opacity-50">Cancel</button>
                    <button type="button" onClick={onDelete} disabled={deleting} className="bg-danger px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{deleting ? "Deleting..." : "Delete"}</button>
                </div>
            </div>
        </Modal>
    );
}

function Modal({ children, onClose, size = "lg" }: { children: React.ReactNode; onClose: () => void; size?: "sm" | "lg" | "xl" }) {
    const width = { sm: "max-w-md", lg: "max-w-3xl", xl: "max-w-5xl" };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <div className={`w-full ${width[size]} border border-border bg-background shadow-2xl`} role="dialog" aria-modal="true">
                {children}
            </div>
        </div>
    );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
    return (
        <label className="block">
            {label && <span className="mb-2 block text-xs font-semibold text-muted">{label}</span>}
            <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full border border-border bg-background px-3 text-sm outline-none transition focus:border-primary" />
        </label>
    );
}

function TextArea({ label, value, onChange, placeholder, rows }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows: number }) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-semibold text-muted">{label}</span>
            <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} className="w-full resize-y border border-border bg-background px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-primary" />
        </label>
    );
}

function LoadingRows() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                    <td colSpan={6} className="px-5 py-4">
                        <div className="h-14 animate-pulse bg-surface-secondary" />
                    </td>
                </tr>
            ))}
        </>
    );
}