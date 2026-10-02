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
    Microscope, ShoppingBag, CreditCard, Crown, BookOpen, BrainCircuit
} from "lucide-react";

const IconMap: Record<string, any> = {
    LayoutDashboard, Building2, Users, Ticket, Hourglass, Ambulance,
    Settings, Stethoscope, User, PlusCircle, ClipboardList, Hospital,
    Logs, LogOut, UserShield, Pill, Droplets, MoreHorizontal, ShieldCheck,
    Microscope, ShoppingBag, CreditCard, Crown, BookOpen, BrainCircuit
};

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

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
            <style>{`
                @keyframes sb-in {
                    from { opacity: 0; transform: translateX(-14px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes sb-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes sb-pop {
                    from { opacity: 0; transform: translateY(14px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes sb-grow {
                    from { transform: scaleX(0); }
                    to   { transform: scaleX(1); }
                }
                @keyframes sb-dot {
                    from { transform: scale(0); }
                    to   { transform: scale(1); }
                }
                @keyframes sb-pulse {
                    0%   { box-shadow: 0 0 0 0 rgba(8, 169, 181, 0.55); }
                    70%  { box-shadow: 0 0 0 6px rgba(8, 169, 181, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(8, 169, 181, 0); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .sb-anim { animation: none !important; }
                    .sb-fx { transition: none !important; }
                }
            `}</style>

            <aside className="hidden w-64 flex-col border-r border-[#1d343c] bg-[#0d1a20] md:flex">
                <div className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
                    <div className="mb-4 px-2">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[#687d83]">
                            Dashboard Menu
                        </div>
                        <span
                            className="sb-anim mt-2 block h-px w-10 origin-left bg-[#08a9b5]"
                            style={{ animation: `sb-grow 0.7s ${EASE} 0.2s both` }}
                        />
                    </div>

                    {links.map((link, i) => {
                        const Icon = IconMap[link.icon];
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.title}
                                href={link.href}
                                className={`sb-anim group relative flex items-center gap-3 overflow-hidden px-3 py-3 text-sm font-medium transition-colors duration-300 active:scale-[0.98] ${isActive
                                    ? "text-[#62d8d8]"
                                    : "text-[#91a5aa] hover:text-[#e8f1f3]"
                                    }`}
                                style={{ animation: `sb-in 0.5s ${EASE} ${i * 45}ms both` }}
                            >
                                <span
                                    aria-hidden="true"
                                    className="sb-fx absolute inset-0 origin-left scale-x-0 bg-[#12242b] transition-transform duration-300 ease-out group-hover:scale-x-100"
                                />
                                <span
                                    aria-hidden="true"
                                    className={`sb-fx absolute inset-0 origin-left bg-[#10353b] transition-transform duration-500 ${isActive ? "scale-x-100" : "scale-x-0"
                                        }`}
                                    style={{ transitionTimingFunction: EASE }}
                                />
                                <span
                                    aria-hidden="true"
                                    className={`sb-fx absolute inset-y-0 left-0 w-0.5 origin-center bg-[#08a9b5] transition-transform duration-500 ${isActive ? "scale-y-100" : "scale-y-0"
                                        }`}
                                />

                                {Icon && (
                                    <Icon
                                        className={`sb-fx relative z-10 h-5 w-5 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 ${isActive
                                            ? "text-[#08a9b5]"
                                            : "text-[#687d83] group-hover:text-[#e8f1f3]"
                                            }`}
                                    />
                                )}
                                <span className="sb-fx relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                                    {link.title}
                                </span>

                                {isActive && (
                                    <span
                                        aria-hidden="true"
                                        className="sb-anim relative z-10 ml-auto h-1.5 w-1.5 bg-[#08a9b5]"
                                        style={{
                                            animation: `sb-dot 0.4s ${EASE} both, sb-pulse 2.2s ease-out 0.6s infinite`,
                                        }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="border-t border-[#1d343c] bg-[#071116] p-4">
                    <Link
                        href="/api/auth/signout"
                        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden border border-[#1d343c] px-4 py-2.5 text-sm font-medium text-[#ef4444] transition-all duration-300 hover:border-[#ef4444]/40 active:scale-[0.98]"
                    >
                        <span
                            aria-hidden="true"
                            className="sb-fx absolute inset-0 origin-bottom scale-y-0 bg-[#ef4444]/10 transition-transform duration-300 ease-out group-hover:scale-y-100"
                        />
                        <LogOut className="sb-fx relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                        <span className="relative z-10">Sign Out</span>
                    </Link>
                </div>
            </aside>

            <div className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-[#1d343c] bg-[#0d1a20] px-4 pb-safe md:hidden">
                {mobileLinks.map((link, i) => {
                    const Icon = IconMap[link.icon];
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.title}
                            href={link.href}
                            aria-label={link.title}
                            className={`sb-anim group relative flex h-12 w-12 items-center justify-center transition-colors duration-300 active:scale-90 ${isActive
                                ? "bg-[#10353b] text-[#08a9b5]"
                                : "text-[#687d83] hover:bg-[#12242b] hover:text-[#e8f1f3]"
                                }`}
                            style={{ animation: `sb-up 0.45s ${EASE} ${i * 50}ms both` }}
                        >
                            {/* indicator sits on the bar's top border */}
                            <span
                                aria-hidden="true"
                                className={`sb-fx absolute -top-2 left-1 right-1 h-0.5 origin-center bg-[#08a9b5] transition-transform duration-500 ${isActive ? "scale-x-100" : "scale-x-0"
                                    }`}
                            />
                            {Icon && (
                                <Icon
                                    className={`sb-fx h-6 w-6 transition-transform duration-300 ${isActive ? "-translate-y-0.5 scale-110" : "group-hover:-translate-y-0.5"
                                        }`}
                                />
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
                        className={`sb-anim group relative flex h-12 w-12 items-center justify-center transition-colors duration-300 active:scale-90 ${showMore || isMoreActive
                            ? "bg-[#10353b] text-[#08a9b5]"
                            : "text-[#687d83] hover:bg-[#12242b] hover:text-[#e8f1f3]"
                            }`}
                        style={{ animation: `sb-up 0.45s ${EASE} ${mobileLinks.length * 50}ms both` }}
                    >
                        <span
                            aria-hidden="true"
                            className={`sb-fx absolute -top-2 left-1 right-1 h-0.5 origin-center bg-[#08a9b5] transition-transform duration-500 ${showMore || isMoreActive ? "scale-x-100" : "scale-x-0"
                                }`}
                        />
                        <MoreHorizontal
                            className={`sb-fx h-6 w-6 transition-transform duration-300 ${showMore ? "rotate-90" : "rotate-0"
                                }`}
                        />
                    </button>
                )}
            </div>

            {showMore && moreLinks.length > 0 && (
                <>
                    <div
                        className="fixed inset-0 z-40 md:hidden"
                        onClick={() => setShowMore(false)}
                        aria-hidden="true"
                    />
                    <div
                        className="sb-anim fixed bottom-20 right-4 z-50 w-56 origin-bottom-right border border-[#1d343c] bg-[#0d1a20] p-2 shadow-2xl md:hidden"
                        style={{ animation: `sb-pop 0.3s ${EASE} both` }}
                    >
                        {moreLinks.map((link, i) => {
                            const Icon = IconMap[link.icon];
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.title}
                                    href={link.href}
                                    onClick={() => setShowMore(false)}
                                    className={`sb-anim group relative flex items-center gap-3 overflow-hidden px-3 py-3 text-sm font-medium transition-colors duration-300 active:scale-[0.98] ${isActive
                                        ? "bg-[#10353b] text-[#08a9b5]"
                                        : "text-[#91a5aa] hover:bg-[#12242b] hover:text-[#e8f1f3]"
                                        }`}
                                    style={{ animation: `sb-up 0.35s ${EASE} ${80 + i * 45}ms both` }}
                                >
                                    {isActive && (
                                        <span
                                            aria-hidden="true"
                                            className="absolute inset-y-0 left-0 w-0.5 bg-[#08a9b5]"
                                        />
                                    )}
                                    {Icon && (
                                        <Icon className="sb-fx h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                                    )}
                                    <span className="sb-fx transition-transform duration-300 group-hover:translate-x-1">
                                        {link.title}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}
        </>
    );
}