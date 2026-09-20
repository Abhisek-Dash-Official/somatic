"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
    Pill,
    Package,
    FileText,
    Building2,
    ShoppingCart,
    AlertCircle,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/useCartStore";

const getValidImage = (imgSrc: string) => {
    if (imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"))) {
        return imgSrc;
    }
    return "/fallback.png";
};

export default function MedicineDetail() {
    const params = useParams();

    const [medicine, setMedicine] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const { addToCart } = useCartStore();

    useEffect(() => {
        if (!params.id) return;

        fetch(`/api/shop/medicines/${params.id}`)
            .then((res) => res.json())
            .then((json) => {
                if (json.success) {
                    setMedicine(json.data);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [params.id]);

    const handleAddToCart = async () => {
        if (!medicine) return;

        const currentStock = medicine.stock ?? medicine.stock_quantity ?? 0;

        if (currentStock <= 0) {
            toast.error("This medicine is out of stock");
            return;
        }

        setAdding(true);
        const success = await addToCart(
            "Medicine",
            medicine._id,
            undefined,
            quantity
        );

        if (success) {
            toast.success("Added to cart");
        } else {
            toast.error("Failed to add to cart");
        }
        setAdding(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-semibold text-slate-500">
                Loading medicine details...
            </div>
        );
    }

    if (!medicine) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-red-500 font-bold gap-4">
                <p>Medicine not found</p>
                <Link href="/shop/medicines" className="text-blue-600 underline text-sm">
                    Back to Medicines
                </Link>
            </div>
        );
    }

    const images = medicine.images || [];
    const stockCount = medicine.stock ?? medicine.stock_quantity ?? 0;
    const itemPrice = medicine.pricing?.sale_price ?? medicine.price ?? 0;
    const itemMrp = medicine.pricing?.mrp ?? 0;
    const reqPrescription = medicine.requires_prescription ?? medicine.prescription_required ?? false;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <Link
                        href="/shop/medicines"
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Medicines
                    </Link>

                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            {medicine.category || "Medicine"}
                        </span>

                        {reqPrescription && (
                            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                                Prescription Required
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        {medicine.name}
                    </h1>

                    {medicine.brand && (
                        <p className="text-lg text-slate-600 mt-1">
                            Brand: {medicine.brand}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 relative h-80 rounded-2xl overflow-hidden bg-slate-200">
                        <Image
                            src={getValidImage(images[0])}
                            alt={medicine.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 66vw"
                            className="object-cover"
                        />
                    </div>

                    <div className="hidden md:grid grid-rows-2 gap-4 h-80">
                        {[1, 2].map((idx) => (
                            <div
                                key={idx}
                                className="relative rounded-xl overflow-hidden bg-slate-200 h-38"
                            >
                                <Image
                                    src={getValidImage(images[idx])}
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
                            <h3 className="text-lg font-bold text-slate-800 mb-5">
                                Medicine Information
                            </h3>

                            <ul className="space-y-5 text-sm text-slate-600">
                                {medicine.manufacturer && (
                                    <li className="flex items-start gap-3">
                                        <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
                                        <div>
                                            <strong className="block text-slate-800">Manufacturer</strong>
                                            {medicine.manufacturer}
                                        </div>
                                    </li>
                                )}

                                {medicine.category && (
                                    <li className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                                        <div>
                                            <strong className="block text-slate-800">Category</strong>
                                            {medicine.category}
                                        </div>
                                    </li>
                                )}

                                {medicine.dosage_form && (
                                    <li className="flex items-start gap-3">
                                        <Pill className="w-5 h-5 text-slate-400 shrink-0" />
                                        <div>
                                            <strong className="block text-slate-800">Dosage Form</strong>
                                            {medicine.dosage_form}
                                        </div>
                                    </li>
                                )}

                                {medicine.packaging && (
                                    <li className="flex items-start gap-3">
                                        <Package className="w-5 h-5 text-slate-400 shrink-0" />
                                        <div>
                                            <strong className="block text-slate-800">Packaging</strong>
                                            {medicine.packaging}
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {medicine.description && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-3">
                                    Description
                                </h3>
                                <p className="text-sm text-slate-600 leading-6">
                                    {medicine.description}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <ShoppingCart className="w-6 h-6 text-teal-600" />
                                <h3 className="text-xl font-bold text-slate-800">
                                    Purchase Medicine
                                </h3>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-5 mb-6 flex items-baseline gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Price</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">
                                        ₹{itemPrice}
                                    </p>
                                </div>
                                {itemMrp > itemPrice && (
                                    <div className="text-slate-400 line-through text-lg">
                                        ₹{itemMrp}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-b pb-5 mb-6">
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Available Stock
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {stockCount > 0 ? `${stockCount} units available` : "Currently unavailable"}
                                        </p>
                                    </div>
                                </div>

                                {stockCount > 0 ? (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                        In Stock
                                    </span>
                                ) : (
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            {reqPrescription && (
                                <div className="flex gap-3 bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                                    <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-orange-800">
                                            Prescription Required
                                        </p>
                                        <p className="text-sm text-orange-700 mt-1">
                                            A valid prescription may be required before dispatch.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {stockCount > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Quantity
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 rounded-lg border border-slate-200 bg-white text-lg font-bold hover:bg-slate-50"
                                        >
                                            -
                                        </button>
                                        <span className="w-12 text-center font-bold text-slate-800">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                                            className="w-10 h-10 rounded-lg border border-slate-200 bg-white text-lg font-bold hover:bg-slate-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {stockCount > 0 && (
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-slate-500">Total</span>
                                    <span className="text-2xl font-bold text-slate-900">
                                        ₹{itemPrice * quantity}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handleAddToCart}
                                disabled={stockCount <= 0 || adding}
                                className={`w-full py-3.5 rounded-xl font-semibold transition-colors ${stockCount > 0
                                        ? "bg-teal-700 text-white hover:bg-teal-800"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    }`}
                            >
                                {adding
                                    ? "Adding..."
                                    : stockCount > 0
                                        ? "Add to Cart"
                                        : "Out of Stock"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}