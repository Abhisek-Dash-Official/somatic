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
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0B1120] px-4 overflow-hidden">
            <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Main Content Card */}
            <div
                className={`relative z-10 flex flex-col items-center text-center w-full max-w-2xl transition-all duration-1000 ease-out transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.15)]">
                    <Activity className="h-10 w-10 animate-pulse" />
                </div>

                <h1 className="text-7xl font-mono font-bold tracking-widest text-teal-400 mb-2 drop-shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                    404
                </h1>

                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    No Signal Found
                </h2>

                <p className="mb-10 max-w-md text-base sm:text-lg text-slate-400 leading-relaxed">
                    The page you're looking for may have been moved or the link is outdated.
                    <span className="block mt-2 font-medium text-slate-300">
                        Don't worry — your account and health data remain strictly secure.
                    </span>
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                    <button
                        onClick={() => router.back()}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-transparent px-6 py-3.5 font-semibold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Go Back
                    </button>

                    <Link
                        href="/"
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 font-bold text-white transition-all hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                    >
                        <Home className="h-5 w-5" />
                        Return Home
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 w-full flex justify-center">
                    <Link
                        href="/contact"
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-400 transition-colors"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Need help? Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}