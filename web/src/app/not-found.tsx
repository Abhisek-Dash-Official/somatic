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
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div
                className={`flex w-full max-w-2xl flex-col items-center text-center transition-all duration-700 ease-out ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                    }`}
            >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-xl border border-primary/30 bg-accent text-primary">
                    <Activity className="h-10 w-10 animate-pulse" />
                </div>

                <h1 className="mb-2 font-mono text-7xl font-bold tracking-widest text-primary">
                    404
                </h1>

                <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                    No Signal Found
                </h2>

                <p className="mb-10 max-w-md text-base leading-relaxed text-muted sm:text-lg">
                    The page you're looking for may have been moved or the link is outdated.
                    <span className="mt-2 block font-medium text-foreground">
                        Don't worry — your account and health data remain strictly secure.
                    </span>
                </p>

                <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        onClick={() => router.back()}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-6 py-3.5 font-semibold text-foreground transition hover:bg-accent sm:w-auto"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Go Back
                    </button>

                    <Link
                        href="/"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-bold text-primary-foreground transition hover:bg-primary-hover sm:w-auto"
                    >
                        <Home className="h-5 w-5" />
                        Return Home
                    </Link>
                </div>

                <div className="mt-12 flex w-full justify-center border-t border-border pt-8">
                    <Link
                        href="/contact"
                        className="flex items-center gap-2 text-sm text-muted transition hover:text-primary"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Need help? Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}