import type { Metadata } from "next";
import DispatcherAmbulances from "@/components/dispatcher/DispatcherAmbulances";

export const metadata: Metadata = {
    title: "Ambulance Requests | SOMATIC",
    description: "Manage and coordinate emergency ambulance requests.",
};

export default function DispatcherAmbulancesPage() {
    return <DispatcherAmbulances />;
}