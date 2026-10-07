"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Pill, Package, Loader2 } from "lucide-react";

const getValidImage = (imgSrc: string) => {
    if (imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"))) return imgSrc;
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
            if (isNewSearch) setLoading(true);
            else setLoadingMore(true);

            const params = new URLSearchParams();

            if (search.trim()) params.set("search", search.trim());
            if (category) params.set("category", category);

            params.set("limit", limit.toString());

            const currentList = medicinesRef.current;

            if (!isNewSearch && currentList.length > 0) {
                const lastItem = currentList[currentList.length - 1];

                if (lastItem) params.set("lastId", lastItem._id);
            }

            const res = await fetch(`/api/shop/medicines?${params.toString()}`);
            const json = await res.json();

            if (json.success) {
                const fetchedData = json.data || [];

                if (isNewSearch) {
                    setMedicines(fetchedData);
                } else {
                    setMedicines((prev) => {
                        const existingIds = new Set(prev.map((item) => item._id));
                        const uniqueNewItems = fetchedData.filter(
                            (item: any) => !existingIds.has(item._id)
                        );

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
        <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Medicines</h1>
                        <p className="mt-2 text-muted">
                            Browse and purchase medicines from our available inventory.
                        </p>
                    </div>

                    <div className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                        Rendered Items: {medicines.length}
                    </div>
                </div>

                <div className="mb-8 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search medicines..."
                                className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <select
                            value={category}
                            onChange={handleCategoryChange}
                            className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:w-56"
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
                            className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="flex min-h-96 items-center justify-center text-lg font-semibold text-muted">
                        Loading Medicines...
                    </div>
                ) : medicines.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface p-12 text-center">
                        <Pill className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

                        <h2 className="text-xl font-bold text-foreground">No medicines found</h2>

                        <p className="mt-2 text-muted">
                            Try searching with another medicine name or category.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {medicines.map((medicine, index) => {
                                const stockCount = medicine.stock ?? medicine.stock_quantity ?? 0;
                                const itemPrice = medicine.pricing?.sale_price ?? medicine.price ?? 0;
                                const reqPrescription =
                                    medicine.requires_prescription ??
                                    medicine.prescription_required ??
                                    false;
                                const isLastItem = index === medicines.length - 1;

                                return (
                                    <div
                                        ref={isLastItem ? lastElementRef : null}
                                        key={`${medicine._id}-${index}`}
                                        className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:shadow-md"
                                    >
                                        <div>
                                            <div className="relative h-52 w-full bg-surface-secondary">
                                                <Image
                                                    src={getValidImage(medicine.images?.[0])}
                                                    alt={medicine.name}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                    className="object-cover"
                                                />

                                                {reqPrescription && (
                                                    <span className="absolute right-3 top-3 rounded-full border border-warning/20 bg-warning/15 px-3 py-1 text-xs font-bold text-warning">
                                                        Prescription
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-5">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="rounded-full bg-surface-secondary px-3 py-1 text-xs font-semibold uppercase text-muted">
                                                        {medicine.category || "Medicine"}
                                                    </span>
                                                </div>

                                                <h2 className="line-clamp-2 text-lg font-bold text-foreground">
                                                    {medicine.name}
                                                </h2>

                                                {medicine.brand && (
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        Brand: {medicine.brand}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-5 pt-0">
                                            <div className="mt-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Price</p>
                                                    <p className="text-xl font-bold text-foreground">
                                                        ₹{itemPrice}
                                                    </p>
                                                </div>

                                                <Link
                                                    href={`/shop/medicines/${medicine._id}`}
                                                    className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                                                >
                                                    View Details
                                                </Link>
                                            </div>

                                            <div className="mt-4 flex items-center gap-2 text-sm">
                                                <Package className="h-4 w-4 text-muted-foreground" />

                                                {stockCount > 0 ? (
                                                    <span className="font-medium text-success">
                                                        {stockCount} in stock
                                                    </span>
                                                ) : (
                                                    <span className="font-semibold text-danger">
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
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="ml-2 text-sm font-medium text-muted">
                                    Loading more medicines...
                                </span>
                            </div>
                        )}

                        {!hasMore && medicines.length > 0 && (
                            <div className="py-8 text-center text-sm font-medium text-muted-foreground">
                                You have reached the end of the list. Total Rendered: {medicines.length}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}