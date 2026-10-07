"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, ShieldCheck, ShoppingBag } from "lucide-react";
import { SHOP_CATEGORIES } from "@/config/shopCategories";

export default function ShopHubPage() {
    return (
        <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-foreground">
                        <ShoppingBag size={16} />
                        <span>Healthcare Marketplace</span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        Select Service & Explore Shop
                    </h1>

                    <p className="mt-4 text-lg text-muted">
                        Choose a category below to order essential healthcare medicines or search emergency blood unit inventories.
                    </p>
                </div>

                <div className="grid items-stretch gap-8 md:grid-cols-2">
                    {SHOP_CATEGORIES.map((category) => {
                        const isRed = category.themeColor === "red";

                        return (
                            <div
                                key={category.id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className="relative h-64 w-full overflow-hidden bg-surface-secondary sm:h-72">
                                    <Image
                                        src={category.image}
                                        alt={category.title}
                                        fill
                                        priority
                                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                    />

                                    <div className="absolute inset-0 bg-black/55" />

                                    <div className="absolute left-4 top-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${isRed ? "bg-danger" : "bg-primary"}`}>
                                            {category.badge}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
                                            {category.subtitle}
                                        </p>
                                        <h2 className="mt-0.5 text-2xl font-bold">{category.title}</h2>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col justify-between p-6">
                                    <div>
                                        <p className="mb-6 text-sm leading-relaxed text-muted">
                                            {category.description}
                                        </p>

                                        <ul className="mb-8 space-y-2.5">
                                            {category.features.map((feature, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center gap-2.5 text-xs font-medium text-foreground sm:text-sm"
                                                >
                                                    <CheckCircle2
                                                        size={16}
                                                        className={`shrink-0 ${isRed ? "text-danger" : "text-primary"}`}
                                                    />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Link
                                        href={category.href}
                                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold transition-colors ${isRed
                                                ? "bg-danger text-white hover:bg-danger/90"
                                                : "bg-primary text-primary-foreground hover:bg-primary-hover"
                                            }`}
                                    >
                                        <span>Browse {category.title}</span>
                                        <ArrowRight
                                            size={18}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 text-center shadow-sm sm:flex-row sm:p-6 sm:text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-accent text-accent-foreground">
                            <ShieldCheck size={22} />
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-foreground">
                                Verified Healthcare Partners
                            </h4>
                            <p className="text-xs text-muted">
                                All medicines & blood repositories are verified with license standards.
                            </p>
                        </div>
                    </div>

                    <span className="rounded-full border border-border bg-surface-secondary px-3 py-1.5 text-xs font-semibold text-muted">
                        Secure Platform
                    </span>
                </div>
            </div>
        </div>
    );
}