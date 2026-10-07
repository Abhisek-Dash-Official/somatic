"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default function SomaFeatureUnavailable() {
    return (
        <div className="flex min-h-0 flex-1 items-center justify-center bg-background p-4 sm:p-6">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                <div className="border-b border-border px-5 py-5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">SOMA AI</p>
                            <h1 className="mt-0.5 text-base font-semibold text-foreground">Feature unavailable</h1>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-7 sm:px-6">
                    <p className="text-sm leading-6 text-muted">
                        This SOMA AI feature doesn&apos;t exist or isn&apos;t available yet. You can return to your conversations and continue using SOMA AI.
                    </p>

                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <Link href="/chat" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover">
                            <MessageSquare className="h-4 w-4" />Back to Chats
                        </Link>
                        <Link href="/" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:bg-surface-secondary">
                            <ArrowLeft className="h-4 w-4" />Home
                        </Link>
                    </div>
                </div>

                <div className="border-t border-border bg-surface-secondary/40 px-5 py-3 sm:px-6">
                    <p className="text-xs leading-5 text-muted">If you followed a link to reach this page, it may be outdated.</p>
                </div>
            </div>
        </div>
    );
}