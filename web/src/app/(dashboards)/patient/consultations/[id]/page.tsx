import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Consultation Details | Somatic",
};

export default async function ConsultationDetailsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const { id } = await params;

    await dbConnect();

    const consultation = await Consultation.findById(id).lean();

    if (!consultation) {
        return <div className="p-10 text-center text-red-400 font-bold">Consultation not found.</div>;
    }

    const isEmergency = consultation.ai_draft?.is_emergency;

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10">
            <div className="bg-[#131C31] shadow-xl rounded-xl border border-slate-800/60 p-6 mb-6">

                <div className="flex justify-between items-center border-b border-slate-700/50 pb-4 mb-5">
                    <h1 className="text-2xl font-bold text-slate-100">Consultation Report</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border capitalize ${consultation.status === "completed" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            consultation.status === "in_review" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}>
                        {consultation.status.replace("_", " ")}
                    </span>
                </div>

                {isEmergency && (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 shadow-sm" role="alert">
                        <div className="flex items-center gap-2 mb-1">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                            <p className="font-bold">Medical Emergency Alert</p>
                        </div>
                        <p className="ml-7 text-sm opacity-90">AI detected potential life-threatening symptoms. Please seek immediate emergency medical care!</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#0B1120] p-4 rounded-lg border border-slate-700/30">
                        <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-400 mb-3">Patient Input</h2>
                        <ul className="text-slate-300 space-y-2 text-sm">
                            <li><strong className="text-slate-200">Age:</strong> {consultation.patient_input?.age}</li>
                            <li><strong className="text-slate-200">Weight:</strong> {consultation.patient_input?.weight_kg} kg</li>
                            <li className="pt-2"><strong className="text-slate-200 block mb-1">Symptoms:</strong> <span className="opacity-90">{consultation.patient_input?.symptoms_raw_text}</span></li>
                        </ul>
                    </div>

                    <div className="bg-blue-900/10 border border-blue-800/30 p-4 rounded-lg">
                        <h2 className="text-sm uppercase tracking-wider font-semibold text-blue-400 mb-3">AI Summary & Advice</h2>
                        <p className="text-blue-200/80 text-sm whitespace-pre-wrap leading-relaxed">{consultation.ai_draft?.ai_summary_and_advice}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-sm uppercase tracking-wider font-semibold text-green-400 mb-2">Ayurvedic Insights (RAG Context)</h2>
                    <div className="bg-green-900/10 border border-green-800/30 p-4 rounded-lg text-green-200/80 text-sm italic leading-relaxed">
                        {consultation.ai_draft?.ayurvedic_hints || "No specific Ayurvedic correlation found in the knowledge base."}
                    </div>
                </div>
            </div>
        </div>
    );
}