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
        <main className="min-h-[calc(100vh-5rem)] bg-[#08120D] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                {/* HERO */}
                <section className="grid overflow-hidden rounded-2xl border border-[#20382C] bg-[#0D1913] lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
                        <div className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-wide text-emerald-400">
                            <Activity className="h-4 w-4" />
                            SOMATIC HEALTHCARE
                        </div>

                        <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-[#E8F3EC] sm:text-5xl">
                            Your healthcare,
                            <br />
                            connected.
                        </h1>

                        <p className="mt-5 max-w-lg text-base leading-7 text-[#91AA9C]">
                            Access your SOMATIC workspace, healthcare services, resources and trusted health information from one place.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={getDashboardHref(role)}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-[#04130C] transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                            >
                                {role ? "Open Dashboard" : "Sign In"}
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <Link
                                href="/chat"
                                className="inline-flex items-center gap-2 rounded-lg border border-[#315340] px-5 py-3 text-sm font-semibold text-[#D4E5DA] transition hover:bg-[#14271C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                            >
                                Ask SOMA AI
                            </Link>
                        </div>
                    </div>

                    <div className="relative min-h-72 border-t border-[#20382C] lg:min-h-107.5 lg:border-l lg:border-t-0">
                        <Image src="/portal/hero.jpg" alt="SOMATIC healthcare" fill priority className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 45vw" />
                    </div>
                </section>

                {/* EXPLORE */}
                <section className="mt-14">
                    <div className="mb-7">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-500">SOMATIC</p>
                        <div className="mt-2 flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-[#E8F3EC]">Explore</h2>
                                <p className="mt-1 text-sm text-[#82998C]">Your healthcare tools and resources.</p>
                            </div>
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
                                    className="group overflow-hidden rounded-xl border border-[#20382C] bg-[#0D1913] transition duration-200 hover:-translate-y-0.5 hover:border-[#315340] hover:bg-[#102019] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                                >
                                    <div className="relative h-40 overflow-hidden bg-[#13231A]">
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
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#173D2A] text-emerald-400">
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            <h3 className="text-base font-bold text-[#E8F3EC]">{item.title}</h3>
                                        </div>

                                        <p className="text-sm leading-6 text-[#8FA89A]">{item.description}</p>

                                        <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#B7D8C5]">
                                            Open
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* SOMA AI */}
                <section className="mt-14 pb-6">
                    <div className="overflow-hidden rounded-2xl border border-[#20382C] bg-[#0D1913]">
                        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="p-6 sm:p-10">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#173D2A] text-emerald-400">
                                        <Sparkles className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-[#E8F3EC]">SOMA AI</p>
                                        <p className="text-xs text-[#82998C]">Healthcare companion</p>
                                    </div>
                                </div>

                                <h2 className="text-3xl font-bold tracking-tight text-[#E8F3EC]">
                                    Have a healthcare question?
                                </h2>

                                <p className="mt-3 max-w-lg text-sm leading-7 text-[#91AA9C] sm:text-base">
                                    Chat with SOMA AI for everyday healthcare guidance, food and lifestyle suggestions, health routines, medicine information and help understanding common symptoms.
                                </p>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {suggestions.map((s) => (
                                        <Link
                                            key={s}
                                            href="/chat"
                                            className="rounded-md border border-[#294536] bg-[#112219] px-3 py-1.5 text-xs font-medium text-[#B8D8C5] transition hover:border-[#3B6C50] hover:bg-[#173522] hover:text-emerald-300"
                                        >
                                            {s}
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-6 flex items-start gap-3 border-l-2 border-amber-500/70 bg-[#17150C] px-4 py-3">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />

                                    <p className="text-xs leading-5 text-[#CDBF91]">
                                        SOMA AI provides general health information and guidance, not medical diagnosis or professional medical advice. Do not rely on it for emergencies or urgent medical decisions.
                                    </p>
                                </div>

                                <Link
                                    href="/chat"
                                    className="mt-7 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-[#04130C] transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                                >
                                    Chat with SOMA AI
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {/* Chat preview */}
                            <div className="border-t border-[#20382C] bg-[#0A1510] p-6 sm:p-10 lg:border-l lg:border-t-0">
                                <div className="flex h-full flex-col justify-center gap-5">
                                    <div className="flex items-start justify-end gap-3">
                                        <p className="max-w-[80%] rounded-xl rounded-tr-sm bg-[#174A32] px-4 py-3 text-sm leading-6 text-[#E8F3EC]">
                                            What should I eat to keep my energy up during the day?
                                        </p>

                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A3024] text-[#A9CBB7]">
                                            <User className="h-4 w-4" />
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#173D2A] text-emerald-400">
                                            <Sparkles className="h-4 w-4" />
                                        </div>

                                        <p className="max-w-[85%] rounded-xl rounded-tl-sm border border-[#263D31] bg-[#111E17] px-4 py-3 text-sm leading-6 text-[#C2D5C9]">
                                            Balanced meals with whole grains, protein and vegetables can help maintain steady energy. Want me to build a simple daily meal routine?
                                        </p>
                                    </div>

                                    <div className="ml-11 mt-1 flex items-center gap-2 text-xs text-[#657D70]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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