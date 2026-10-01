"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight, BookOpen, CalendarDays, Clock3, Tag, X, UserRound, Star } from "lucide-react";
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
            if (event.key === "Escape") {
                setSelectedPost(null);
            }
        };

        if (selectedPost) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [selectedPost]);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
                <section className="border-b border-border pb-12 sm:pb-16">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 hidden h-9 w-9 items-center justify-center bg-accent text-accent-foreground sm:flex">
                            <BookOpen className="h-4 w-4" />
                        </div>

                        <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                                Somatic journal
                            </p>

                            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                                Latest updates & insights.
                            </h1>

                            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                                Discover how AI is transforming Ayush healthcare,
                                explore technical deep-dives, and follow the work
                                behind Somatic.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="pt-10 sm:pt-14">
                    <div className="divide-y divide-border border-y border-border">
                        {posts.map((post, index) => (
                            <article
                                key={post.id}
                                className="group grid gap-6 py-7 sm:grid-cols-[70px_1fr_auto] sm:items-start sm:gap-8 sm:py-9"
                            >
                                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {String(index + 1).padStart(2, "0")}
                                </div>

                                <div className="min-w-0">
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                                            {post.category}
                                        </span>

                                        {post.featured && (
                                            <>
                                                <span className="text-muted-foreground">
                                                    /
                                                </span>

                                                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-500">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    Featured
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <h2 className="max-w-3xl text-xl font-bold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-2xl cursor-pointer"
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        {post.title}
                                    </h2>

                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">
                                        {post.description}
                                    </p>

                                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
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
                                    className="inline-flex w-fit items-center gap-2 border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                                >
                                    View
                                    <ArrowUpRight className="h-4 w-4" />
                                </button>
                            </article>
                        ))}
                    </div>

                    {posts.length === 0 && (
                        <div className="border-y border-border py-16 text-center">
                            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />

                            <p className="mt-4 text-sm text-muted">
                                No blog posts available yet.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {selectedPost && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedPost(null);
                        }
                    }}
                >
                    <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden border border-border bg-background shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setSelectedPost(null)}
                            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Close blog post"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="overflow-y-auto">
                            {selectedPost.coverImage && (
                                <div className="relative aspect-2/1 w-full bg-muted">
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
                                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                                        {selectedPost.category}
                                    </span>

                                    {selectedPost.featured && (
                                        <span className="inline-flex items-center gap-1 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-500">
                                            <Star className="h-3 w-3 fill-current" />
                                            Featured
                                        </span>
                                    )}
                                </div>

                                <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                                    {selectedPost.title}
                                </h2>

                                <p className="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg">
                                    {selectedPost.description}
                                </p>

                                <div className="mt-7 flex flex-col gap-5 border-y border-border py-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted">
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
                                                    <UserRound className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold">
                                                {selectedPost.author.name}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {selectedPost.author.role}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Published{" "}
                                            {formatDate(selectedPost.publishDate)}
                                        </span>

                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            {selectedPost.readTime}
                                        </span>
                                    </div>
                                </div>

                                {selectedPost.tags.length > 0 && (
                                    <div className="mt-6 flex flex-wrap items-center gap-2">
                                        <Tag className="mr-1 h-4 w-4 text-muted-foreground" />

                                        {selectedPost.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="border border-border px-2.5 py-1 text-xs text-muted-foreground"
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

                                <div className="mt-8 border-t border-border pt-5 text-xs text-muted-foreground">
                                    Last updated{" "}
                                    {formatDate(selectedPost.updatedDate)}
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