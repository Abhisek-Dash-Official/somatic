"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { siteConfig } from "@/config/site";
import { navLinks } from "@/config/nav";
import { Menu, X, ChevronRight, LogOut } from "lucide-react";

export default function Header() {
    const { user } = useUserStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B1120]/90 backdrop-blur-md">
            <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 sm:px-6">

                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-2 md:gap-3 transition-opacity hover:opacity-80">
                    <Image
                        src={`/${siteConfig.logo}`}
                        alt={siteConfig.name}
                        width={36}
                        height={36}
                        className="object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] md:w-10 md:h-10"
                    />
                    <span className="text-xl md:text-2xl font-bold tracking-tight text-white">
                        {siteConfig.name}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.mainNav.map((link) => (
                        <Link key={link.title} href={link.href} className="text-sm font-medium text-slate-400 transition-colors hover:text-blue-400">
                            {link.title}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Auth Button */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <Link href={`/${user.role}`} className="group flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                            Dashboard <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">Sign In</Link>
                            <Link href="/register" className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all hover:bg-blue-500">Register</Link>
                        </>
                    )}
                </div>

                {/* Mobile Header Toggle */}
                <button className="p-2 md:hidden text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Global Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full border-b border-white/10 bg-[#0f172a] shadow-2xl md:hidden">
                    <nav className="flex flex-col p-4">
                        <div className="space-y-2">
                            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Main Menu</div>
                            {navLinks.mainNav.map((link) => (
                                <Link key={link.title} href={link.href} className="block rounded-xl px-4 py-3 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-blue-400">
                                    {link.title}
                                </Link>
                            ))}

                            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
                                {user ? (
                                    <>
                                        <Link href={`/${user.role}`} className="flex w-full items-center justify-center rounded-xl bg-blue-600 p-3 font-medium text-white shadow-lg">
                                            Go to Dashboard
                                        </Link>
                                        <Link href="/api/auth/signout" className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 p-3 font-medium text-red-400 border border-red-500/20">
                                            <LogOut className="h-5 w-5" /> Sign Out
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 p-3 font-medium text-white">Sign In</Link>
                                        <Link href="/register" className="flex w-full items-center justify-center rounded-xl bg-blue-600 p-3 font-medium text-white shadow-lg">Register</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}