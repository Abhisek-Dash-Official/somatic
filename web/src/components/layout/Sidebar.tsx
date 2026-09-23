"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { navLinks } from "@/config/nav";
import {
    LayoutDashboard, Building2, Users, Ticket, Hourglass, Ambulance,
    Settings, Stethoscope, User, PlusCircle, ClipboardList,
    LogOut, Logs, UserShield, Pill, Droplets, MoreHorizontal,
} from "lucide-react";

const IconMap: Record<string, any> = {
    LayoutDashboard, Building2, Users, Ticket, Hourglass, Ambulance,
    Settings, Stethoscope, User, PlusCircle, ClipboardList,
    Logs, LogOut, UserShield, Pill, Droplets, MoreHorizontal
};

export default function Sidebar() {
    const { user } = useUserStore();
    const pathname = usePathname();
    const [showMore, setShowMore] = useState(false);

    const role = (user?.role as keyof typeof navLinks.sidebarNav) || "patient";
    const links = navLinks.sidebarNav[role] || navLinks.sidebarNav.patient;

    const mobileLinks = links.slice(0, 6);
    const moreLinks = links.slice(6);

    const isMoreActive = moreLinks.some((link) => pathname === link.href);

    return (
        <>
            <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#0f172a]/50 backdrop-blur-xl md:flex">
                <div className="flex-1 overflow-y-auto space-y-2 px-4 py-6">
                    <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Dashboard Menu
                    </div>

                    {links.map((link) => {
                        const Icon = IconMap[link.icon];
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.title}
                                href={link.href}
                                className={`group flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${isActive
                                    ? "border-blue-500/20 bg-blue-600/10 text-blue-400"
                                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {Icon && (
                                    <Icon
                                        className={`h-5 w-5 transition-colors ${isActive
                                            ? "text-blue-400"
                                            : "text-slate-500 group-hover:text-white"
                                            }`}
                                    />
                                )}
                                {link.title}
                            </Link>
                        );
                    })}
                </div>

                <div className="border-t border-white/10 bg-black/10 p-4">
                    <Link
                        href="/api/auth/signout"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Link>
                </div>
            </aside>

            <div className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-white/10 bg-[#0B1120] px-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:hidden">
                {mobileLinks.map((link) => {
                    const Icon = IconMap[link.icon];
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.title}
                            href={link.href}
                            aria-label={link.title}
                            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${isActive
                                ? "bg-blue-600/20 text-blue-400"
                                : "text-slate-400 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {Icon && <Icon className="h-6 w-6" />}
                        </Link>
                    );
                })}

                {moreLinks.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setShowMore((prev) => !prev)}
                        aria-label="More"
                        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${showMore || isMoreActive
                            ? "bg-blue-600/20 text-blue-400"
                            : "text-slate-400 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        <MoreHorizontal className="h-6 w-6" />
                    </button>
                )}
            </div>

            {showMore && moreLinks.length > 0 && (
                <div className="fixed bottom-20 right-4 z-50 w-56 rounded-2xl border border-white/10 bg-[#0f172a] p-2 shadow-2xl md:hidden">
                    {moreLinks.map((link) => {
                        const Icon = IconMap[link.icon];
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.title}
                                href={link.href}
                                onClick={() => setShowMore(false)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${isActive
                                    ? "bg-blue-600/10 text-blue-400"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {Icon && <Icon className="h-5 w-5" />}
                                {link.title}
                            </Link>
                        );
                    })}
                </div>
            )}
        </>
    );
}