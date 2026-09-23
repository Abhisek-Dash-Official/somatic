import type { Metadata } from "next";
import DispatcherConsultationDetail from "@/components/dispatcher/DispatcherConsultationDetail";

export const metadata: Metadata = {
    title: "Consultation Details | SOMATIC",
    description: "View detailed patient consultation and emergency coordination information.",
};

export default async function DispatcherConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return <DispatcherConsultationDetail consultationId={id} />;
}