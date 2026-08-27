import { Metadata } from "next";
import DoctorConsultationActionClient from "@/components/doctor/DoctorConsultationActionClient";

export const metadata: Metadata = {
    title: "Process Case | Doctor Panel",
};

export default async function ConsultationActionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <DoctorConsultationActionClient id={id} />;
}