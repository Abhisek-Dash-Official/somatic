"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { siteConfig } from "@/config/site";
import { navLinks } from "@/config/nav";
import { Menu, X, ChevronRight, ChevronDown, LogOut, Bell, User, LayoutDashboard, LogIn, UserPlus, Sun, Moon } from "lucide-react";

const accountIconMap: Record<string, any> = { Bell, LayoutDashboard, User, LogOut, LogIn, UserPlus };

function AccountDropdown({ user, onClose }: { user: any; onClose: () => void }) {
    const links = user ? navLinks.accountMenu.authenticated : navLinks.accountMenu.guest;

    const getHref = (href: string) => {
        if (!user) return href;
        if (href === "dashboard") return `/${user.role}`;
        if (href === "profile") return `/${user.role}/profile`;
        return href;
    };

    return (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-border bg-surface p-2 shadow-xl">
            {user && (
                <div className="border-b border-border px-3 py-3">
                    <p className="truncate text-sm font-semibold text-foreground">{user.username}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
            )}

            <div className="mt-2 space-y-1">
                {links.map((link) => {
                    const Icon = accountIconMap[link.icon];

                    return (
                        <Link
                            key={link.title}
                            href={getHref(link.href)}
                            onClick={onClose}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${link.danger
                                ? "text-danger hover:bg-danger/10"
                                : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                }`}
                        >
                            <Icon className={`h-4 w-4 ${link.danger ? "" : "text-muted-foreground"}`} />
                            {link.title}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default function Header() {
    const { user } = useUserStore();
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

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:h-20">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80 md:gap-3">
                    <Image
                        src={`/${siteConfig.logo}`}
                        alt={siteConfig.name}
                        width={36}
                        height={36}
                        className="object-contain md:h-10 md:w-10"
                    />
                    <span className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{siteConfig.name}</span>
                </Link>

                <nav className="hidden items-center gap-7 md:flex">
                    {navLinks.mainNav.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            className={`text-sm font-medium transition-colors ${pathname === link.href ? "text-primary" : "text-muted hover:text-foreground"
                                }`}
                        >
                            {link.title}
                        </Link>
                    ))}

                    <div ref={moreMenuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                            aria-expanded={isMoreMenuOpen}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isMoreActive || isMoreMenuOpen ? "text-primary" : "text-muted hover:text-foreground"
                                }`}
                        >
                            More
                            <ChevronDown className={`h-4 w-4 transition-transform ${isMoreMenuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isMoreMenuOpen && (
                            <div className="absolute left-1/2 top-9 z-50 w-52 -translate-x-1/2 rounded-2xl border border-border bg-surface p-2 shadow-xl">
                                {navLinks.moreNav.map((link) => (
                                    <Link
                                        key={link.title}
                                        href={link.href}
                                        onClick={() => setIsMoreMenuOpen(false)}
                                        className={`block rounded-xl px-3 py-2.5 text-sm transition-colors ${pathname === link.href
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                            }`}
                                    >
                                        {link.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    {user && (
                        <Link
                            href={dashboardHref}
                            className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                        >
                            Dashboard
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}

                    <ThemeToggle />

                    <div ref={desktopAccountRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                            aria-label="Account menu"
                            aria-expanded={isAccountMenuOpen}
                            className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border transition-colors ${isAccountMenuOpen ? "border-primary bg-accent" : "border-border bg-surface hover:border-primary"
                                }`}
                        >
                            <Image
                                src={`/avatars/avatar-${user?.avatar_id || "1"}.png`}
                                alt={user?.username || "User"}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                            />
                        </button>

                        {isAccountMenuOpen && <AccountDropdown user={user} onClose={() => setIsAccountMenuOpen(false)} />}
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
                            className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border transition-colors ${isAccountMenuOpen ? "border-primary bg-accent" : "border-border bg-surface"
                                }`}
                        >
                            <Image
                                src={`/avatars/avatar-${user?.avatar_id || "1"}.png`}
                                alt={user?.username || "User"}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                            />
                        </button>

                        {isAccountMenuOpen && <AccountDropdown user={user} onClose={() => setIsAccountMenuOpen(false)} />}
                    </div>

                    <button
                        type="button"
                        aria-label="Toggle menu"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-colors hover:text-foreground"
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="absolute left-0 top-full max-h-[calc(100vh-4rem)] w-full overflow-y-auto bg-surface shadow-xl md:hidden">
                    <nav className="flex flex-col p-4">
                        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Main Menu
                        </div>

                        <div className="space-y-1">
                            {[...navLinks.mainNav, ...navLinks.moreNav].map((link) => (
                                <Link
                                    key={link.title}
                                    href={link.href}
                                    className={`block rounded-xl px-4 py-3 text-base font-medium transition-colors ${pathname === link.href
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                        }`}
                                >
                                    {link.title}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-4 border-t border-border pt-4">
                            {user ? (
                                <Link
                                    href={dashboardHref}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary p-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href="/login"
                                        className="flex w-full items-center justify-center rounded-xl border border-border bg-background p-3 font-medium text-foreground transition-colors hover:bg-surface-secondary"
                                    >
                                        Sign In
                                    </Link>

                                    <Link
                                        href="/register"
                                        className="flex w-full items-center justify-center rounded-xl bg-primary p-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}