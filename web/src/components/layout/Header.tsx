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
import {
    Menu, X, ChevronRight, ChevronDown, LogOut, Bell, User,
    LayoutDashboard, LogIn, UserPlus, ShoppingCart
} from "lucide-react";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const accountIconMap: Record<string, any> = {
    Bell, LayoutDashboard, User, LogOut, LogIn, UserPlus, ShoppingCart
};

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
            className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-60 overflow-hidden rounded-xl border border-border bg-surface p-2 shadow-xl shadow-black/10 dark:shadow-black/30"
            style={{ animation: `header-drop .2s ${EASE} both` }}
        >
            {user && (
                <div className="mb-2 border-b border-border px-3 pb-3 pt-2">
                    <p className="truncate text-sm font-semibold text-foreground">{user.username}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
                </div>
            )}

            <div className="space-y-1">
                {links.map((link, i) => {
                    const Icon = accountIconMap[link.icon];

                    return (
                        <Link
                            key={link.title}
                            href={getHref(link.href)}
                            onClick={onClose}
                            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${link.danger
                                ? "text-destructive hover:bg-destructive/10"
                                : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                }`}
                            style={{ animation: `header-up .25s ${EASE} ${i * 30}ms both` }}
                        >
                            <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${link.danger ? "" : "text-muted-foreground"}`} />

                            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                <span>{link.title}</span>

                                {link.title === "Notifications" && unreadCount > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold leading-none text-primary-foreground">
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
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
            <style>{`
                @keyframes header-in {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes header-up {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes header-drop {
                    from { opacity: 0; transform: translateY(-5px) scale(.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .header-anim, .header-anim * {
                        animation: none !important;
                        transition-duration: 0s !important;
                    }
                }
            `}</style>

            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-18 lg:px-8">
                <Link
                    href="/"
                    className="header-anim group flex items-center gap-2.5"
                    style={{ animation: `header-in .45s ${EASE} both` }}
                >
                    <Image
                        src={`/${siteConfig.logo}`}
                        alt={siteConfig.name}
                        width={40}
                        height={40}
                        className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105 lg:h-10 lg:w-10"
                    />

                    <div>
                        <span className="block text-lg font-bold tracking-tight text-foreground">
                            {siteConfig.name}
                        </span>
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
                            Healthcare
                        </span>
                    </div>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {navLinks.mainNav.map((link, i) => {
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.title}
                                href={link.href}
                                className={`header-anim relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                    }`}
                                style={{ animation: `header-in .45s ${EASE} ${80 + i * 40}ms both` }}
                            >
                                {link.title}
                            </Link>
                        );
                    })}

                    <div ref={moreMenuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                            aria-expanded={isMoreMenuOpen}
                            className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${isMoreActive || isMoreMenuOpen
                                ? "bg-accent text-accent-foreground"
                                : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                }`}
                        >
                            More
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isMoreMenuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isMoreMenuOpen && (
                            <div className="absolute left-1/2 top-[calc(100%+0.75rem)] z-50 w-52 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface p-2 shadow-xl shadow-black/10 dark:shadow-black/30">
                                {navLinks.moreNav.map((link) => {
                                    const isActive = pathname === link.href;

                                    return (
                                        <Link
                                            key={link.title}
                                            href={link.href}
                                            onClick={() => setIsMoreMenuOpen(false)}
                                            className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                                ? "bg-accent text-accent-foreground"
                                                : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                                }`}
                                        >
                                            {link.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </nav>

                <div className="hidden items-center gap-2.5 md:flex">
                    <ThemeToggle />

                    {user && (
                        <Link
                            href={dashboardHref}
                            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-[.98]"
                        >
                            Dashboard
                            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                    )}

                    <div ref={desktopAccountRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                            aria-label="Account menu"
                            aria-expanded={isAccountMenuOpen}
                            className={`relative h-10 w-10 rounded-full border bg-surface transition-all duration-200 ${isAccountMenuOpen ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/50"
                                }`}
                        >
                            <Image
                                src={`/avatars/avatar-${user?.avatar_id || "1"}.png`}
                                alt={user?.username || "User"}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                            />

                            {unreadCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 z-50 block h-3 w-3 rounded-full border-2 border-background bg-red-500" />
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
                            className={`h-10 w-10 rounded-full border bg-surface ${isAccountMenuOpen ? "border-primary ring-2 ring-primary/15" : "border-border"
                                }`}
                        >
                            <Image
                                src={`/avatars/avatar-${user?.avatar_id || "1"}.png`}
                                alt={user?.username || "User"}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                            />
                            {unreadCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 z-50 block h-3 w-3 rounded-full border-2 border-background bg-red-500" />
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
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className={`border-t border-border bg-surface md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
                <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
                    {mobileLinks.map((link) => {
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.title}
                                href={link.href}
                                className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                    }`}
                            >
                                {link.title}
                                {isActive && <ChevronRight className="h-4 w-4" />}
                            </Link>
                        );
                    })}

                    <div className="mt-3 border-t border-border pt-3">
                        {user ? (
                            <Link
                                href={dashboardHref}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3 text-sm font-bold text-primary-foreground"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Go to Dashboard
                            </Link>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link href="/login" className="rounded-lg border border-border bg-surface-secondary p-3 text-center text-sm font-semibold text-foreground">
                                    Sign In
                                </Link>
                                <Link href="/register" className="rounded-lg bg-primary p-3 text-center text-sm font-bold text-primary-foreground">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}