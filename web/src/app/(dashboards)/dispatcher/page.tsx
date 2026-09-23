import type { Metadata } from "next";
import DispatcherDashboard from "@/components/dispatcher/DispatcherDashboard";

export const metadata: Metadata = {
    title: "Dispatcher Dashboard | SOMATIC",
    description: "Monitor ambulance requests and emergency coordination.",
};

export default function DispatcherPage() {
    return <DispatcherDashboard />;
}