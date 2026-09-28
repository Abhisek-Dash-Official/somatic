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
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="flex w-full max-w-2xl flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger">
                    <ServerCrash className="h-10 w-10" />
                </div>

                <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                    System Exception Detected
                </h1>

                <p className="mb-8 max-w-md text-base leading-relaxed text-muted">
                    An unexpected error occurred within the Somatic platform. Our automated monitors have logged this exception.
                    <span className="mt-2 block text-foreground">
                        Patient health records and session data remain securely encrypted and unaffected.
                    </span>
                </p>

                <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        onClick={() => reset()}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger px-8 py-3.5 font-bold text-white transition hover:opacity-90 sm:w-auto"
                    >
                        <RotateCcw className="h-5 w-5" />
                        Attempt Recovery
                    </button>

                    <Link
                        href="/"
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-6 py-3.5 font-semibold text-foreground transition hover:bg-accent sm:w-auto"
                    >
                        <Home className="h-5 w-5" />
                        Back to Home
                    </Link>
                </div>

                <div className="mt-12 flex w-full justify-center border-t border-border pt-8">
                    <Link
                        href="/contact"
                        className="flex items-center gap-2 text-sm text-muted transition hover:text-danger"
                    >
                        <MessageSquareWarning className="h-4 w-4" />
                        Report this issue to Admin Support
                    </Link>
                </div>
            </div>
        </div>
    );
}