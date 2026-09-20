"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Loader2, Filter } from "lucide-react";

const getValidImage = (imgSrc: string) => {
    if (imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"))) {
        return imgSrc;
    }
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
            if (isNewSearch) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const params = new URLSearchParams();
            params.set("limit", limit.toString());
            if (bloodGroup) params.set("bloodGroup", bloodGroup);
            if (search.trim()) params.set("search", search.trim());
            if (city.trim()) params.set("city", city.trim());

            const currentList = bloodBanksRef.current;
            if (!isNewSearch && currentList.length > 0) {
                const lastItem = currentList[currentList.length - 1];
                if (lastItem) {
                    params.set("lastId", lastItem._id);
                }
            }

            const res = await fetch(`/api/shop/bloodbanks?${params.toString()}`);
            const json = await res.json();

            if (json.success) {
                const fetchedData = json.data || [];

                if (isNewSearch) {
                    setBloodBanks(fetchedData);
                } else {
                    setBloodBanks((prev) => {
                        const existingIds = new Set(prev.map(item => item._id));
                        const uniqueNewItems = fetchedData.filter((item: any) => !existingIds.has(item._id));
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

    const handleSearchSubmit = (e: React.FormEvent) => {
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
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Available Blood Banks</h1>
                        <p className="text-slate-500 mt-1">Find blood banks and check real-time availability.</p>
                    </div>
                    <div className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow">
                        Rendered Items: {bloodBanks.length}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by blood bank name..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div className="flex-1">
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Filter by city..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div className="lg:w-48">
                            <select
                                value={bloodGroup}
                                onChange={(e) => setBloodGroup(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-red-500 font-medium text-slate-700"
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
                            className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="min-h-96 flex items-center justify-center text-lg font-semibold text-slate-500">
                        Loading Blood Banks...
                    </div>
                ) : bloodBanks.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                        <Filter className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h2 className="text-xl font-bold text-slate-800">No blood banks found</h2>
                        <p className="text-slate-500 mt-2">Try changing your search or blood group filter.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {bloodBanks.map((bank, index) => {
                                const isLastItem = index === bloodBanks.length - 1;

                                return (
                                    <div
                                        ref={isLastItem ? lastElementRef : null}
                                        key={`${bank._id}-${index}`}
                                        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="relative h-48 w-full bg-slate-200">
                                                <Image
                                                    src={getValidImage(bank.images?.[0])}
                                                    alt={bank.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover"
                                                />
                                                {bank.is_delivery_available && (
                                                    <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                        Delivery Available
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-6">
                                                <h2 className="text-xl font-bold text-slate-800 mb-2 truncate">{bank.name}</h2>
                                                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-slate-400" /> {bank.address?.city}, {bank.address?.state}
                                                </p>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="text-sm text-slate-600">
                                                        <span className="font-semibold">{bank.inventory?.length || 0}</span> Blood Groups
                                                    </div>
                                                    <Link
                                                        href={`/shop/bloodbanks/${bank._id}`}
                                                        className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
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
                                <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                                <span className="ml-2 text-sm text-slate-600 font-medium">Loading more blood banks...</span>
                            </div>
                        )}

                        {!hasMore && bloodBanks.length > 0 && (
                            <div className="text-center py-8 text-sm text-slate-400 font-medium">
                                You have reached the end of the list. Total Rendered: {bloodBanks.length}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}