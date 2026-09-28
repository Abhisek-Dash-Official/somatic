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
        <div className="container mx-auto px-4 py-20 sm:px-6 max-w-4xl">
            <div className="mb-12 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Scale className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Terms of Service</h1>
                <p className="mt-4 text-slate-400">Last updated: August 2026</p>
            </div>

            <div className="space-y-10 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-8 sm:p-12 shadow-xl backdrop-blur-xl">
                {pageContent.legal.terms.map((section, index) => (
                    <div key={index} className="border-b border-white/5 pb-8 last:border-0 last:pb-0">
                        <h2 className="mb-4 text-2xl font-bold text-white">{section.heading}</h2>
                        <p className="text-lg text-slate-300 leading-relaxed">{section.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}