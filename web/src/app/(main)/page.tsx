import { siteConfig } from "@/config/site";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 md:py-32 text-center relative overflow-hidden">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-75 w-75 md:h-125 md:w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[80px] md:blur-[120px]" />

            <div className="z-10 mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl md:rounded-3xl border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.15)] backdrop-blur-md">
                <Activity className="h-8 w-8 md:h-10 md:w-10" />
            </div>

            <h1 className="z-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
                Welcome to <span className="bg-linear-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">{siteConfig.name}</span>
            </h1>

            <p className="z-10 max-w-2xl text-base sm:text-lg text-slate-400 mb-8 md:mb-10 leading-relaxed px-4">
                {siteConfig.description}
            </p>

            <div className="z-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
                <Link
                    href="/patient"
                    className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                >
                    Get Started <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                    href="/about"
                    className="flex w-full sm:w-auto items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                    Learn More
                </Link>
            </div>
        </div>
    );
}