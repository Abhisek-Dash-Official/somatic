import type { Metadata } from "next";
import Profile from "@/components/profile/Profile";

export const metadata: Metadata = {
    title: "Dispatcher Profile | Somatic",
    description: "Manage your dispatcher profile, personal information, and account security.",
};

export default function DispatcherProfilePage() {
    return <Profile />;
}