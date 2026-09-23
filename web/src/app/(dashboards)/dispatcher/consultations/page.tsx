import type { Metadata } from "next";
import DispatcherConsultations from "@/components/dispatcher/DispatcherConsultations";

export const metadata: Metadata = {
    title: "Dispatcher Consultations | SOMATIC",
    description:
        "Monitor patient consultations, doctor activity, emergencies and ambulance coordination.",
};

export default function DispatcherConsultationsPage() {
    return <DispatcherConsultations />;
}