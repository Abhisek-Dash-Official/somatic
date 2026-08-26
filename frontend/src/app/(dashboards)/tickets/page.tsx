import { Metadata } from "next";
import TicketsClient from "@/components/client/TicketsClient";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `My Support Tickets | ${siteConfig.name}`,
    description: "Track and manage your support tickets and feedback.",
};

export default function TicketsPage() {
    return <TicketsClient />;
}