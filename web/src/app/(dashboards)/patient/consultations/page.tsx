import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import { redirect } from "next/navigation";
import ConsultationsClient from "@/components/patient/ConsultationsClient";

export const metadata: Metadata = { title: "My Consultations | Somatic" };

type Props = {
    searchParams: Promise<{ tab?: string; page?: string; limit?: string }>;
};

export default async function ConsultationsPage({ searchParams }: Props) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const resolvedParams = await searchParams;
    const activeTab = resolvedParams.tab === "pending" ? "pending" : "completed";
    const page = parseInt(resolvedParams.page || "1", 10);
    const limit = parseInt(resolvedParams.limit || "9", 10);
    const skip = (page - 1) * limit;

    await dbConnect();

    const baseQuery = { patient_id: session.user.id };
    const tabQuery = activeTab === "completed"
        ? { ...baseQuery, status: "completed" }
        : { ...baseQuery, status: { $ne: "completed" } };

    const total = await Consultation.countDocuments(tabQuery);
    const rawConsultations = await Consultation.find(tabQuery)
        .select("_id status created_at ai_draft.is_emergency ai_draft.chief_complaints")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const consultations = rawConsultations.map((c: any) => ({
        _id: c._id.toString(),
        status: c.status,
        created_at: c.created_at.toISOString(),
        is_emergency: c.ai_draft?.is_emergency || false,
        chief_complaints: c.ai_draft?.chief_complaints || []
    }));

    const completedCount = await Consultation.countDocuments({ ...baseQuery, status: "completed" });
    const pendingCount = await Consultation.countDocuments({ ...baseQuery, status: { $ne: "completed" } });

    const pagination = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
    };

    const counts = { completed: completedCount, pending: pendingCount };

    return (
        <ConsultationsClient
            consultations={consultations}
            pagination={pagination}
            activeTab={activeTab}
            counts={counts}
        />
    );
}