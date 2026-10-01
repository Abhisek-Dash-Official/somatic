import type { Metadata } from "next";
import SubscriptionPage from "@/components/subscription/SubscriptionPage";

export const metadata: Metadata = {
    title: "Subscription",
    description:
        "Choose a SOMATIC subscription plan or manage your current healthcare subscription.",
};

export default function Page() {
    return <SubscriptionPage />;
}