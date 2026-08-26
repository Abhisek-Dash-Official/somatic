import { Metadata } from "next";
import PatientDashboardClient from "@/components/client/PatientDashboardClient";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `Patient Dashboard | ${siteConfig.name}`,
    description: "View your active consultations, upcoming follow-ups, and health statistics.",
};

export default function PatientDashboardPage() {
    return <PatientDashboardClient />;
}