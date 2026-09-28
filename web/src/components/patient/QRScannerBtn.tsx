"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, X, Loader2, CheckCircle2, ScanLine } from "lucide-react";
import { toast } from "react-toastify";

interface QRScannerBtnProps {
    className?: string;
}

export default function QRScannerBtn({ className = "" }: QRScannerBtnProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const processingRef = useRef(false);

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const stopScanner = async () => {
        const scanner = scannerRef.current;

        if (!scanner) return;

        scannerRef.current = null;

        try {
            await scanner.stop();
        } catch { }

        try {
            scanner.clear();
        } catch { }
    };

    const closeScanner = async () => {
        await stopScanner();

        processingRef.current = false;

        setOpen(false);
        setSuccess(false);
        setLoading(false);
    };

    const handleQRScan = async (decodedText: string) => {
        if (processingRef.current) return;

        processingRef.current = true;

        await stopScanner();

        setLoading(true);

        try {
            const response = await fetch("/api/hospital/paperwork/autofill", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qr_data: decodedText }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to prepare hospital paperwork.");
            }

            toast.success("Hospital paperwork information prepared successfully.");
            setSuccess(true);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to process hospital QR.");
            setOpen(false);
        } finally {
            setLoading(false);
            processingRef.current = false;
        }
    };

    useEffect(() => {
        if (!open) return;

        let mounted = true;

        const startScanner = async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));

            if (!mounted) return;

            const scanner = new Html5Qrcode("qr-reader");

            scannerRef.current = scanner;

            try {
                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    async (decodedText) => {
                        await handleQRScan(decodedText);
                    },
                    () => { }
                );
            } catch (error) {
                if (!mounted) return;

                await stopScanner();

                if (error instanceof DOMException) {
                    if (error.name === "NotAllowedError") {
                        toast.warn("Camera permission is required to scan the hospital QR.");
                    } else if (error.name === "NotFoundError") {
                        toast.error("No camera was found on this device.");
                    } else if (error.name === "NotReadableError") {
                        toast.error("Camera is already being used by another application.");
                    } else {
                        toast.error("Unable to access the camera.");
                    }
                } else {
                    toast.error("Unable to access the camera. Please allow camera permission.");
                }

                setOpen(false);
            }
        };

        startScanner();

        return () => {
            mounted = false;
            stopScanner();
        };
    }, [open]);

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    const openScanner = () => {
        setSuccess(false);
        setLoading(false);
        processingRef.current = false;
        setOpen(true);
    };

    return (
        <>
            <button
                type="button"
                onClick={openScanner}
                className={`group flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover ${className}`}
            >
                <QrCode className="h-5 w-5 transition-transform group-hover:scale-110" />
                Scan Hospital QR
            </button>

            {open && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                                    <ScanLine className="h-5 w-5 text-primary" />
                                    Scan Hospital QR
                                </h2>

                                <p className="mt-1 text-xs text-muted">
                                    Scan the QR code provided by the hospital
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeScanner}
                                className="rounded-lg p-2 text-muted transition hover:bg-surface-secondary hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-5">
                            {!success && !loading && (
                                <>
                                    <div className="w-full overflow-hidden rounded-lg border border-border bg-background p-2">
                                        <div id="qr-reader" className="w-full overflow-hidden rounded-md" />
                                    </div>

                                    <p className="mt-4 text-center text-sm text-muted">
                                        Point your camera at the hospital QR code
                                    </p>
                                </>
                            )}

                            {loading && (
                                <div className="flex min-h-75 flex-col items-center justify-center text-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />

                                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                                        Preparing your information
                                    </h3>

                                    <p className="mt-2 text-sm text-muted">
                                        Please wait while we prepare your hospital paperwork.
                                    </p>
                                </div>
                            )}

                            {success && (
                                <div className="flex min-h-75 flex-col items-center justify-center text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                                        <CheckCircle2 className="h-9 w-9 text-success" />
                                    </div>

                                    <h3 className="mt-5 text-xl font-bold text-foreground">
                                        Information Prepared
                                    </h3>

                                    <p className="mt-2 max-w-sm text-sm text-muted">
                                        Your available information has been prepared for the hospital paperwork.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={closeScanner}
                                        className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}