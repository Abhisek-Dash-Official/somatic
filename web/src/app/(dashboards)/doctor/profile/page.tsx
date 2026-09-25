import type { Metadata } from "next";
import Profile from "@/components/profile/Profile";

export const metadata: Metadata = {
    title: "Doctor Profile | Somatic",
    description: "Manage your doctor profile, professional information, and account security.",
};

export default function DoctorProfilePage() {
    return <Profile />;
}