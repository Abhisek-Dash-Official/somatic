"use client";

import Image from "next/image";
import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, BookOpen, HeartPulse, LayoutDashboard, Microscope, ShieldCheck, ShoppingBag, Sparkles, User } from "lucide-react";
import { navLinks } from "@/config/nav";
import { useUserStore } from "@/store/useUserStore";

const iconMap = { LayoutDashboard, ShieldCheck, Microscope, HeartPulse, ShoppingBag, BookOpen };

const suggestions = [
    "Create a health routine",
    "What should I eat?",
    "Understand symptoms",
    "Medicine information",
    "Healthy lifestyle tips",
];

export default function PortalPage() {
    const { user } = useUserStore();
    const role: any = user?.role;
    const portalItems: any = navLinks.portalNav;

    return (
        <main className="min-h-[calc(100vh-5rem)] bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <section className="grid overflow-hidden rounded-2xl border border-border bg-surface lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
                        <div className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-wide text-primary">
                            <Activity className="h-4 w-4" />
                            SOMATIC HEALTHCARE
                        </div>

                        <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
                            Your healthcare,
                            <br />
                            connected.
                        </h1>

                        <p className="mt-5 max-w-lg text-base leading-7 text-muted">
                            Access your SOMATIC workspace, healthcare services, resources and trusted health information from one place.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={getDashboardHref(role)}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                                {role ? "Open Dashboard" : "Sign In"}
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <Link
                                href="/chat"
                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                                Ask SOMA AI
                            </Link>
                        </div>
                    </div>

                    <div className="relative min-h-72 border-t border-border lg:min-h-107.5 lg:border-l lg:border-t-0">
                        <Image
                            src="/portal/hero.jpg"
                            alt="SOMATIC healthcare"
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 45vw"
                        />
                    </div>
                </section>

                <section className="mt-14">
                    <div className="mb-7">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">SOMATIC</p>

                        <div className="mt-2">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Explore</h2>
                            <p className="mt-1 text-sm text-muted">Your healthcare tools and resources.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {portalItems.map((item: any) => {
                            const Icon = iconMap[item.icon as keyof typeof iconMap];
                            const href = item.hrefByRole?.[role] || item.href;

                            if (!href) return null;

                            return (
                                <Link
                                    key={item.title}
                                    href={href}
                                    className="group overflow-hidden rounded-xl border border-border bg-surface transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    <div className="relative h-40 overflow-hidden bg-surface-secondary">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition duration-300 group-hover:scale-[1.03]"
                                        />
                                    </div>

                                    <div className="p-5">
                                        <div className="mb-4 flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-accent text-primary">
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                                        </div>

                                        <p className="text-sm leading-6 text-muted">{item.description}</p>

                                        <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-accent-foreground">
                                            Open
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-14 pb-6">
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="p-6 sm:p-10">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-accent text-primary">
                                        <Sparkles className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-foreground">SOMA AI</p>
                                        <p className="text-xs text-muted">Healthcare companion</p>
                                    </div>
                                </div>

                                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                    Have a healthcare question?
                                </h2>

                                <p className="mt-3 max-w-lg text-sm leading-7 text-muted sm:text-base">
                                    Chat with SOMA AI for everyday healthcare guidance, food and lifestyle suggestions, health routines, medicine information and help understanding common symptoms.
                                </p>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {suggestions.map((s) => (
                                        <Link
                                            key={s}
                                            href="/chat"
                                            className="rounded-md border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
                                        >
                                            {s}
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-6 flex items-start gap-3 border-l-2 border-warning bg-warning/5 px-4 py-3">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                                    <p className="text-xs leading-5 text-muted">
                                        <strong className="font-bold text-warning">Medical Disclaimer:</strong>{" "}
                                        SOMA AI provides general health information and guidance, not medical diagnosis or professional medical advice. Do not rely on it for emergencies or urgent medical decisions.
                                    </p>
                                </div>

                                <Link
                                    href="/chat"
                                    className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    Chat with SOMA AI
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="border-t border-border bg-surface-secondary p-6 sm:p-10 lg:border-l lg:border-t-0">
                                <div className="flex h-full flex-col justify-center gap-5">
                                    <div className="flex items-start justify-end gap-3">
                                        <p className="max-w-[80%] rounded-xl rounded-tr-sm bg-accent px-4 py-3 text-sm leading-6 text-foreground">
                                            What should I eat to keep my energy up during the day?
                                        </p>

                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-muted">
                                            <User className="h-4 w-4" />
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-accent text-primary">
                                            <Sparkles className="h-4 w-4" />
                                        </div>

                                        <p className="max-w-[85%] rounded-xl rounded-tl-sm border border-border bg-surface px-4 py-3 text-sm leading-6 text-muted">
                                            Balanced meals with whole grains, protein and vegetables can help maintain steady energy. Want me to build a simple daily meal routine?
                                        </p>
                                    </div>

                                    <div className="ml-11 mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        SOMA AI
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function getDashboardHref(role: any) {
    if (!role) return "/login";

    const dashboard: any = navLinks.portalNav.find((item: any) => item.title === "Dashboard");
    return dashboard?.hrefByRole?.[role] || "/login";
}