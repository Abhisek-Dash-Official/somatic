import { pageContent } from "@/config/content";
import { HelpCircle } from "lucide-react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `FAQ & Support | ${siteConfig.name}`,
    description: "Find answers to frequently asked questions about Somatic, data security, AI Dosha analysis, and platform capabilities.",
};

export default function FAQPage() {
    return (
        <main className="bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                <section className="mb-12 text-center sm:mb-14">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                        <HelpCircle className="h-3.5 w-3.5 text-primary" />
                        Help Center
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        Frequently asked questions
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                        Everything you need to know about Somatic, its AI capabilities,
                        and data security standards.
                    </p>
                </section>

                <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="grid md:grid-cols-2">
                        {pageContent.faq.map((item, index) => (
                            <article
                                key={index}
                                className={`group border-b border-border p-6 transition-colors hover:bg-surface-secondary sm:p-8 ${index % 2 === 0 ? "md:border-r" : ""
                                    } ${index >= pageContent.faq.length - 2 ? "md:border-b-0" : ""}`}
                            >
                                <div className="flex gap-5">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-bold text-primary">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>

                                    <div className="min-w-0">
                                        <h2 className="text-lg font-bold leading-snug text-foreground sm:text-xl">
                                            {item.question}
                                        </h2>

                                        <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}