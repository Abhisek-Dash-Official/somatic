"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default function SomaFeatureUnavailable() {
    return (
        <div className="flex min-h-0 flex-1 items-center justify-center bg-background p-6">
            <div className="w-full max-w-md border border-border bg-surface">
                <div className="border-b border-border px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center border border-border bg-surface-secondary text-muted">
                            <MessageSquare className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted">
                                SOMA AI
                            </p>
                            <h1 className="mt-0.5 text-base font-semibold text-foreground">
                                Feature unavailable
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-7">
                    <p className="text-sm leading-6 text-muted">
                        This SOMA AI feature doesn&apos;t exist or isn&apos;t
                        available yet. You can return to your conversations and
                        continue using SOMA AI.
                    </p>

                    <div className="mt-6 flex gap-3">
                        <Link
                            href="/chat"
                            className="inline-flex h-10 items-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Back to Chats
                        </Link>

                        <Link
                            href="/"
                            className="inline-flex h-10 items-center gap-2 border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-secondary"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Home
                        </Link>
                    </div>
                </div>

                <div className="border-t border-border px-6 py-3">
                    <p className="text-xs text-muted">
                        If you followed a link to reach this page, it may be outdated.
                    </p>
                </div>
            </div>
        </div>
    );
}