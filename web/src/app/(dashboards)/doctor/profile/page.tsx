import { Metadata } from "next";
import DoctorProfileClient from "@/components/doctor/DoctorProfileClient";

export const metadata: Metadata = {
    title: "Doctor Profile | Somatic",
    description: "Update your professional credentials, availability, and account security.",
};

export default function DoctorProfilePage() {
    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 py-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                    <p className="text-slate-400 mt-1">Manage your clinical identity and account security.</p>
                </div>

                <DoctorProfileClient />
            </div>
        </div>
    );
}