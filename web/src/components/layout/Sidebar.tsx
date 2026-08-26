"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { navLinks } from "@/config/nav";
import {
    LayoutDashboard, Building2, Users, Ticket,
    Settings, Stethoscope, User, PlusCircle, ClipboardList, LogOut
} from "lucide-react";

const IconMap: Record<string, any> = {
    LayoutDashboard, Building2, Users, Ticket,
    Settings, Stethoscope, User, PlusCircle, ClipboardList,
};

export default function Sidebar() {
    const { user } = useUserStore();
    const pathname = usePathname();

    const role = (user?.role as keyof typeof navLinks.sidebarNav) || "patient";
    const links = navLinks.sidebarNav[role] || navLinks.sidebarNav.patient;

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#0f172a]/50 backdrop-blur-xl md:flex">
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
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
                                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${isActive ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                                    }`}
                            >
                                {Icon && <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-white"}`} />}
                                {link.title}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop Logout Button */}
                <div className="border-t border-white/10 p-4 bg-black/10">
                    <Link href="/api/auth/signout" className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300">
                        <LogOut className="h-4 w-4" /> Sign Out
                    </Link>
                </div>
            </aside>

            {/* MOBILE BOTTOM NAVIGATION */}
            <div className="md:hidden fixed bottom-0 left-0 w-full z-50 flex h-16 items-center justify-around border-t border-white/10 bg-[#0B1120] pb-safe px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                {links.map((link) => {
                    const Icon = IconMap[link.icon];
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.title}
                            href={link.href}
                            aria-label={link.title}
                            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${isActive ? "bg-blue-600/20 text-blue-400" : "text-slate-400 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {Icon && <Icon className="h-6 w-6" />}
                        </Link>
                    );
                })}
            </div>
        </>
    );
}