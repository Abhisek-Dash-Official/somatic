"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

const getValidImage = (imgSrc: string) => {
    if (imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"))) {
        return imgSrc;
    }
    return "/fallback.png";
};

export default function BloodBanksList() {
    const [bloodBanks, setBloodBanks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/shop/bloodbanks")
            .then((res) => res.json())
            .then((json) => {
                if (json.success) setBloodBanks(json.data);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-slate-500">
                Loading Blood Banks...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Available Blood Banks</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bloodBanks.map((bank) => (
                        <div key={bank._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300">
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
                    ))}
                </div>
            </div>
        </div>
    );
}