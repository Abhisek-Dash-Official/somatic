import { pageContent } from "@/config/content";
import {
    Stethoscope,
    Database,
    Zap,
    BriefcaseMedical,
    UserPlus,
    GitMerge,
    Shield,
    Leaf,
    FileBarChart,
    Siren,
    MessageSquare,
    BrainCircuit,
    Cloud,
    PieChart,
    Users,
} from "lucide-react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `Our Services | ${siteConfig.name}`,
    description: "Discover how Somatic delivers clinical value through AI-assisted case taking and secure health records management.",
};

const IconMap: Record<string, any> = {
    Stethoscope,
    Database,
    Zap,
    BriefcaseMedical,
    UserPlus,
    GitMerge,
    Shield,
    Leaf,
    FileBarChart,
    Siren,
    MessageSquare,
    BrainCircuit,
    Cloud,
    PieChart,
    Users,
};

export default function ServicesPage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <div className="mb-14 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-accent text-primary">
                    <BriefcaseMedical className="h-8 w-8" />
                </div>

                <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                    Our <span className="text-primary">Services</span>
                </h1>

                <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                    How we deliver tangible clinical value to the Ayush healthcare ecosystem.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {pageContent.services.map((service, index) => {
                    const Icon = IconMap[service.icon];

                    return (
                        <div
                            key={index}
                            className="group rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-primary/50 hover:bg-surface-secondary"
                        >
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-accent text-primary transition-transform duration-200 group-hover:scale-105">
                                {Icon && <Icon className="h-7 w-7" />}
                            </div>

                            <h3 className="mb-3 text-xl font-bold text-foreground">
                                {service.title}
                            </h3>

                            <p className="text-base leading-relaxed text-muted">
                                {service.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}