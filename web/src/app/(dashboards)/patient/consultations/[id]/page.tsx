import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import Department from "@/models/Department";
import User from "@/models/User";
import { redirect } from "next/navigation";
import { Clock, User as UserIcon, AlertTriangle, ExternalLink, Ambulance } from "lucide-react";
import PlayAudioButton from "@/components/patient/PlayAudioButton";
import EHRDownloadButton from "@/components/patient/EHRDownloadButton";

export const metadata: Metadata = { title: "Consultation Details | Somatic" };

export default async function ConsultationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    Department;
    User;
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const { id } = await params;
    await dbConnect();

    const consultation = await Consultation.findById(id)
        .populate("assigned_department_id", "name")
        .populate("patient_id", "username")
        .populate("claimed_by_doctor_id", "username")
        .lean();

    if (!consultation) {
        return <div className="p-10 text-center text-red-400 font-bold">Consultation not found.</div>;
    }

    const isCompleted = consultation.status === "completed";
    const isEmergency = consultation.ai_draft?.is_emergency;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 mt-6 sm:mt-10">
            <div className="bg-[#131C31] shadow-xl rounded-xl border border-slate-800/60 p-4 sm:p-6 mb-6">

                {/* Mobile Responsive Header Area */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700/50 pb-4 mb-5 gap-4">
                    <div className="w-full sm:w-auto">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Consultation Report</h1>
                        {consultation.assigned_department_id && (
                            <p className="text-blue-400 text-xs sm:text-sm mt-1 font-medium">
                                Routed to: {(consultation.assigned_department_id as any).name} Department
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <span
                            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border capitalize whitespace-nowrap ${isCompleted
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : consultation.status === "in_review"
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                }`}
                        >
                            {consultation.status.replace("_", " ")}
                        </span>

                        {isCompleted && (
                            <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                <EHRDownloadButton consultation={JSON.parse(JSON.stringify(consultation))} />
                            </div>
                        )}
                    </div>
                </div>

                {isEmergency && (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 shadow-sm">
                        <p className="font-bold mb-1 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 shrink-0" /> Medical Emergency Alert
                        </p>
                        <p className="text-xs sm:text-sm opacity-90 ml-7">
                            AI detected potential life-threatening symptoms. Please seek immediate emergency medical care!
                        </p>
                    </div>
                )}

                {consultation.ambulance_dispatch?.required && (
                    <div className="bg-orange-900/20 border border-orange-500/30 text-orange-400 p-4 rounded-lg mb-6 shadow-sm">
                        <p className="font-bold mb-1 flex items-center gap-2">
                            <Ambulance className="w-5 h-5 shrink-0" /> Ambulance Requested
                        </p>
                        <p className="text-xs sm:text-sm opacity-90 ml-7">
                            Status: <span className="uppercase font-bold text-orange-300">{consultation.ambulance_dispatch.status.replace("_", " ")}</span>. A dispatcher will contact you shortly.
                        </p>
                    </div>
                )}

                <div className="bg-[#0B1120] p-4 rounded-lg border border-slate-700/30 mb-6">
                    <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center gap-2">
                        <UserIcon className="w-4 h-4" /> Your Input
                    </h2>
                    <ul className="text-slate-300 space-y-2 text-sm">
                        <li>
                            <strong className="text-slate-200">Age:</strong> {consultation.patient_input?.age} | <strong className="text-slate-200">Weight:</strong> {consultation.patient_input?.weight_kg} kg
                        </li>
                        <li className="pt-2">
                            <strong className="text-slate-200 block mb-1">Symptoms:</strong> <span className="opacity-90">{consultation.patient_input?.symptoms_raw_text}</span>
                        </li>

                        {consultation.patient_input?.attachments && consultation.patient_input.attachments.length > 0 && (
                            <li className="pt-4 border-t border-slate-700/50 mt-4">
                                <strong className="text-slate-200 block mb-2">Attached Files / Reports:</strong>
                                <ul className="space-y-2 pl-2 border-l-2 border-slate-700 overflow-hidden">
                                    {consultation.patient_input.attachments.map((att: any, idx: number) => (
                                        <li key={idx} className="truncate">
                                            <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:underline">
                                                <ExternalLink className="w-4 h-4 shrink-0" /> <span className="truncate">Attachment Document {idx + 1}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>

                {!isCompleted ? (
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 sm:p-10 text-center flex flex-col items-center">
                        <Clock className="w-12 h-12 text-blue-500/70 mb-4 animate-pulse" />
                        <h3 className="text-lg sm:text-xl font-semibold text-slate-200 mb-2">Awaiting Doctor's Review</h3>
                        <p className="text-slate-400 text-sm max-w-md">Your case is safely logged. Please wait until the assigned doctor completes their review and uploads your final prescription.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-green-900/10 border border-green-800/30 p-4 sm:p-5 rounded-lg mb-6">
                            <h2 className="text-sm uppercase tracking-wider font-semibold text-green-400 mb-4">Doctor's Final Prescription</h2>

                            <div className="space-y-4">
                                <div>
                                    <strong className="text-slate-300 block mb-1 text-sm">Medicines:</strong>
                                    <ul className="list-disc pl-5 text-slate-200 text-sm space-y-1">
                                        {consultation.doctor_final_prescription?.medicines?.map((med: string, i: number) => (
                                            <li key={i}>{med}</li>
                                        ))}
                                    </ul>
                                </div>

                                {consultation.doctor_final_prescription?.instructions && (
                                    <div className="mt-4 border-t border-green-800/30 pt-4">
                                        <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                                            <strong className="text-slate-300 block text-sm">Instructions / Diet:</strong>
                                            <PlayAudioButton
                                                text={consultation.doctor_final_prescription.translated_instructions || consultation.doctor_final_prescription.instructions}
                                                lang={consultation.patient_input?.preferred_prescription_language || "English"}
                                            />
                                        </div>

                                        {consultation.doctor_final_prescription.translated_instructions && (
                                            <p className="text-slate-200 text-sm font-medium mb-3 p-3 bg-green-900/20 rounded border border-green-800/40">
                                                {consultation.doctor_final_prescription.translated_instructions}
                                            </p>
                                        )}

                                        <div className="text-slate-400 text-xs bg-slate-900/50 p-3 rounded">
                                            <span className="block mb-1 opacity-70">English Original:</span>
                                            {consultation.doctor_final_prescription.instructions}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 pt-6 border-t border-slate-700/50">
                            <div className="bg-blue-900/10 border border-blue-800/30 p-4 rounded-lg">
                                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                                    <h2 className="text-sm uppercase tracking-wider font-semibold text-blue-400">AI Summary & Advice</h2>
                                    <PlayAudioButton
                                        text={consultation.ai_draft?.translated_ai_summary_and_advice || consultation.ai_draft?.ai_summary_and_advice || ""}
                                        lang={consultation.patient_input?.preferred_prescription_language || "English"}
                                    />
                                </div>
                                {consultation.ai_draft?.translated_ai_summary_and_advice && (
                                    <p className="text-blue-200 text-sm font-medium mb-3 p-3 bg-blue-900/20 rounded border border-blue-800/40">
                                        {consultation.ai_draft.translated_ai_summary_and_advice}
                                    </p>
                                )}
                                <div className={`text-sm whitespace-pre-wrap leading-relaxed ${consultation.ai_draft?.translated_ai_summary_and_advice ? 'text-slate-400 text-xs bg-slate-900/50 p-3 rounded' : 'text-blue-200/80'}`}>
                                    {consultation.ai_draft?.translated_ai_summary_and_advice && <span className="block mb-1 opacity-70">English Original:</span>}
                                    {consultation.ai_draft?.ai_summary_and_advice}
                                </div>
                            </div>

                            <div className="bg-emerald-900/10 border border-emerald-800/30 p-4 rounded-lg">
                                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                                    <h2 className="text-sm uppercase tracking-wider font-semibold text-emerald-400">Ayurvedic Insights</h2>
                                    <PlayAudioButton
                                        text={consultation.ai_draft?.translated_ayurvedic_hints || consultation.ai_draft?.ayurvedic_hints || ""}
                                        lang={consultation.patient_input?.preferred_prescription_language || "English"}
                                    />
                                </div>
                                {consultation.ai_draft?.translated_ayurvedic_hints && (
                                    <div className="text-emerald-200 text-sm font-medium mb-3 p-3 bg-emerald-900/20 rounded border border-emerald-800/40 italic">
                                        {consultation.ai_draft.translated_ayurvedic_hints}
                                    </div>
                                )}
                                <div className={`text-sm italic leading-relaxed ${consultation.ai_draft?.translated_ayurvedic_hints ? 'text-slate-400 text-xs bg-slate-900/50 p-3 rounded' : 'text-emerald-200/80'}`}>
                                    {consultation.ai_draft?.translated_ayurvedic_hints && <span className="block mb-1 opacity-70 not-italic">English Original:</span>}
                                    {consultation.ai_draft?.ayurvedic_hints || "No specific Ayurvedic correlation found."}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}