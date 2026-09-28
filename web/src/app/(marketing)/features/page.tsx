import { pageContent } from "@/config/content";
import {
    Cpu, Activity, FileText, ShieldCheck, Database, Zap, Layers, Mic, Network, AlertTriangle, ListChecks, DownloadCloud, Languages, Paperclip, Lock, ShoppingCart, Ambulance, QrCode, Volume2
} from "lucide-react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `Platform Features | ${siteConfig.name}`,
    description: "Explore the technical capabilities powering Somatic, including Smart Symptom Mapping, EHR, and automated prescriptions.",
};

const IconMap: Record<string, any> = {
    Cpu, Activity, FileText, ShieldCheck, Database, Zap, Layers, Mic, Network, AlertTriangle, ListChecks, DownloadCloud, Languages, Paperclip, Lock, ShoppingCart, Ambulance, QrCode, Volume2
};

export default function FeaturesPage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <div className="mb-14 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-accent text-primary">
                    <Layers className="h-8 w-8" />
                </div>

                <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                    Platform <span className="text-primary">Features</span>
                </h1>

                <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                    The core technical capabilities that power the Somatic healthcare engine.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
                {pageContent.features.map((feature, index) => {
                    const Icon = IconMap[feature.icon];

                    return (
                        <div
                            key={index}
                            className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-primary/50 hover:bg-surface-secondary sm:flex-row"
                        >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-accent text-primary">
                                {Icon && <Icon className="h-7 w-7" />}
                            </div>

                            <div>
                                <h3 className="mb-3 text-xl font-bold text-foreground">
                                    {feature.title}
                                </h3>

                                <p className="text-base leading-relaxed text-muted">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}