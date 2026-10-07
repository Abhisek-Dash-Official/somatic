"use client";

import Link from "next/link";
import { ServerCrash, RotateCcw, Home, MessageSquareWarning } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
            <div className="w-full max-w-2xl">
                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="flex flex-col items-center px-5 py-9 text-center sm:px-10 sm:py-12">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 text-danger sm:h-20 sm:w-20">
                            <ServerCrash className="h-8 w-8 sm:h-10 sm:w-10" />
                        </div>

                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-danger">
                            System error
                        </p>

                        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                            Something went wrong
                        </h1>

                        <p className="mt-4 max-w-lg text-sm leading-6 text-muted sm:text-base">
                            An unexpected error occurred within the Somatic platform. The issue has been detected and can be retried safely.
                        </p>

                        <p className="mt-3 text-sm font-medium text-foreground">
                            Your account and health data remain protected.
                        </p>

                        <div className="mt-8 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover sm:w-auto"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Try Again
                            </button>

                            <Link
                                href="/"
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-7 text-sm font-medium text-foreground transition hover:bg-surface-secondary sm:w-auto"
                            >
                                <Home className="h-4 w-4" />
                                Back to Home
                            </Link>
                        </div>
                    </div>

                    <div className="border-t border-border px-5 py-5 text-center sm:px-8">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary"
                        >
                            <MessageSquareWarning className="h-4 w-4" />
                            Report this issue to Support
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}