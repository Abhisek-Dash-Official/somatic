"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useNotificationStore } from "@/store/notificationStore";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { siteConfig } from "@/config/site";
import { navLinks } from "@/config/nav";
import { Menu, X, ChevronRight, ChevronDown, LogOut, Bell, User, LayoutDashboard, LogIn, UserPlus, ShoppingCart } from "lucide-react";

const DARK_BG = "#071116";
const DARK_SURFACE = "#0d1a20";
const DARK_BORDER = "#1d343c";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const accountIconMap: Record<string, any> = { Bell, LayoutDashboard, User, LogOut, LogIn, UserPlus, ShoppingCart };

function AccountDropdown({ user, onClose, unreadCount }: { user: any; onClose: () => void; unreadCount: number }) {
    const links = user ? navLinks.accountMenu.authenticated : navLinks.accountMenu.guest;

    const getHref = (href: string) => {
        if (!user) return href;
        if (href === "dashboard") return `/${user.role}`;
        if (href === "profile") return `/${user.role}/profile`;
        return href;
    };

    return (
        <div
            className="hb-anim absolute right-0 top-12 z-50 w-56 origin-top-right border border-[#1d343c] bg-[#0d1a20] p-2 shadow-2xl"
            style={{ animation: `hb-drop 0.25s ${EASE} both` }}
        >
            {user && (
                <div
                    className="hb-anim border-b border-[#1d343c] px-3 py-3"
                    style={{ animation: `hb-up 0.35s ${EASE} 60ms both` }}
                >
                    <p className="truncate text-sm font-semibold text-[#e8f1f3]">{user.username}</p>
                    <p className="truncate text-xs text-[#687d83]">{user.email}</p>
                </div>
            )}

            <div className="mt-2 space-y-1">
                {links.map((link, i) => {
                    const Icon = accountIconMap[link.icon];

                    return (
                        <Link
                            key={link.title}
                            href={getHref(link.href)}
                            onClick={onClose}
                            className={`hb-anim group flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-200 active:scale-[0.98] ${link.danger
                                ? "text-[#ef4444] hover:bg-[#ef4444]/10"
                                : "text-[#91a5aa] hover:bg-[#12242b] hover:text-[#e8f1f3]"
                                }`}
                            style={{ animation: `hb-up 0.35s ${EASE} ${100 + i * 40}ms both` }}
                        >
                            <Icon
                                className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${link.danger ? "" : "text-[#687d83]"
                                    }`}
                            />
                            <span className="flex min-w-0 flex-1 items-center justify-between gap-2 transition-transform duration-300 group-hover:translate-x-1">
                                <span>{link.title}</span>

                                {link.title === "Notifications" && unreadCount > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#08a9b5] px-1.5 text-[10px] font-bold leading-none text-[#041014]">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default function Header() {
    const { user } = useUserStore();
    const unreadCount = useNotificationStore((state) => state.unreadCount);
    const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const pathname = usePathname();

    const desktopAccountRef = useRef<HTMLDivElement>(null);
    const mobileAccountRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsAccountMenuOpen(false);
        setIsMoreMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (user) fetchUnreadCount();
    }, [user, fetchUnreadCount]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (!desktopAccountRef.current?.contains(target) && !mobileAccountRef.current?.contains(target)) {
                setIsAccountMenuOpen(false);
            }

            if (!moreMenuRef.current?.contains(target)) {
                setIsMoreMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const dashboardHref = user ? `/${user.role}` : "/login";
    const isMoreActive = navLinks.moreNav.some((link) => pathname === link.href);
    const mobileLinks = [...navLinks.mainNav, ...navLinks.moreNav];

    return (
        <header
            className="hb-root sticky top-0 z-50 w-full border-b"
            style={{ backgroundColor: DARK_BG, borderColor: DARK_BORDER }}
        >
            <style>{`
                @keyframes hb-in {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes hb-up {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes hb-drop {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .hb-root, .hb-root * {
                        animation: none !important;
                        transition-duration: 0s !important;
                    }
                }
            `}</style>

            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:h-20">
                <Link
                    href="/"
                    className="hb-anim group flex items-center gap-2 transition-opacity hover:opacity-90 md:gap-3"
                    style={{ animation: `hb-in 0.5s ${EASE} both` }}
                >
                    <Image
                        src={`/${siteConfig.logo}`}
                        alt={siteConfig.name}
                        width={36}
                        height={36}
                        className="object-contain transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 md:h-10 md:w-10"
                    />
                    <span className="text-xl font-bold tracking-tight text-[#e8f1f3] md:text-2xl">
                        {siteConfig.name}
                    </span>
                </Link>

                <nav className="hidden items-center gap-7 md:flex">
                    {navLinks.mainNav.map((link, i) => {
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.title}
                                href={link.href}
                                className={`hb-anim group relative py-1 text-sm font-medium transition-colors duration-300 ${isActive ? "text-[#08a9b5]" : "text-[#91a5aa] hover:text-[#e8f1f3]"
                                    }`}
                                style={{ animation: `hb-in 0.5s ${EASE} ${100 + i * 50}ms both` }}
                            >
                                {link.title}
                                <span
                                    aria-hidden="true"
                                    className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-[#08a9b5] transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                        }`}
                                />
                            </Link>
                        );
                    })}

                    <div
                        ref={moreMenuRef}
                        className="hb-anim relative"
                        style={{ animation: `hb-in 0.5s ${EASE} ${100 + navLinks.mainNav.length * 50}ms both` }}
                    >
                        <button
                            type="button"
                            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                            aria-expanded={isMoreMenuOpen}
                            className={`group relative flex items-center gap-1.5 py-1 text-sm font-medium transition-colors duration-300 ${isMoreActive || isMoreMenuOpen ? "text-[#08a9b5]" : "text-[#91a5aa] hover:text-[#e8f1f3]"
                                }`}
                        >
                            More
                            <ChevronDown
                                className={`h-4 w-4 transition-transform duration-300 ${isMoreMenuOpen ? "rotate-180" : ""}`}
                            />
                            <span
                                aria-hidden="true"
                                className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-[#08a9b5] transition-transform duration-300 ${isMoreActive || isMoreMenuOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                    }`}
                            />
                        </button>

                        {isMoreMenuOpen && (
                            <div
                                className="hb-anim absolute left-1/2 top-9 z-50 w-52 -translate-x-1/2 origin-top border border-[#1d343c] bg-[#0d1a20] p-2 shadow-2xl"
                                style={{ animation: `hb-drop 0.25s ${EASE} both` }}
                            >
                                {navLinks.moreNav.map((link, i) => {
                                    const isActive = pathname === link.href;

                                    return (
                                        <Link
                                            key={link.title}
                                            href={link.href}
                                            onClick={() => setIsMoreMenuOpen(false)}
                                            className={`hb-anim group relative block px-3 py-2.5 text-sm transition-colors duration-200 active:scale-[0.98] ${isActive
                                                ? "bg-[#10353b] text-[#62d8d8]"
                                                : "text-[#91a5aa] hover:bg-[#12242b] hover:text-[#e8f1f3]"
                                                }`}
                                            style={{ animation: `hb-up 0.35s ${EASE} ${60 + i * 40}ms both` }}
                                        >
                                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                                                {link.title}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </nav>

                <div
                    className="hb-anim hidden items-center gap-3 md:flex"
                    style={{ animation: `hb-in 0.5s ${EASE} 300ms both` }}
                >
                    {user && (
                        <Link
                            href={dashboardHref}
                            className="group relative flex items-center gap-2 overflow-hidden bg-[#08a9b5] px-5 py-2.5 text-sm font-semibold text-[#041014] transition-transform duration-200 active:scale-95"
                        >
                            <span
                                aria-hidden="true"
                                className="absolute inset-0 origin-left scale-x-0 bg-[#12c4c4] transition-transform duration-300 ease-out group-hover:scale-x-100"
                            />
                            <span className="relative z-10">Dashboard</span>
                            <ChevronRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    )}

                    <ThemeToggle />

                    <div ref={desktopAccountRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                            aria-label="Account menu"
                            aria-expanded={isAccountMenuOpen}
                            className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 ${isAccountMenuOpen
                                ? "border-[#08a9b5] ring-2 ring-[#08a9b5]/25"
                                : "border-[#1d343c] hover:border-[#08a9b5]"
                                }`}
                        >
                            <Image
                                src={`/avatars/avatar-${user?.avatar_id || "1"}.png`}
                                alt={user?.username || "User"}
                                width={40}
                                height={40}
                                className="h-full w-full rounded-full object-cover"
                            />

                            {unreadCount > 0 && (
                                <span
                                    aria-label={`${unreadCount} unread notifications`}
                                    className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#071116] bg-red-500"
                                />
                            )}
                        </button>

                        {isAccountMenuOpen && (
                            <AccountDropdown
                                user={user}
                                unreadCount={unreadCount}
                                onClose={() => setIsAccountMenuOpen(false)}
                            />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />

                    <div ref={mobileAccountRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                            aria-label="Account menu"
                            aria-expanded={isAccountMenuOpen}
                            className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border transition-all duration-300 active:scale-95 ${isAccountMenuOpen
                                ? "border-[#08a9b5] ring-2 ring-[#08a9b5]/25"
                                : "border-[#1d343c]"
                                }`}
                        >
                            <Image
                                src={`/avatars/avatar-${user?.avatar_id || "1"}.png`}
                                alt={user?.username || "User"}
                                width={40}
                                height={40}
                                className="h-full w-full rounded-full object-cover"
                            />

                            {unreadCount > 0 && (
                                <span
                                    aria-label={`${unreadCount} unread notifications`}
                                    className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#071116] bg-red-500"
                                />
                            )}
                        </button>

                        {isAccountMenuOpen && (
                            <AccountDropdown
                                user={user}
                                unreadCount={unreadCount}
                                onClose={() => setIsAccountMenuOpen(false)}
                            />
                        )}
                    </div>

                    <button
                        type="button"
                        aria-label="Toggle menu"
                        aria-expanded={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className={`relative flex h-10 w-10 items-center justify-center border bg-[#0d1a20] transition-all duration-300 active:scale-95 ${isMobileMenuOpen
                            ? "border-[#08a9b5] text-[#08a9b5]"
                            : "border-[#1d343c] text-[#91a5aa] hover:text-[#e8f1f3]"
                            }`}
                    >
                        <Menu
                            className={`absolute h-5 w-5 transition-all duration-300 ${isMobileMenuOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                                }`}
                        />
                        <X
                            className={`absolute h-5 w-5 transition-all duration-300 ${isMobileMenuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                                }`}
                        />
                    </button>
                </div>
            </div>

            <div
                aria-hidden={!isMobileMenuOpen}
                className={`absolute left-0 top-full grid w-full shadow-2xl transition-[grid-template-rows,visibility] duration-300 md:hidden ${isMobileMenuOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
                    }`}
                style={{ backgroundColor: DARK_SURFACE }}
            >
                <div className="min-h-0 max-h-[calc(100vh-4rem)] overflow-y-auto">
                    <nav className="flex flex-col p-4">
                        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[#687d83]">
                            Main Menu
                        </div>

                        <div className="space-y-1">
                            {mobileLinks.map((link, i) => {
                                const isActive = pathname === link.href;

                                return (
                                    <Link
                                        key={link.title}
                                        href={link.href}
                                        tabIndex={isMobileMenuOpen ? 0 : -1}
                                        className={`group relative block px-4 py-3 text-base font-medium transition-all duration-300 active:scale-[0.98] ${isActive
                                            ? "bg-[#10353b] text-[#62d8d8]"
                                            : "text-[#91a5aa] hover:bg-[#12242b] hover:text-[#e8f1f3]"
                                            } ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
                                        style={{ transitionDelay: isMobileMenuOpen ? `${80 + i * 40}ms` : "0ms" }}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`absolute inset-y-0 left-0 w-0.5 origin-center bg-[#08a9b5] transition-transform duration-300 ${isActive ? "scale-y-100" : "scale-y-0"
                                                }`}
                                        />
                                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                                            {link.title}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div
                            className={`mt-4 border-t border-[#1d343c] pt-4 transition-all duration-300 ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                                }`}
                            style={{ transitionDelay: isMobileMenuOpen ? `${80 + mobileLinks.length * 40}ms` : "0ms" }}
                        >
                            {user ? (
                                <Link
                                    href={dashboardHref}
                                    tabIndex={isMobileMenuOpen ? 0 : -1}
                                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden bg-[#08a9b5] p-3 font-semibold text-[#041014] transition-transform duration-200 active:scale-[0.98]"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 origin-left scale-x-0 bg-[#12c4c4] transition-transform duration-300 ease-out group-hover:scale-x-100"
                                    />
                                    <LayoutDashboard className="relative z-10 h-5 w-5" />
                                    <span className="relative z-10">Go to Dashboard</span>
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href="/login"
                                        tabIndex={isMobileMenuOpen ? 0 : -1}
                                        className="flex w-full items-center justify-center border border-[#1d343c] bg-[#071116] p-3 font-medium text-[#e8f1f3] transition-all duration-200 hover:border-[#08a9b5]/50 hover:bg-[#12242b] active:scale-[0.98]"
                                    >
                                        Sign In
                                    </Link>

                                    <Link
                                        href="/register"
                                        tabIndex={isMobileMenuOpen ? 0 : -1}
                                        className="group relative flex w-full items-center justify-center overflow-hidden bg-[#08a9b5] p-3 font-semibold text-[#041014] transition-transform duration-200 active:scale-[0.98]"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="absolute inset-0 origin-left scale-x-0 bg-[#12c4c4] transition-transform duration-300 ease-out group-hover:scale-x-100"
                                        />
                                        <span className="relative z-10">Register</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}