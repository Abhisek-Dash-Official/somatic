import { pageContent } from "@/config/content";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `Blog & Insights | ${siteConfig.name}`,
    description: "Read the latest updates, technical deep-dives, and insights on how AI is transforming Ayush healthcare.",
};

export default function BlogPage() {
    return (
        <main className="bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
                {/* HEADER */}
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
                                Discover how AI is transforming Ayush healthcare, explore technical deep-dives, and follow the work behind Somatic.
                            </p>
                        </div>
                    </div>
                </section>

                {/* POSTS */}
                <section className="pt-10 sm:pt-14">
                    <div className="divide-y divide-border border-y border-border">
                        {pageContent.blog.map((post, index) => (
                            <article
                                key={post.id}
                                className="group grid gap-5 py-7 sm:grid-cols-[90px_1fr_auto] sm:items-start sm:gap-8 sm:py-9"
                            >
                                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {String(index + 1).padStart(2, "0")}
                                </div>

                                <div>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
                                        {post.date}
                                    </p>

                                    <h2 className="max-w-2xl text-xl font-bold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-2xl">
                                        {post.title}
                                    </h2>

                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                                        {post.excerpt}
                                    </p>
                                </div>

                                <div className="flex items-center text-muted transition-colors group-hover:text-primary">
                                    <ArrowUpRight className="h-5 w-5" />
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}