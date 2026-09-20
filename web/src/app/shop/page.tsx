"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, ShieldCheck, CheckCircle2 } from "lucide-react";
import { SHOP_CATEGORIES } from "@/config/shopCategories";

const pageStyle = {
    backgroundColor: "#edf3f5",
    backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath d='M24 19v10M19 24h10' stroke='%230f766e' stroke-opacity='0.09' stroke-width='2' stroke-linecap='round' fill='none'/%3E%3C/svg%3E\")",
};

export default function ShopHubPage() {
    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={pageStyle}>
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-sm font-semibold mb-4">
                        <ShoppingBag size={16} />
                        <span>Healthcare Marketplace</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Select Service & Explore Shop
                    </h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Choose a category below to order essential healthcare medicines or search emergency blood unit inventories.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {SHOP_CATEGORIES.map((category) => {
                        const isRed = category.themeColor === "red";

                        return (
                            <div
                                key={category.id}
                                className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-100">
                                    <Image
                                        src={category.image}
                                        alt={category.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                        priority
                                    />

                                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                                    {/* Top Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span
                                            className={`text-xs font-bold px-3 py-1 rounded-full text-white shadow-md ${isRed ? "bg-red-600" : "bg-teal-600"
                                                }`}
                                        >
                                            {category.badge}
                                        </span>
                                    </div>

                                    {/* Title & Subtitle */}
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <p className="text-xs uppercase tracking-wider font-semibold opacity-90">
                                            {category.subtitle}
                                        </p>
                                        <h2 className="text-2xl font-bold mt-0.5">{category.title}</h2>
                                    </div>
                                </div>

                                {/* Content & Action Area */}
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                            {category.description}
                                        </p>

                                        <ul className="space-y-2.5 mb-8">
                                            {category.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                                                    <CheckCircle2
                                                        size={16}
                                                        className={isRed ? "text-red-500 shrink-0" : "text-teal-600 shrink-0"}
                                                    />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Link
                                        href={category.href}
                                        className={`w-full py-3.5 px-5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-lg ${isRed
                                            ? "bg-red-600 hover:bg-red-700 active:scale-[0.99]"
                                            : "bg-teal-700 hover:bg-teal-800 active:scale-[0.99]"
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

                {/* Footer */}
                <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                            <ShieldCheck size={22} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">Verified Healthcare Partners</h4>
                            <p className="text-xs text-slate-500">All medicines & blood repositories are verified with license standards.</p>
                        </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        Secure Platform
                    </span>
                </div>

            </div>
        </div>
    );
}