import { Metadata } from "next";
import NewConsultationForm from "@/components/consultations/NewConsultationForm";

export const metadata: Metadata = {
    title: "New Consultation | Somatic AI",
};

export default function NewConsultationPage() {
    return (
        <div className="max-w-2xl mx-auto p-6 mt-10 bg-[#131C31] border border-slate-800/60 rounded-xl shadow-xl">
            <h1 className="text-3xl font-bold mb-3 text-slate-100">New AI Consultation</h1>
            <p className="text-slate-400 mb-8">Describe your symptoms to get an instant AI preliminary analysis and triage.</p>

            <NewConsultationForm />
        </div>
    );
}