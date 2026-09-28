"use client";

import { siteConfig } from "@/config/site";
import Link from "next/link";
import { ArrowRight, Activity, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
    return (
        <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-6 md:py-32">
            <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat" />
            <div className="absolute inset-0 bg-[#03130d]/75" />

            <div className="relative z-10 mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/40 bg-background/80 text-primary backdrop-blur-sm md:h-20 md:w-20">
                <Activity className="h-8 w-8 md:h-10 md:w-10" />
            </div>

            <div className="relative z-10 mb-5 flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-assisted healthcare platform
            </div>

            <h1 className="relative z-10 max-w-5xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Welcome to{" "}
                <span className="text-primary">{siteConfig.name}</span>
            </h1>

            <p className="relative z-10 mt-6 max-w-2xl px-4 text-base leading-relaxed text-white/75 sm:text-lg">
                {siteConfig.description}
            </p>

            <div className="relative z-10 mt-9 flex w-full flex-col gap-3 px-4 sm:w-auto sm:flex-row sm:px-0">
                <Link
                    href="/portal"
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto"
                >
                    Get Started
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                    href="/about"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/20 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/35 sm:w-auto"
                >
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Learn More
                </Link>
            </div>
        </div>
    );
}