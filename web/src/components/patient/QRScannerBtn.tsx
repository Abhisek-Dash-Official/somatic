"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, X, Loader2, CheckCircle2, ScanLine } from "lucide-react";
import { toast } from "react-toastify";

interface QRScannerBtnProps {
    className?: string;
}

export default function QRScannerBtn({
    className = "",
}: QRScannerBtnProps) {
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
            const response = await fetch(
                "/api/hospital/paperwork/autofill",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        qr_data: decodedText,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Failed to prepare hospital paperwork."
                );
            }

            toast.success(
                "Hospital paperwork information prepared successfully."
            );

            setSuccess(true);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to process hospital QR."
            );

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
            await new Promise((resolve) =>
                setTimeout(resolve, 100)
            );

            if (!mounted) return;

            const scanner = new Html5Qrcode("qr-reader");

            scannerRef.current = scanner;

            try {
                await scanner.start(
                    {
                        facingMode: "environment",
                    },
                    {
                        fps: 10,
                        qrbox: {
                            width: 250,
                            height: 250,
                        },
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
                        toast.warn(
                            "Camera permission is required to scan the hospital QR."
                        );
                    } else if (error.name === "NotFoundError") {
                        toast.error(
                            "No camera was found on this device."
                        );
                    } else if (
                        error.name === "NotReadableError"
                    ) {
                        toast.error(
                            "Camera is already being used by another application."
                        );
                    } else {
                        toast.error(
                            "Unable to access the camera."
                        );
                    }
                } else {
                    toast.error(
                        "Unable to access the camera. Please allow camera permission."
                    );
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
                className={`group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-500 hover:shadow-blue-500/25 ${className}`}
            >
                <QrCode className="h-5 w-5 transition-transform group-hover:scale-110" />
                Scan Hospital QR
            </button>

            {open && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                            <div>
                                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                                    <ScanLine className="h-5 w-5 text-blue-400" />
                                    Scan Hospital QR
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Scan the QR code provided by the hospital
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeScanner}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-5">
                            {!success && !loading && (
                                <>
                                    <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2">
                                        <div
                                            id="qr-reader"
                                            className="w-full overflow-hidden rounded-xl"
                                        />
                                    </div>

                                    <p className="mt-4 text-center text-sm text-slate-400">
                                        Point your camera at the hospital QR
                                        code
                                    </p>
                                </>
                            )}

                            {loading && (
                                <div className="flex min-h-75 flex-col items-center justify-center text-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />

                                    <h3 className="mt-4 text-lg font-semibold text-white">
                                        Preparing your information
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-400">
                                        Please wait while we prepare your
                                        hospital paperwork.
                                    </p>
                                </div>
                            )}

                            {success && (
                                <div className="flex min-h-75 flex-col items-center justify-center text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                                        <CheckCircle2 className="h-9 w-9 text-green-400" />
                                    </div>

                                    <h3 className="mt-5 text-xl font-bold text-white">
                                        Information Prepared
                                    </h3>

                                    <p className="mt-2 max-w-sm text-sm text-slate-400">
                                        Your available information has been
                                        prepared for the hospital paperwork.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={closeScanner}
                                        className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
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