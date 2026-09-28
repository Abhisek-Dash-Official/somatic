import type { Metadata } from "next";
import AdminInsurance from "@/components/admin/AdminInsurance";

export const metadata: Metadata = {
    title: "Insurance Management | SOMATIC",
    description: "Manage insurance policies, claims and plans.",
};

export default function AdminInsurancePage() {
    return <AdminInsurance />;
}