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
        <div className="container mx-auto px-4 py-20 sm:px-6 max-w-6xl">
            <div className="mb-16 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <HelpCircle className="h-8 w-8" />
                </div>
                <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">
                    Frequently Asked <span className="text-blue-400">Questions</span>
                </h1>
                <p className="max-w-2xl text-lg text-slate-400">
                    Everything you need to know about Somatic, its AI capabilities, and data security standards.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {pageContent.faq.map((item, index) => (
                    <div
                        key={index}
                        className="rounded-3xl border border-white/10 bg-[#0f172a]/60 p-8 transition-all hover:bg-white/5 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                    >
                        <h3 className="mb-4 text-xl font-bold text-white leading-snug">
                            {item.question}
                        </h3>
                        <p className="text-slate-400 leading-relaxed text-base">
                            {item.answer}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}