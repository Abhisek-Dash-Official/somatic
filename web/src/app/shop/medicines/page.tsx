"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Pill, Package, Loader2 } from "lucide-react";

const getValidImage = (imgSrc: string) => {
    if (imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"))) {
        return imgSrc;
    }
    return "/fallback.png";
};

export default function MedicinesPage() {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [hasMore, setHasMore] = useState(true);

    const medicinesRef = useRef(medicines);
    medicinesRef.current = medicines;

    const fetchingRef = useRef(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const limit = 8;

    const fetchMedicines = async (isNewSearch: boolean = false) => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        try {
            if (isNewSearch) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const params = new URLSearchParams();
            if (search.trim()) {
                params.set("search", search.trim());
            }
            if (category) {
                params.set("category", category);
            }
            params.set("limit", limit.toString());

            const currentList = medicinesRef.current;
            if (!isNewSearch && currentList.length > 0) {
                const lastItem = currentList[currentList.length - 1];
                if (lastItem) {
                    params.set("lastId", lastItem._id);
                }
            }

            const res = await fetch(`/api/shop/medicines?${params.toString()}`);
            const json = await res.json();

            if (json.success) {
                const fetchedData = json.data || [];

                if (isNewSearch) {
                    setMedicines(fetchedData);
                } else {
                    setMedicines((prev) => {
                        const existingIds = new Set(prev.map(item => item._id));
                        const uniqueNewItems = fetchedData.filter((item: any) => !existingIds.has(item._id));
                        return [...prev, ...uniqueNewItems];
                    });
                }

                setHasMore(json.hasMore && fetchedData.length > 0);
            }
        } catch (error) {
            console.error("Failed to fetch medicines:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            fetchingRef.current = false;
        }
    };

    useEffect(() => {
        setHasMore(true);
        fetchingRef.current = false;
        fetchMedicines(true);
    }, [category]);

    const handleSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setHasMore(true);
        fetchingRef.current = false;
        fetchMedicines(true);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value);
    };

    const lastElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (fetchingRef.current || !hasMore) return;
            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore && !fetchingRef.current) {
                    fetchMedicines(false);
                }
            });

            if (node) observerRef.current.observe(node);
        },
        [hasMore]
    );

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Medicines</h1>
                        <p className="text-slate-500 mt-2">
                            Browse and purchase medicines from our available inventory.
                        </p>
                    </div>
                    <div className="bg-teal-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow">
                        Rendered Items: {medicines.length}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search medicines..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        <select
                            value={category}
                            onChange={handleCategoryChange}
                            className="md:w-56 px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">All Categories</option>
                            <option value="tablet">Tablet</option>
                            <option value="capsule">Capsule</option>
                            <option value="syrup">Syrup</option>
                            <option value="injection">Injection</option>
                            <option value="cream">Cream</option>
                            <option value="ointment">Ointment</option>
                            <option value="drops">Drops</option>
                            <option value="other">Other</option>
                        </select>

                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="min-h-96 flex items-center justify-center text-lg font-semibold text-slate-500">
                        Loading Medicines...
                    </div>
                ) : medicines.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                        <Pill className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h2 className="text-xl font-bold text-slate-800">No medicines found</h2>
                        <p className="text-slate-500 mt-2">
                            Try searching with another medicine name or category.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {medicines.map((medicine, index) => {
                                const stockCount = medicine.stock ?? medicine.stock_quantity ?? 0;
                                const itemPrice = medicine.pricing?.sale_price ?? medicine.price ?? 0;
                                const reqPrescription = medicine.requires_prescription ?? medicine.prescription_required ?? false;
                                const isLastItem = index === medicines.length - 1;

                                return (
                                    <div
                                        ref={isLastItem ? lastElementRef : null}
                                        key={`${medicine._id}-${index}`}
                                        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="relative h-52 w-full bg-slate-100">
                                                <Image
                                                    src={getValidImage(medicine.images?.[0])}
                                                    alt={medicine.name}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                    className="object-cover"
                                                />
                                                {reqPrescription && (
                                                    <span className="absolute top-3 right-3 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                                                        Prescription
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-semibold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                        {medicine.category || "Medicine"}
                                                    </span>
                                                </div>

                                                <h2 className="text-lg font-bold text-slate-800 line-clamp-2">
                                                    {medicine.name}
                                                </h2>

                                                {medicine.brand && (
                                                    <p className="text-xs text-slate-400 mt-2">
                                                        Brand: {medicine.brand}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-5 pt-0">
                                            <div className="flex items-center justify-between mt-3">
                                                <div>
                                                    <p className="text-xs text-slate-400">Price</p>
                                                    <p className="text-xl font-bold text-slate-900">
                                                        ₹{itemPrice}
                                                    </p>
                                                </div>

                                                <Link
                                                    href={`/shop/medicines/${medicine._id}`}
                                                    className="bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </div>

                                            <div className="flex items-center gap-2 mt-4 text-sm">
                                                <Package className="w-4 h-4 text-slate-400" />
                                                {stockCount > 0 ? (
                                                    <span className="text-green-600 font-medium">
                                                        {stockCount} in stock
                                                    </span>
                                                ) : (
                                                    <span className="text-red-600 font-semibold">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {loadingMore && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                                <span className="ml-2 text-sm text-slate-600 font-medium">Loading more medicines...</span>
                            </div>
                        )}

                        {!hasMore && medicines.length > 0 && (
                            <div className="text-center py-8 text-sm text-slate-400 font-medium">
                                You have reached the end of the list. Total Rendered: {medicines.length}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}