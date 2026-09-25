import type { Metadata } from "next";
import Profile from "@/components/profile/Profile";

export const metadata: Metadata = {
    title: "My Profile | Somatic",
    description: "Manage your personal information, medical profile, and account security.",
};

export default function ProfilePage() {
    return <Profile />;
}