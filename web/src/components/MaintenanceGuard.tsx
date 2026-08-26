import React from "react";
import { Activity } from "lucide-react";
import connectToDatabase from "@/lib/db";
import SystemSetting from "@/models/SystemSetting";

interface MaintenanceGuardProps {
    children: React.ReactNode;
}

export default async function MaintenanceGuard({
    children,
}: MaintenanceGuardProps) {
    let isMaintenance = false;

    try {
        await connectToDatabase();

        const settings = await SystemSetting.findOne()
            .select("maintenance_mode")
            .lean();

        isMaintenance = settings?.maintenance_mode === true;
    } catch (error) {
        console.error("Maintenance check failed:", error);
    }

    if (!isMaintenance) {
        return <>{children}</>;
    }

    return (
        <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0B1120] p-4 text-white">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-[120px]" />

            <div className="z-10 flex flex-col items-center text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.2)] backdrop-blur-md">
                    <Activity className="h-12 w-12 animate-pulse" />
                </div>

                <h1 className="bg-linear-to-br from-white to-slate-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
                    System Upgrading
                </h1>

                <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-400">
                    We are optimizing the systems to improve your experience. Services
                    will be restored shortly.
                </p>

                <div className="mt-10 rounded-full border border-slate-700/50 bg-slate-800/50 px-6 py-2 backdrop-blur-sm">
                    <span className="flex items-center gap-3 text-sm font-medium text-slate-300">
                        <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500" />
                        </span>
                        Systems optimizing...
                    </span>
                </div>
            </div>
        </main>
    );
}