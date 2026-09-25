import type { Metadata } from "next";
import Profile from "@/components/profile/Profile";

export const metadata: Metadata = {
    title: "Administrator Profile | Somatic",
    description: "Manage your administrator profile, personal information, and account security.",
};

export default function AdminProfilePage() {
    return <Profile />;
}