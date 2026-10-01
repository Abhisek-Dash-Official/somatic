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
            <div className="min-h-screen flex items-center justify-center font-semibold text-muted">
                Loading medicine details...
            </div>
        );
    }

    if (!medicine) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-danger font-bold gap-4">
                <p>Medicine not found</p>

                <Link
                    href="/shop/medicines"
                    className="text-primary hover:text-primary-hover underline text-sm"
                >
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
        <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <Link
                        href="/shop/medicines"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Medicines
                    </Link>

                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold uppercase">
                            {medicine.category || "Medicine"}
                        </span>

                        {reqPrescription && (
                            <span className="bg-warning/15 text-warning border border-warning/20 px-3 py-1 rounded-full text-xs font-bold">
                                Prescription Required
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-foreground">
                        {medicine.name}
                    </h1>

                    {medicine.brand && (
                        <p className="text-lg text-muted mt-1">
                            Brand: {medicine.brand}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 relative h-80 rounded-2xl overflow-hidden bg-surface-secondary">
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
                                className="relative rounded-xl overflow-hidden bg-surface-secondary h-38"
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
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                            <h3 className="text-lg font-bold text-foreground mb-5">
                                Medicine Information
                            </h3>

                            <ul className="space-y-5 text-sm text-muted">
                                {medicine.manufacturer && (
                                    <li className="flex items-start gap-3">
                                        <Building2 className="w-5 h-5 text-muted-foreground shrink-0" />

                                        <div>
                                            <strong className="block text-foreground">
                                                Manufacturer
                                            </strong>
                                            {medicine.manufacturer}
                                        </div>
                                    </li>
                                )}

                                {medicine.category && (
                                    <li className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-muted-foreground shrink-0" />

                                        <div>
                                            <strong className="block text-foreground">
                                                Category
                                            </strong>
                                            {medicine.category}
                                        </div>
                                    </li>
                                )}

                                {medicine.dosage_form && (
                                    <li className="flex items-start gap-3">
                                        <Pill className="w-5 h-5 text-muted-foreground shrink-0" />

                                        <div>
                                            <strong className="block text-foreground">
                                                Dosage Form
                                            </strong>
                                            {medicine.dosage_form}
                                        </div>
                                    </li>
                                )}

                                {medicine.packaging && (
                                    <li className="flex items-start gap-3">
                                        <Package className="w-5 h-5 text-muted-foreground shrink-0" />

                                        <div>
                                            <strong className="block text-foreground">
                                                Packaging
                                            </strong>
                                            {medicine.packaging}
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {medicine.description && (
                            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                                <h3 className="text-lg font-bold text-foreground mb-3">
                                    Description
                                </h3>

                                <p className="text-sm text-muted leading-6">
                                    {medicine.description}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                            <div className="flex items-center gap-2 mb-6">
                                <ShoppingCart className="w-6 h-6 text-primary" />

                                <h3 className="text-xl font-bold text-foreground">
                                    Purchase Medicine
                                </h3>
                            </div>

                            <div className="bg-surface-secondary rounded-xl p-5 mb-6 flex items-baseline gap-4">
                                <div>
                                    <p className="text-sm text-muted">
                                        Price
                                    </p>

                                    <p className="text-3xl font-bold text-foreground mt-1">
                                        ₹{itemPrice}
                                    </p>
                                </div>

                                {itemMrp > itemPrice && (
                                    <div className="text-muted-foreground line-through text-lg">
                                        ₹{itemMrp}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-b border-border pb-5 mb-6">
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5 text-muted-foreground" />

                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Available Stock
                                        </p>

                                        <p className="text-sm text-muted">
                                            {stockCount > 0
                                                ? `${stockCount} units available`
                                                : "Currently unavailable"}
                                        </p>
                                    </div>
                                </div>

                                {stockCount > 0 ? (
                                    <span className="bg-success/15 text-success border border-success/20 px-3 py-1 rounded-full text-xs font-bold">
                                        In Stock
                                    </span>
                                ) : (
                                    <span className="bg-danger/15 text-danger border border-danger/20 px-3 py-1 rounded-full text-xs font-bold">
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            {reqPrescription && (
                                <div className="flex gap-3 bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6">
                                    <AlertCircle className="w-5 h-5 text-warning shrink-0" />

                                    <div>
                                        <p className="font-semibold text-warning">
                                            Prescription Required
                                        </p>

                                        <p className="text-sm text-muted mt-1">
                                            A valid prescription may be required before dispatch.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {stockCount > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Quantity
                                    </label>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 rounded-lg border border-border bg-surface-secondary text-lg font-bold text-foreground hover:bg-accent transition-colors"
                                        >
                                            -
                                        </button>

                                        <span className="w-12 text-center font-bold text-foreground">
                                            {quantity}
                                        </span>

                                        <button
                                            onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                                            className="w-10 h-10 rounded-lg border border-border bg-surface-secondary text-lg font-bold text-foreground hover:bg-accent transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {stockCount > 0 && (
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-muted">
                                        Total
                                    </span>

                                    <span className="text-2xl font-bold text-foreground">
                                        ₹{itemPrice * quantity}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handleAddToCart}
                                disabled={stockCount <= 0 || adding}
                                className={`w-full py-3.5 rounded-xl font-semibold transition-colors ${stockCount > 0
                                        ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                                        : "bg-surface-secondary text-muted-foreground cursor-not-allowed"
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