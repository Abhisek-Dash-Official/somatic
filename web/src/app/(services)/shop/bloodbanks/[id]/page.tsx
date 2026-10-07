"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Droplet, MapPin, Phone, Mail, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/useCartStore";

const getValidImage = (imgSrc: string) => {
    if (imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"))) return imgSrc;
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

        if (success) toast.success("Added to cart successfully!");
        else toast.error("Failed to add to cart");

        setAddingKey(null);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background font-semibold text-muted">
                Loading details...
            </div>
        );
    }

    if (!bank) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background font-bold text-danger">
                Blood Bank not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{bank.name}</h1>
                    <p className="mt-1 text-lg text-muted">{bank.hospital_affiliation}</p>
                </div>

                <div className="grid h-auto grid-cols-1 gap-4 md:h-100 md:grid-cols-3">
                    <div className="relative h-72 overflow-hidden rounded-2xl bg-surface-secondary md:col-span-2 md:h-auto">
                        <Image
                            src={getValidImage(bank.images?.[0])}
                            alt={bank.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 66vw"
                            className="object-cover"
                        />
                    </div>

                    <div className="hidden grid-rows-2 gap-4 md:grid">
                        {[1, 2].map((idx) => (
                            <div
                                key={idx}
                                className="relative overflow-hidden rounded-xl bg-surface-secondary"
                            >
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

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-1">
                        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-foreground">
                                Contact & Location
                            </h3>

                            <ul className="space-y-5 text-sm text-muted">
                                <li className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                                    <div>
                                        <strong className="block text-foreground">License No</strong>
                                        {bank.license_no}
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 shrink-0 text-muted-foreground" />
                                    <div>
                                        <strong className="block text-foreground">Phone</strong>
                                        +91 {bank.contact_no}
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
                                    <div>
                                        <strong className="block text-foreground">Email</strong>
                                        {bank.email}
                                    </div>
                                </li>

                                <li className="flex items-start gap-3 border-t border-border pt-3">
                                    <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                                    <div>
                                        <strong className="block text-foreground">Address</strong>
                                        {bank.address?.street},<br />
                                        {bank.address?.city}, {bank.address?.state} -{" "}
                                        {bank.address?.pincode}
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
                                <Droplet className="h-6 w-6 fill-danger/10 text-danger" />
                                Live Blood Inventory
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-y border-border bg-surface-secondary text-muted">
                                            <th className="px-4 py-3 text-sm font-semibold">
                                                Blood Group
                                            </th>
                                            <th className="px-4 py-3 text-sm font-semibold">
                                                Stock Units
                                            </th>
                                            <th className="px-4 py-3 text-sm font-semibold">
                                                Price / Unit
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {bank.inventory?.map((item: any, idx: number) => (
                                            <tr
                                                key={idx}
                                                className="border-b border-border last:border-b-0 hover:bg-surface-secondary"
                                            >
                                                <td className="px-4 py-4 text-lg font-bold text-danger">
                                                    {item.blood_group}
                                                </td>

                                                <td className="px-4 py-4">
                                                    {item.stock_units > 0 ? (
                                                        <span className="font-medium text-foreground">
                                                            {item.stock_units} Units
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-danger/10 px-2.5 py-1 text-xs font-bold text-danger">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 font-medium text-muted">
                                                    ₹{item.price_per_unit}
                                                </td>

                                                <td className="px-4 py-4 text-right">
                                                    <button
                                                        onClick={() =>
                                                            handleAddToCart(item.blood_group)
                                                        }
                                                        disabled={
                                                            item.stock_units === 0 ||
                                                            addingKey === item.blood_group
                                                        }
                                                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${item.stock_units > 0
                                                                ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                                                                : "cursor-not-allowed border border-border bg-surface-secondary text-muted-foreground"
                                                            }`}
                                                    >
                                                        {addingKey === item.blood_group
                                                            ? "Adding..."
                                                            : "Add to Cart"}
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