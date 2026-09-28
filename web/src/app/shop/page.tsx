"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, ShieldCheck, CheckCircle2 } from "lucide-react";
import { SHOP_CATEGORIES } from "@/config/shopCategories";

export default function ShopHubPage() {
    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent border border-border text-accent-foreground text-sm font-semibold mb-4">
                        <ShoppingBag size={16} />
                        <span>Healthcare Marketplace</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
                        Select Service & Explore Shop
                    </h1>

                    <p className="mt-4 text-lg text-muted">
                        Choose a category below to order essential healthcare medicines or search emergency blood unit inventories.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {SHOP_CATEGORIES.map((category) => {
                        const isRed = category.themeColor === "red";

                        return (
                            <div
                                key={category.id}
                                className="group bg-surface rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-surface-secondary">
                                    <Image
                                        src={category.image}
                                        alt={category.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                        priority
                                    />

                                    <div className="absolute inset-0 bg-black/55" />

                                    <div className="absolute top-4 left-4">
                                        <span
                                            className={`text-xs font-bold px-3 py-1 rounded-full text-white ${isRed ? "bg-danger" : "bg-primary"
                                                }`}
                                        >
                                            {category.badge}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <p className="text-xs uppercase tracking-wider font-semibold opacity-90">
                                            {category.subtitle}
                                        </p>
                                        <h2 className="text-2xl font-bold mt-0.5">{category.title}</h2>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="text-muted text-sm leading-relaxed mb-6">
                                            {category.description}
                                        </p>

                                        <ul className="space-y-2.5 mb-8">
                                            {category.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground">
                                                    <CheckCircle2
                                                        size={16}
                                                        className={`${isRed ? "text-danger" : "text-primary"} shrink-0`}
                                                    />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Link
                                        href={category.href}
                                        className={`w-full py-3.5 px-5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isRed
                                                ? "bg-danger text-white hover:bg-danger/90"
                                                : "bg-primary text-primary-foreground hover:bg-primary-hover"
                                            }`}
                                    >
                                        <span>Browse {category.title}</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 bg-surface rounded-xl border border-border p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent border border-border flex items-center justify-center text-accent-foreground shrink-0">
                            <ShieldCheck size={22} />
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground text-sm">
                                Verified Healthcare Partners
                            </h4>
                            <p className="text-xs text-muted">
                                All medicines & blood repositories are verified with license standards.
                            </p>
                        </div>
                    </div>

                    <span className="text-xs font-semibold text-muted bg-surface-secondary px-3 py-1.5 rounded-lg border border-border">
                        Secure Platform
                    </span>
                </div>
            </div>
        </div>
    );
}