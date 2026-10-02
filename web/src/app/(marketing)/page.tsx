"use client";

import { siteConfig } from "@/config/site";
import Link from "next/link";
import { ArrowRight, HeartPulse, ShieldCheck } from "lucide-react";

export default function HomePage() {
    return (
        <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
            <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat" />
            <div className="absolute inset-0 bg-[rgba(7,17,22,0.45)] in-[.light]:bg-[rgba(244,249,250,0)]" />

            <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center border border-primary/40 bg-background/85 text-primary shadow-lg sm:h-18 sm:w-18">
                    <HeartPulse className="h-8 w-8 sm:h-9 sm:w-9" />
                </div>

                <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-primary sm:text-sm">
                    Your Health. Our Priority.
                </p>

                <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                    From Emergency to Recovery —
                    <span className="block text-primary">
                        SOMATIC is with you at every step.
                    </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-6 text-foreground/70 sm:text-base">
                    First aid, doctor consultations, lab tests, medical reports and everyday healthcare — all connected in one place.
                </p>

                <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Link
                        href="/portal"
                        className="group flex w-full items-center justify-center gap-2 bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto"
                    >
                        Get Started
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                        href="/about"
                        className="flex w-full items-center justify-center gap-2 border border-border bg-background/75 px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary sm:w-auto"
                    >
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Learn More
                    </Link>
                </div>

                <p className="mt-8 text-xs font-medium tracking-wide text-foreground/75 sm:text-sm">
                    Smarter Care. <span className="text-primary">Healthier Tomorrow.</span>
                </p>
            </div>
        </div>
    );
}