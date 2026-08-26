import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
    title: "My Consultations | Somatic",
};

export default async function ConsultationsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    await dbConnect();

    const consultations = await Consultation.find({ patient_id: session.user.id })
        .select("_id status created_at ai_draft.is_emergency ai_draft.chief_complaints")
        .sort({ created_at: -1 })
        .lean();

    return (
        <div className="max-w-5xl mx-auto p-6 mt-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">My Consultations</h1>
                    <p className="text-slate-400 mt-1">Review your AI drafts and doctor prescriptions.</p>
                </div>
                <Link
                    href="/patient/consultations/new"
                    className="bg-blue-600/90 hover:bg-blue-500 text-slate-100 px-5 py-2.5 rounded-lg font-medium transition shadow-lg shadow-blue-900/20"
                >
                    + New Consultation
                </Link>
            </div>

            {consultations.length === 0 ? (
                <div className="bg-[#131C31] rounded-xl border border-slate-800 p-12 text-center shadow-lg">
                    <h3 className="text-lg font-medium text-slate-200 mb-2">No consultations yet</h3>
                    <p className="text-slate-400 mb-6">You haven't requested any medical consultations.</p>
                    <Link href="/patient/consultations/new" className="text-blue-400 font-medium hover:text-blue-300 hover:underline">
                        Start your first consultation &rarr;
                    </Link>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {consultations.map((consultation: any) => (
                        <Link
                            key={consultation._id.toString()}
                            href={`/patient/consultations/${consultation._id.toString()}`}
                            className="block group"
                        >
                            <div className="bg-[#131C31] p-5 rounded-xl border border-slate-700/50 shadow-md hover:border-slate-500 transition-all relative overflow-hidden h-full flex flex-col justify-between">

                                {consultation.ai_draft?.is_emergency && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
                                )}

                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${consultation.status === "completed" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                            consultation.status === "in_review" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                            }`}>
                                            {consultation.status.replace("_", " ")}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(consultation.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-slate-200 font-semibold mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                                        {consultation.ai_draft?.chief_complaints?.join(", ") || "General Symptoms"}
                                    </h3>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center text-sm">
                                    <span className="text-slate-400">View details</span>
                                    <span className="text-blue-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}