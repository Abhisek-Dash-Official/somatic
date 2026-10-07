"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
    ArrowUpRight,
    BookOpen,
    CalendarDays,
    Clock3,
    Tag,
    X,
    UserRound,
    Star,
} from "lucide-react";
import blogData from "@/config/blog-data.json";

interface BlogPost {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    icon: string;
    coverImage: string;
    content: string;
    author: {
        name: string;
        avatar: string;
        role: string;
    };
    publishDate: string;
    updatedDate: string;
    readTime: string;
    featured: boolean;
}

export default function BlogPage() {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const posts = blogData as BlogPost[];

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setSelectedPost(null);
        };

        if (selectedPost) {
            document.body.style.overflow = "hidden";
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.body.style.overflow = "unset";
            document.removeEventListener("keydown", handleEscape);
        };
    }, [selectedPost]);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                <section className="mb-12 text-center sm:mb-14">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                        Somatic Journal
                    </div>

                    <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        Latest updates & insights
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                        Discover how AI is transforming Ayush healthcare, explore
                        technical deep-dives, and follow the work behind Somatic.
                    </p>
                </section>

                <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    {posts.map((post, index) => (
                        <article
                            key={post.id}
                            className="group border-b border-border p-6 last:border-b-0 transition-colors hover:bg-surface-secondary sm:p-8"
                        >
                            <div className="grid gap-6 lg:grid-cols-[60px_1fr_auto] lg:items-start lg:gap-8">
                                <div className="hidden text-xs font-bold tracking-wider text-muted lg:block">
                                    {String(index + 1).padStart(2, "0")}
                                </div>

                                <div className="min-w-0">
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-md bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                                            {post.category}
                                        </span>

                                        {post.featured && (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-warning">
                                                <Star className="h-3 w-3 fill-current" />
                                                Featured
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedPost(post)}
                                        className="text-left"
                                    >
                                        <h2 className="max-w-3xl text-xl font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                                            {post.title}
                                        </h2>
                                    </button>

                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">
                                        {post.description}
                                    </p>

                                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            {formatDate(post.publishDate)}
                                        </span>

                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            {post.readTime}
                                        </span>

                                        <span className="inline-flex items-center gap-1.5">
                                            <UserRound className="h-3.5 w-3.5" />
                                            {post.author.name}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedPost(post)}
                                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
                                >
                                    Read article
                                    <ArrowUpRight className="h-4 w-4" />
                                </button>
                            </div>
                        </article>
                    ))}

                    {posts.length === 0 && (
                        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                                <BookOpen className="h-6 w-6" />
                            </div>

                            <p className="mt-4 text-sm font-medium text-muted">
                                No blog posts available yet.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {selectedPost && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedPost(null);
                        }
                    }}
                >
                    <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setSelectedPost(null)}
                            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/90 text-muted transition hover:bg-accent hover:text-foreground"
                            aria-label="Close blog post"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="overflow-y-auto">
                            {selectedPost.coverImage && (
                                <div className="relative aspect-2/1 w-full bg-surface-secondary">
                                    <Image
                                        src={selectedPost.coverImage}
                                        alt={selectedPost.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 896px"
                                    />
                                </div>
                            )}

                            <div className="p-6 sm:p-8 lg:p-10">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-md bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                                        {selectedPost.category}
                                    </span>

                                    {selectedPost.featured && (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-warning">
                                            <Star className="h-3 w-3 fill-current" />
                                            Featured
                                        </span>
                                    )}
                                </div>

                                <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                                    {selectedPost.title}
                                </h2>

                                <p className="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg">
                                    {selectedPost.description}
                                </p>

                                <div className="mt-7 flex flex-col gap-5 border-y border-border py-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-secondary">
                                            {selectedPost.author.avatar ? (
                                                <Image
                                                    src={selectedPost.author.avatar}
                                                    alt={selectedPost.author.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="44px"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <UserRound className="h-5 w-5 text-muted" />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {selectedPost.author.name}
                                            </p>

                                            <p className="text-xs text-muted">
                                                {selectedPost.author.role}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Published {formatDate(selectedPost.publishDate)}
                                        </span>

                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            {selectedPost.readTime}
                                        </span>
                                    </div>
                                </div>

                                {selectedPost.tags.length > 0 && (
                                    <div className="mt-6 flex flex-wrap items-center gap-2">
                                        <Tag className="mr-1 h-4 w-4 text-muted" />

                                        {selectedPost.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-md border border-border bg-surface-secondary px-2.5 py-1 text-xs text-muted"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8 border-t border-border pt-8">
                                    <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/90 sm:text-base sm:leading-8">
                                        {selectedPost.content}
                                    </div>
                                </div>

                                <div className="mt-8 border-t border-border pt-5 text-xs text-muted">
                                    Last updated {formatDate(selectedPost.updatedDate)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
}