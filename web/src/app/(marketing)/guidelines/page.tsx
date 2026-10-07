import { pageContent } from "@/config/content";
import { FileHeart } from "lucide-react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `Community Guidelines | ${siteConfig.name}`,
    description: "Rules and ethical protocols for medical professionals utilizing the Somatic collaborative platform.",
};

export default function GuidelinesPage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
            <div className="mb-12 text-center sm:mb-14">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    <FileHeart className="h-3.5 w-3.5 text-primary" />
                    Community
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                    Community Guidelines
                </h1>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                    Standards and ethical guidelines for healthcare professionals using {siteConfig.name}.
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                {pageContent.legal.guidelines.map((section, index) => (
                    <section
                        key={index}
                        className="border-b border-border p-6 last:border-b-0 sm:p-8"
                    >
                        <div className="flex gap-5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-primary">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <div className="min-w-0">
                                <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                    {section.heading}
                                </h2>

                                <p className="text-sm leading-7 text-muted sm:text-base">
                                    {section.text}
                                </p>
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}