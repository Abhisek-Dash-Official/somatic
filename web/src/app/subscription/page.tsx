import type { Metadata } from "next";
import SubscriptionPage from "@/components/subscription/SubscriptionPage";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
    title: "Subscription",
    description:
        "Choose a SOMATIC subscription plan or manage your current healthcare subscription.",
};

export default function Page() {
    return <>
        <Header />
        <SubscriptionPage />;
        <Footer />
    </>
}