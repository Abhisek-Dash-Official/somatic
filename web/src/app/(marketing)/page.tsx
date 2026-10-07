"use client";

import Link from "next/link";
import {
    ArrowRight,
    Bot,
    ShieldCheck,
    Stethoscope,
} from "lucide-react";
import { careServices, journey, connectedServices } from "@/config/home";

export default function HomePage() {
    return (
        <main className="bg-background text-foreground">
            <section className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden px-5 py-16 sm:px-8 lg:px-12">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat"
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[#04343d]/65"
                />

                <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
                    <div className="mx-auto max-w-4xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/85 sm:text-sm">
                            Care that puts you first
                        </p>

                        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
                            When your health matters,
                            <span className="block text-[#dff8fa]">
                                you don't have to face it alone.
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
                            From understanding what you're going through to finding
                            the right care, SOMATIC helps you take the next step
                            with trusted healthcare professionals by your side.
                        </p>

                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link
                                href="/portal"
                                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                            >
                                Find the right care
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <Link
                                href="/about"
                                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/70 bg-white px-7 text-sm font-semibold text-[#0b3941] transition-colors hover:bg-[#eef8f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                            >
                                About SOMATIC
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-b border-border bg-surface">
                <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                            The SOMATIC ecosystem
                        </p>

                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                            More than a consultation.
                        </h2>

                        <p className="mt-4 text-base leading-7 text-muted">
                            Healthcare involves many people, services and decisions.
                            SOMATIC brings supported parts of that journey together
                            instead of treating them as separate systems.
                        </p>
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                        {careServices.map(({ icon: Icon, title, description, items }) => (
                            <div key={title} className="bg-surface p-6 sm:p-7">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-accent text-primary">
                                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                                </div>

                                <h3 className="mt-6 text-lg font-semibold text-foreground">
                                    {title}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-muted">
                                    {description}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                                    {items.map((item) => (
                                        <span
                                            key={item}
                                            className="text-xs font-medium text-muted"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-b border-border bg-background">
                <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-20">
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                            The healthcare journey
                        </p>

                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                            From the first need to continued care.
                        </h2>

                        <p className="mt-5 text-base leading-7 text-muted">
                            SOMATIC is designed to support the broader healthcare
                            journey, not just the moment of consultation.
                        </p>

                        <div className="mt-8 border-l-2 border-primary pl-5">
                            <p className="text-sm font-semibold text-foreground">
                                One connected journey.
                            </p>

                            <p className="mt-2 text-sm leading-6 text-muted">
                                Relevant information can move between authorized
                                users and supported healthcare services as needs
                                change.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                        {journey.map((item, index) => (
                            <div
                                key={item.number}
                                className={`flex gap-5 p-6 sm:p-7 ${index !== journey.length - 1
                                    ? "border-b border-border"
                                    : ""
                                    }`}
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
                                    {item.number}
                                </span>

                                <div>
                                    <h3 className="text-base font-semibold text-foreground sm:text-lg">
                                        {item.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-muted">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-b border-border bg-surface">
                <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
                    <div className="grid overflow-hidden rounded-2xl border border-border lg:grid-cols-[1fr_0.9fr]">
                        <div className="p-7 sm:p-10 lg:p-12">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-accent text-primary">
                                <Bot className="h-5 w-5" strokeWidth={1.8} />
                            </div>

                            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                                Human-in-the-loop
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                AI assists.
                                <br />
                                Professionals remain in control.
                            </h2>

                            <p className="mt-5 max-w-xl text-base leading-7 text-muted">
                                SOMATIC uses AI to help organize patient information,
                                extract symptoms, translate content, prepare summaries
                                and identify relevant indicators.
                            </p>

                            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
                                AI output is an assistive draft. Qualified medical
                                professionals review, correct and approve final
                                medical guidance before it reaches the patient.
                            </p>

                            <Link
                                href="/about"
                                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                            >
                                Learn about the SOMATIC approach
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="border-t border-border bg-surface-secondary p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
                            <div className="flex h-full flex-col justify-center">
                                <div className="rounded-xl border border-border bg-surface p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                                            <Bot className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                AI-assisted processing
                                            </p>
                                            <p className="text-xs text-muted">
                                                Information is organized into a structured draft.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mx-auto h-8 w-px bg-border" />

                                <div className="rounded-xl border border-border bg-surface p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                                            <Stethoscope className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                Professional review
                                            </p>
                                            <p className="text-xs text-muted">
                                                A qualified medical professional reviews the information.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mx-auto h-8 w-px bg-border" />

                                <div className="rounded-xl border border-primary/30 bg-accent p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                Approved medical guidance
                                            </p>
                                            <p className="text-xs text-muted">
                                                Final instructions are delivered after professional review.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-b border-border bg-background">
                <div className="mx-auto w-full max-w-5xl px-5 py-16 text-center sm:px-8 lg:py-20">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        One connected network
                    </p>

                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        Healthcare services, connected around the patient.
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted">
                        Patients and supported healthcare teams can work through
                        connected digital workflows instead of isolated services.
                    </p>

                    <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center overflow-hidden rounded-2xl border border-border bg-surface">
                        {connectedServices.map((service) => (
                            <div
                                key={service}
                                className="border-b border-r border-border px-5 py-4 text-sm font-medium text-muted last:border-r-0"
                            >
                                {service}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#0b2f37]">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-20">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7edce3]">
                            Care that puts you first
                        </p>

                        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            Explore the healthcare ecosystem.
                        </h2>

                        <p className="mt-4 max-w-xl text-sm leading-6 text-[#b7d1d5]">
                            Access the services and workflows available through
                            your SOMATIC portal.
                        </p>
                    </div>

                    <Link
                        href="/portal"
                        className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-[#0b2f37] transition-colors hover:bg-[#e8f5f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        Open SOMATIC
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}