import { pageContent } from "@/config/content";
import { Scale } from "lucide-react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `Terms of Service | ${siteConfig.name}`,
    description: "Read the terms and conditions for using the Somatic platform as a healthcare professional or patient.",
};

export default function TermsPage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-20">
            <div className="mb-12 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-accent text-primary">
                    <Scale className="h-8 w-8" />
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                    Terms of Service
                </h1>

                <p className="mt-4 text-muted">Last updated: August 2026</p>
            </div>

            <div className="space-y-10 rounded-2xl border border-border bg-surface p-6 sm:p-10">
                {pageContent.legal.terms.map((section, index) => (
                    <div key={index} className="border-b border-border pb-8 last:border-0 last:pb-0">
                        <h2 className="mb-4 text-2xl font-bold text-foreground">{section.heading}</h2>
                        <p className="text-base leading-relaxed text-muted sm:text-lg">{section.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}