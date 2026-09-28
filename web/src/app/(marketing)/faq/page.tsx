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
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
                {/* HEADER */}
                <section className="border-b border-border pb-12 sm:pb-16">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 hidden h-9 w-9 items-center justify-center bg-accent text-accent-foreground sm:flex">
                            <HelpCircle className="h-4 w-4" />
                        </div>

                        <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                                Help center
                            </p>

                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                                Frequently asked questions.
                            </h1>

                            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                                Everything you need to know about Somatic, its AI capabilities, and data security standards.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="pt-10 sm:pt-14">
                    <div className="grid gap-x-12 md:grid-cols-2">
                        {pageContent.faq.map((item, index) => (
                            <article
                                key={index}
                                className="border-b border-border py-7 first:border-t md:nth-[2]:border-t"
                            >
                                <div className="flex gap-5">
                                    <span className="pt-1 text-xs font-semibold text-primary">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>

                                    <div>
                                        <h2 className="text-lg font-bold leading-snug sm:text-xl">
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