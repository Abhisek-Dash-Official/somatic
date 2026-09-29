"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { navLinks } from "@/config/nav";
import {
    LayoutDashboard, Building2, Users, Ticket, Hourglass, Ambulance,
    Settings, Stethoscope, User, PlusCircle, ClipboardList, Hospital,
    LogOut, Logs, UserShield, Pill, Droplets, MoreHorizontal, ShieldCheck,
    Microscope, ShoppingBag, CreditCard, Crown
} from "lucide-react";

const IconMap: Record<string, any> = {
    LayoutDashboard, Building2, Users, Ticket, Hourglass, Ambulance,
    Settings, Stethoscope, User, PlusCircle, ClipboardList, Hospital,
    Logs, LogOut, UserShield, Pill, Droplets, MoreHorizontal, ShieldCheck,
    Microscope, ShoppingBag, CreditCard, Crown
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
            <aside className="hidden w-64 flex-col border-r border-border bg-surface md:flex">
                <div className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
                    <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Dashboard Menu
                    </div>

                    {links.map((link) => {
                        const Icon = IconMap[link.icon];
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.title}
                                href={link.href}
                                className={`group flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${isActive
                                    ? "border-primary/20 bg-accent text-accent-foreground"
                                    : "border-transparent text-muted hover:bg-surface-secondary hover:text-foreground"
                                    }`}
                            >
                                {Icon && (
                                    <Icon
                                        className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                            }`}
                                    />
                                )}
                                {link.title}
                            </Link>
                        );
                    })}
                </div>

                <div className="border-t border-border bg-background p-4">
                    <Link
                        href="/api/auth/signout"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Link>
                </div>
            </aside>

            <div className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-border bg-surface px-4 pb-safe md:hidden">
                {mobileLinks.map((link) => {
                    const Icon = IconMap[link.icon];
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.title}
                            href={link.href}
                            aria-label={link.title}
                            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${isActive
                                ? "bg-accent text-primary"
                                : "text-muted hover:bg-surface-secondary hover:text-foreground"
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
                        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${showMore || isMoreActive
                            ? "bg-accent text-primary"
                            : "text-muted hover:bg-surface-secondary hover:text-foreground"
                            }`}
                    >
                        <MoreHorizontal className="h-6 w-6" />
                    </button>
                )}
            </div>

            {showMore && moreLinks.length > 0 && (
                <div className="fixed bottom-20 right-4 z-50 w-56 rounded-2xl border border-border bg-surface p-2 shadow-xl md:hidden">
                    {moreLinks.map((link) => {
                        const Icon = IconMap[link.icon];
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.title}
                                href={link.href}
                                onClick={() => setShowMore(false)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${isActive
                                    ? "bg-accent text-primary"
                                    : "text-muted hover:bg-surface-secondary hover:text-foreground"
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