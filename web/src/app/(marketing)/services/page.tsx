import { pageContent } from "@/config/content";
import {
    BriefcaseMedical,
    UserRound,
    BrainCircuit,
    Siren,
    Microscope,
    FileSearch,
    ShoppingBag,
    ShieldCheck,
    BookOpen,
} from "lucide-react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `Our Services | ${siteConfig.name}`,
    description: "Discover how Somatic delivers clinical value through AI-assisted case taking and secure health records management.",
};

const IconMap: Record<string, any> = {
    BriefcaseMedical,
    UserRound,
    BrainCircuit,
    Siren,
    Microscope,
    FileSearch,
    ShoppingBag,
    ShieldCheck,
    BookOpen,
};

export default function ServicesPage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
            <div className="mb-12 text-center sm:mb-14">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    <BriefcaseMedical className="h-3.5 w-3.5 text-primary" />
                    Healthcare Services
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                    Our <span className="text-primary">Services</span>
                </h1>

                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                    How we deliver tangible clinical value to the Ayush healthcare ecosystem.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {pageContent.services.map((service, index) => {
                    const Icon = IconMap[service.icon];

                    return (
                        <div
                            key={index}
                            className="group rounded-2xl border border-border bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-surface-secondary hover:shadow-lg hover:shadow-primary/5"
                        >
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary transition-transform duration-300 group-hover:scale-105">
                                {Icon && <Icon className="h-6 w-6" />}
                            </div>

                            <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground">
                                {service.title}
                            </h3>

                            <p className="text-sm leading-7 text-muted sm:text-base">
                                {service.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}