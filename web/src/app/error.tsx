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
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0B1120] px-4 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Main Content Card */}
            <div className="relative z-10 flex flex-col items-center text-center w-full max-w-2xl">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                    <ServerCrash className="h-10 w-10" />
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    System Exception Detected
                </h1>

                <p className="mb-8 max-w-md text-base text-slate-400 leading-relaxed">
                    An unexpected error occurred within the Somatic platform. Our automated monitors have logged this exception.
                    <span className="block mt-2 text-slate-300">
                        Patient health records and session data remain securely encrypted and unaffected.
                    </span>
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                    <button
                        onClick={() => reset()}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-3.5 font-bold text-white transition-all hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                    >
                        <RotateCcw className="h-5 w-5" />
                        Attempt Recovery
                    </button>

                    <Link
                        href="/"
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-transparent px-6 py-3.5 font-semibold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                    >
                        <Home className="h-5 w-5" />
                        Back to Home
                    </Link>
                </div>

                {/* Support Link */}
                <div className="mt-12 pt-8 border-t border-slate-800 w-full flex justify-center">
                    <Link
                        href="/contact"
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-400 transition-colors"
                    >
                        <MessageSquareWarning className="h-4 w-4" />
                        Report this issue to Admin Support
                    </Link>
                </div>
            </div>
        </div>
    );
}