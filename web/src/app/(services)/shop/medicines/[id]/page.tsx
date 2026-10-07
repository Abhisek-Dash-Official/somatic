"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Pill, Package, FileText, Building2, ShoppingCart, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/useCartStore";

const getValidImage = (imgSrc: string) => {
    if (imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"))) return imgSrc;
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
                if (json.success) setMedicine(json.data);
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

        const success = await addToCart("Medicine", medicine._id, undefined, quantity);

        if (success) toast.success("Added to cart");
        else toast.error("Failed to add to cart");

        setAdding(false);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background font-semibold text-muted">
                Loading medicine details...
            </div>
        );
    }

    if (!medicine) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background font-bold text-danger">
                <p>Medicine not found</p>

                <Link
                    href="/shop/medicines"
                    className="text-sm text-primary underline hover:text-primary-hover"
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
    const reqPrescription =
        medicine.requires_prescription ?? medicine.prescription_required ?? false;

    return (
        <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <div>
                    <Link
                        href="/shop/medicines"
                        className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Medicines
                    </Link>

                    <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase text-accent-foreground">
                            {medicine.category || "Medicine"}
                        </span>

                        {reqPrescription && (
                            <span className="rounded-full border border-warning/20 bg-warning/15 px-3 py-1 text-xs font-bold text-warning">
                                Prescription Required
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-foreground">{medicine.name}</h1>

                    {medicine.brand && (
                        <p className="mt-1 text-lg text-muted">Brand: {medicine.brand}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="relative h-80 overflow-hidden rounded-2xl bg-surface-secondary md:col-span-2">
                        <Image
                            src={getValidImage(images[0])}
                            alt={medicine.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 66vw"
                            className="object-cover"
                        />
                    </div>

                    <div className="hidden h-80 grid-rows-2 gap-4 md:grid">
                        {[1, 2].map((idx) => (
                            <div
                                key={idx}
                                className="relative h-38 overflow-hidden rounded-xl bg-surface-secondary"
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

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-1">
                        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                            <h3 className="mb-5 text-lg font-bold text-foreground">
                                Medicine Information
                            </h3>

                            <ul className="space-y-5 text-sm text-muted">
                                {medicine.manufacturer && (
                                    <li className="flex items-start gap-3">
                                        <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <strong className="block text-foreground">Manufacturer</strong>
                                            {medicine.manufacturer}
                                        </div>
                                    </li>
                                )}

                                {medicine.category && (
                                    <li className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <strong className="block text-foreground">Category</strong>
                                            {medicine.category}
                                        </div>
                                    </li>
                                )}

                                {medicine.dosage_form && (
                                    <li className="flex items-start gap-3">
                                        <Pill className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <strong className="block text-foreground">Dosage Form</strong>
                                            {medicine.dosage_form}
                                        </div>
                                    </li>
                                )}

                                {medicine.packaging && (
                                    <li className="flex items-start gap-3">
                                        <Package className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <strong className="block text-foreground">Packaging</strong>
                                            {medicine.packaging}
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {medicine.description && (
                            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                                <h3 className="mb-3 text-lg font-bold text-foreground">Description</h3>
                                <p className="text-sm leading-6 text-muted">{medicine.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-2">
                                <ShoppingCart className="h-6 w-6 text-primary" />
                                <h3 className="text-xl font-bold text-foreground">Purchase Medicine</h3>
                            </div>

                            <div className="mb-6 flex items-baseline gap-4 rounded-xl bg-surface-secondary p-5">
                                <div>
                                    <p className="text-sm text-muted">Price</p>
                                    <p className="mt-1 text-3xl font-bold text-foreground">
                                        ₹{itemPrice}
                                    </p>
                                </div>

                                {itemMrp > itemPrice && (
                                    <div className="text-lg text-muted-foreground line-through">
                                        ₹{itemMrp}
                                    </div>
                                )}
                            </div>

                            <div className="mb-6 flex items-center justify-between border-b border-border pb-5">
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 text-muted-foreground" />

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
                                    <span className="rounded-full border border-success/20 bg-success/15 px-3 py-1 text-xs font-bold text-success">
                                        In Stock
                                    </span>
                                ) : (
                                    <span className="rounded-full border border-danger/20 bg-danger/15 px-3 py-1 text-xs font-bold text-danger">
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            {reqPrescription && (
                                <div className="mb-6 flex gap-3 rounded-xl border border-warning/20 bg-warning/10 p-4">
                                    <AlertCircle className="h-5 w-5 shrink-0 text-warning" />

                                    <div>
                                        <p className="font-semibold text-warning">Prescription Required</p>
                                        <p className="mt-1 text-sm text-muted">
                                            A valid prescription may be required before dispatch.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {stockCount > 0 && (
                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-semibold text-foreground">
                                        Quantity
                                    </label>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="h-10 w-10 rounded-xl border border-border bg-surface-secondary text-lg font-bold text-foreground transition-colors hover:bg-accent"
                                        >
                                            -
                                        </button>

                                        <span className="w-12 text-center font-bold text-foreground">
                                            {quantity}
                                        </span>

                                        <button
                                            onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                                            className="h-10 w-10 rounded-xl border border-border bg-surface-secondary text-lg font-bold text-foreground transition-colors hover:bg-accent"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {stockCount > 0 && (
                                <div className="mb-6 flex items-center justify-between">
                                    <span className="text-muted">Total</span>
                                    <span className="text-2xl font-bold text-foreground">
                                        ₹{itemPrice * quantity}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handleAddToCart}
                                disabled={stockCount <= 0 || adding}
                                className={`w-full rounded-xl py-3.5 font-semibold transition-colors ${stockCount > 0
                                        ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                                        : "cursor-not-allowed bg-surface-secondary text-muted-foreground"
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