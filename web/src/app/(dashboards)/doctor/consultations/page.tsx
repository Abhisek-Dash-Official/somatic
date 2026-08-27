import { Metadata } from "next";
import DoctorConsultationsListClient from "@/components/doctor/DoctorConsultationsListClient";

export const metadata: Metadata = {
    title: "My Consultations | Doctor Panel",
    description: "View and manage your patient consultations.",
};

export default function DoctorConsultationsPage() {
    return <DoctorConsultationsListClient />;
}