"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Home, ArrowLeft, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFoundPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
            <div className={`w-full max-w-2xl text-center transition-all duration-700 ease-out ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-accent text-primary sm:h-20 sm:w-20">
                    <Activity className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>

                <p className="mt-7 font-mono text-6xl font-semibold tracking-[0.12em] text-primary sm:text-7xl">
                    404
                </p>

                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    Page not found
                </p>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    This page isn&apos;t available
                </h1>

                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted sm:text-base">
                    The page you&apos;re looking for may have been moved, removed, or the link may be outdated.
                </p>

                <p className="mt-3 text-sm font-medium text-foreground">
                    Your account and health data remain secure.
                </p>

                <div className="mt-8 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-7 text-sm font-medium text-foreground transition hover:bg-surface-secondary sm:w-auto"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>

                    <Link
                        href="/"
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover sm:w-auto"
                    >
                        <Home className="h-4 w-4" />
                        Return Home
                    </Link>
                </div>

                <div className="mx-auto mt-10 border-t border-border pt-7">
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Need help? Contact Support
                    </Link>
                </div>
            </div>
        </main>
    );
}