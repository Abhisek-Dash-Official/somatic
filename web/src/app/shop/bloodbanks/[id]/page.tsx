"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Droplet, MapPin, Phone, Mail, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/useCartStore";

const getValidImage = (imgSrc: string) => {
    if (imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"))) {
        return imgSrc;
    }
    return "/fallback.png";
};

export default function BloodBankDetail() {
    const params = useParams();
    const [bank, setBank] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [addingKey, setAddingKey] = useState<string | null>(null);
    const { addToCart } = useCartStore();

    useEffect(() => {
        if (params.id) {
            fetch(`/api/shop/bloodbanks/${params.id}`)
                .then((res) => res.json())
                .then((json) => {
                    if (json.success) setBank(json.data);
                    setLoading(false);
                });
        }
    }, [params.id]);

    const handleAddToCart = async (bloodGroup: string) => {
        setAddingKey(bloodGroup);
        const success = await addToCart("BloodBank", bank._id, bloodGroup, 1);

        if (success) {
            toast.success("Added to cart successfully!");
        } else {
            toast.error("Failed to add to cart");
        }
        setAddingKey(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-semibold text-slate-500">
                Loading details...
            </div>
        );
    }

    if (!bank) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">
                Blood Bank not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{bank.name}</h1>
                    <p className="text-lg text-slate-600 mt-1">{bank.hospital_affiliation}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-100">
                    <div className="md:col-span-2 relative rounded-2xl overflow-hidden bg-slate-200">
                        <Image
                            src={getValidImage(bank.images?.[0])}
                            alt={bank.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 66vw"
                            className="object-cover"
                        />
                    </div>

                    <div className="hidden md:grid grid-rows-2 gap-4">
                        {[1, 2].map((idx) => (
                            <div key={idx} className="relative rounded-2xl overflow-hidden bg-slate-200">
                                <Image
                                    src={getValidImage(bank.images?.[idx])}
                                    alt={`Gallery ${idx}`}
                                    fill
                                    sizes="33vw"
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Contact & Location</h3>
                            <ul className="space-y-5 text-sm text-slate-600">
                                <li className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                                    <div>
                                        <strong className="block text-slate-800">License No</strong>
                                        {bank.license_no}
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                                    <div>
                                        <strong className="block text-slate-800">Phone</strong>
                                        +91 {bank.contact_no}
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                                    <div>
                                        <strong className="block text-slate-800">Email</strong>
                                        {bank.email}
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 pt-3 border-t">
                                    <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                                    <div>
                                        <strong className="block text-slate-800">Address</strong>
                                        {bank.address?.street},<br /> {bank.address?.city}, {bank.address?.state} - {bank.address?.pincode}
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Droplet className="w-6 h-6 text-red-500 fill-red-100" />
                                Live Blood Inventory
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 border-y">
                                            <th className="py-3 px-4 font-semibold text-sm">Blood Group</th>
                                            <th className="py-3 px-4 font-semibold text-sm">Stock Units</th>
                                            <th className="py-3 px-4 font-semibold text-sm">Price / Unit</th>
                                            <th className="py-3 px-4 font-semibold text-sm text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bank.inventory?.map((item: any, idx: number) => (
                                            <tr key={idx} className="border-b last:border-b-0 hover:bg-slate-50">
                                                <td className="py-4 px-4 font-bold text-red-600 text-lg">{item.blood_group}</td>
                                                <td className="py-4 px-4">
                                                    {item.stock_units > 0
                                                        ? <span className="text-slate-800 font-medium">{item.stock_units} Units</span>
                                                        : <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">Out of Stock</span>
                                                    }
                                                </td>
                                                <td className="py-4 px-4 text-slate-600 font-medium">₹{item.price_per_unit}</td>
                                                <td className="py-4 px-4 text-right">
                                                    <button
                                                        onClick={() => handleAddToCart(item.blood_group)}
                                                        disabled={item.stock_units === 0 || addingKey === item.blood_group}
                                                        className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${item.stock_units > 0
                                                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        {addingKey === item.blood_group ? "Adding..." : "Add to Cart"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}