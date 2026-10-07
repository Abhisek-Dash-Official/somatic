"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { navLinks } from "@/config/nav";
import {
    LayoutDashboard, Building2, Users, Ticket, Hourglass, Ambulance,
    Settings, Stethoscope, User, PlusCircle, ClipboardList, Hospital,
    LogOut, Logs, UserShield, Pill, Droplets, MoreHorizontal,
    ShieldCheck, Microscope, ShoppingBag, CreditCard, Crown, BookOpen,
    BrainCircuit, FileSearch
} from "lucide-react";

const IconMap: Record<string, any> = {
    LayoutDashboard, Building2, Users, Ticket, Hourglass, Ambulance,
    Settings, Stethoscope, User, PlusCircle, ClipboardList, Hospital,
    Logs, LogOut, UserShield, Pill, Droplets, MoreHorizontal, ShieldCheck,
    Microscope, ShoppingBag, CreditCard, Crown, BookOpen, BrainCircuit, FileSearch
};

export default function Sidebar() {
    const { user } = useUserStore();
    const pathname = usePathname();
    const [showMore, setShowMore] = useState(false);

    const role = (user?.role as keyof typeof navLinks.sidebarNav) || "patient";
    const links = navLinks.sidebarNav[role] || navLinks.sidebarNav.patient;

    const mobileLinks = links.slice(0, 5);
    const moreLinks = links.slice(5);
    const isMoreActive = moreLinks.some((link) => pathname === link.href);

    return (
        <>
            <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
                <div className="flex-1 overflow-y-auto px-3 py-5">
                    <div className="mb-4 px-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                            Workspace
                        </p>
                        <p className="mt-1 text-xs text-muted">
                            Manage your healthcare
                        </p>
                    </div>

                    <nav className="space-y-1">
                        {links.map((link) => {
                            const Icon = IconMap[link.icon];
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.title}
                                    href={link.href}
                                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-accent text-accent-foreground shadow-sm"
                                        : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                        }`}
                                >
                                    {Icon && (
                                        <Icon
                                            className={`h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-primary" : "text-muted-foreground"
                                                }`}
                                        />
                                    )}

                                    <span className="min-w-0 flex-1 truncate">
                                        {link.title}
                                    </span>

                                    {isActive && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="border-t border-border p-3">
                    <Link
                        href="/api/auth/signout"
                        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-4.5 w-4.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                        Sign Out
                    </Link>
                </div>
            </aside>

            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-2 pb-safe backdrop-blur md:hidden">
                <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
                    {mobileLinks.map((link) => {
                        const Icon = IconMap[link.icon];
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.title}
                                href={link.href}
                                aria-label={link.title}
                                className={`relative flex h-12 min-w-12 items-center justify-center rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-accent text-primary"
                                    : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                    }`}
                            >
                                {Icon && <Icon className={`h-5 w-5 ${isActive ? "scale-105" : ""}`} />}
                                {isActive && (
                                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                                )}
                            </Link>
                        );
                    })}

                    {moreLinks.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowMore((prev) => !prev)}
                            aria-label="More"
                            aria-expanded={showMore}
                            className={`relative flex h-12 min-w-12 items-center justify-center rounded-lg transition-colors ${showMore || isMoreActive
                                ? "bg-accent text-primary"
                                : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                }`}
                        >
                            <MoreHorizontal className="h-5 w-5" />
                            {(showMore || isMoreActive) && (
                                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {showMore && moreLinks.length > 0 && (
                <>
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] md:hidden"
                        onClick={() => setShowMore(false)}
                    />

                    <div className="fixed bottom-18 right-3 z-50 w-60 overflow-hidden rounded-xl border border-border bg-surface p-2 shadow-2xl md:hidden">
                        {moreLinks.map((link) => {
                            const Icon = IconMap[link.icon];
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.title}
                                    href={link.href}
                                    onClick={() => setShowMore(false)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                        }`}
                                >
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {link.title}
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}
        </>
    );
}