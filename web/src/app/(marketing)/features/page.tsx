import { pageContent } from "@/config/content";
import {
    Layers,
    BrainCircuit,
    HeartPulse,
    Stethoscope,
    Ambulance,
    FileSearch,
    Microscope,
    ShoppingBag,
    ShieldCheck,
    QrCode,
    Languages,
    BookOpen,
    LayoutDashboard
} from "lucide-react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `Platform Features | ${siteConfig.name}`,
    description: "Explore the technical capabilities powering Somatic, including Smart Symptom Mapping, EHR, and automated prescriptions.",
};

const IconMap: Record<string, any> = {
    Layers,
    BrainCircuit,
    HeartPulse,
    Stethoscope,
    Ambulance,
    FileSearch,
    Microscope,
    ShoppingBag,
    ShieldCheck,
    QrCode,
    Languages,
    BookOpen,
    LayoutDashboard
};

export default function FeaturesPage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
            <div className="mb-12 text-center sm:mb-14">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    Platform
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                    Platform <span className="text-primary">Features</span>
                </h1>

                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                    The core technical capabilities that power the Somatic healthcare engine.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
                {pageContent.features.map((feature, index) => {
                    const Icon = IconMap[feature.icon];

                    return (
                        <div
                            key={index}
                            className="group flex flex-col gap-6 rounded-2xl border border-border bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-surface-secondary hover:shadow-lg hover:shadow-primary/5 sm:flex-row"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition-transform duration-300 group-hover:scale-105">
                                {Icon && <Icon className="h-6 w-6" />}
                            </div>

                            <div>
                                <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground">
                                    {feature.title}
                                </h3>

                                <p className="text-sm leading-7 text-muted sm:text-base">
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