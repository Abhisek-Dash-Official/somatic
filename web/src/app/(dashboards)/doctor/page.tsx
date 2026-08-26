import { Metadata } from "next";
import DoctorDashboardClient from "@/components/client/DoctorDashboardClient";

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
        </div>
    );
}