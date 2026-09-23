import type { Metadata } from "next";
import DispatcherAmbulanceDetail from "@/components/dispatcher/DispatcherAmbulanceDetail";

export const metadata: Metadata = {
    title: "Ambulance Request | SOMATIC",
    description: "Coordinate an emergency ambulance request.",
};

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function DispatcherAmbulanceDetailPage({ params }: PageProps) {
    const { id } = await params;

    return <DispatcherAmbulanceDetail consultationId={id} />;
}