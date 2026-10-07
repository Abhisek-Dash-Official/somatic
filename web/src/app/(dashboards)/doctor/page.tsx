import type { Metadata } from "next";
import DoctorDashboardClient from "@/components/doctor/DoctorDashboardClient";
import QRScannerBtn from "@/components/patient/QRScannerBtn";

export const metadata: Metadata = {
    title: "Doctor Dashboard | Somatic",
    description: "Manage patient consultations, view emergency alerts, and update clinical prescriptions.",
};

export default function DoctorDashboardPage() {
    return (
        <div className="min-h-screen bg-background py-6 text-foreground sm:py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <DoctorDashboardClient />

                <div className="mt-6 flex flex-col justify-between gap-4 border border-border bg-surface p-5 sm:flex-row sm:items-center">
                    <div>
                        <h3 className="font-semibold text-foreground">Visiting a Hospital?</h3>
                        <p className="mt-1 text-sm text-muted">
                            Scan the hospital QR code to prefill your available information.
                        </p>
                    </div>

                    <QRScannerBtn className="w-full sm:w-auto" />
                </div>
            </div>
        </div>
    );
}