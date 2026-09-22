import { Metadata } from "next";
import DoctorDashboardClient from "@/components/doctor/DoctorDashboardClient";
import QRScannerBtn from "@/components/patient/QRScannerBtn";

export const metadata: Metadata = {
    title: "Doctor Dashboard | Somatic",
    description: "Manage patient consultations, view emergency alerts, and update clinical prescriptions.",
};

export default function DoctorDashboardPage() {
    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <DoctorDashboardClient />
            </div>
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0f172a]/60 p-5 sm:flex-row">
                <div>
                    <h3 className="font-semibold text-white">
                        Visiting a Hospital?
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                        Scan the hospital QR code to prefill your available information.
                    </p>
                </div>

                <QRScannerBtn className="w-full sm:w-auto" />
            </div>
        </div>
    );
}