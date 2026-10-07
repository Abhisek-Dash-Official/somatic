"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Loader2, Filter } from "lucide-react";

const getValidImage = (imgSrc: string) => {
    if (imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"))) return imgSrc;
    return "/fallback.png";
};

export default function BloodBanksList() {
    const [bloodBanks, setBloodBanks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [bloodGroup, setBloodGroup] = useState("");
    const [search, setSearch] = useState("");
    const [city, setCity] = useState("");

    const bloodBanksRef = useRef(bloodBanks);
    bloodBanksRef.current = bloodBanks;

    const fetchingRef = useRef(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const limit = 8;

    const fetchBloodBanks = async (isNewSearch: boolean = false) => {
        if (fetchingRef.current) return;

        fetchingRef.current = true;

        try {
            if (isNewSearch) setLoading(true);
            else setLoadingMore(true);

            const params = new URLSearchParams();
            params.set("limit", limit.toString());

            if (bloodGroup) params.set("bloodGroup", bloodGroup);
            if (search.trim()) params.set("search", search.trim());
            if (city.trim()) params.set("city", city.trim());

            const currentList = bloodBanksRef.current;

            if (!isNewSearch && currentList.length > 0) {
                const lastItem = currentList[currentList.length - 1];

                if (lastItem) params.set("lastId", lastItem._id);
            }

            const res = await fetch(`/api/shop/bloodbanks?${params.toString()}`);
            const json = await res.json();

            if (json.success) {
                const fetchedData = json.data || [];

                if (isNewSearch) {
                    setBloodBanks(fetchedData);
                } else {
                    setBloodBanks((prev) => {
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
            console.error("Failed to fetch blood banks:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            fetchingRef.current = false;
        }
    };

    useEffect(() => {
        setHasMore(true);
        fetchingRef.current = false;
        fetchBloodBanks(true);
    }, [bloodGroup]);

    const handleSearchSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setHasMore(true);
        fetchingRef.current = false;
        fetchBloodBanks(true);
    };

    const lastElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (fetchingRef.current || !hasMore) return;

            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore && !fetchingRef.current) {
                    fetchBloodBanks(false);
                }
            });

            if (node) observerRef.current.observe(node);
        },
        [hasMore]
    );

    return (
        <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Available Blood Banks</h1>
                        <p className="mt-1 text-muted">
                            Find blood banks and check real-time availability.
                        </p>
                    </div>

                    <div className="rounded-full bg-danger px-4 py-2 text-sm font-bold text-white">
                        Rendered Items: {bloodBanks.length}
                    </div>
                </div>

                <div className="mb-8 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 lg:flex-row">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by blood bank name..."
                                className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex-1">
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Filter by city..."
                                className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="lg:w-48">
                            <select
                                value={bloodGroup}
                                onChange={(e) => setBloodGroup(e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Blood Groups</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="flex min-h-96 items-center justify-center text-lg font-semibold text-muted">
                        Loading Blood Banks...
                    </div>
                ) : bloodBanks.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface p-12 text-center">
                        <Filter className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h2 className="text-xl font-bold text-foreground">No blood banks found</h2>
                        <p className="mt-2 text-muted">
                            Try changing your search or blood group filter.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {bloodBanks.map((bank, index) => {
                                const isLastItem = index === bloodBanks.length - 1;

                                return (
                                    <div
                                        ref={isLastItem ? lastElementRef : null}
                                        key={`${bank._id}-${index}`}
                                        className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:border-primary/40 hover:shadow-md"
                                    >
                                        <div>
                                            <div className="relative h-48 w-full bg-surface-secondary">
                                                <Image
                                                    src={getValidImage(bank.images?.[0])}
                                                    alt={bank.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover"
                                                />

                                                {bank.is_delivery_available && (
                                                    <span className="absolute right-4 top-4 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-bold text-success">
                                                        Delivery Available
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-6">
                                                <h2 className="mb-2 truncate text-xl font-bold text-foreground">
                                                    {bank.name}
                                                </h2>

                                                <p className="mb-4 flex items-center gap-1.5 text-sm text-muted">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    {bank.address?.city}, {bank.address?.state}
                                                </p>

                                                <div className="mt-4 flex items-center justify-between gap-3">
                                                    <div className="text-sm text-muted">
                                                        <span className="font-semibold text-foreground">
                                                            {bank.inventory?.length || 0}
                                                        </span>{" "}
                                                        Blood Groups
                                                    </div>

                                                    <Link
                                                        href={`/shop/bloodbanks/${bank._id}`}
                                                        className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-primary hover:text-primary-foreground"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
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
                                    Loading more blood banks...
                                </span>
                            </div>
                        )}

                        {!hasMore && bloodBanks.length > 0 && (
                            <div className="py-8 text-center text-sm font-medium text-muted-foreground">
                                You have reached the end of the list. Total Rendered: {bloodBanks.length}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}