import { Metadata } from "next";
import ContactClient from "@/components/contact/ContactClient";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `Contact Us & Support | ${siteConfig.name}`,
    description: "Get in touch with the Somatic team. Submit feedback, request support, or report technical issues.",
};

export default function ContactPage() {
    return <ContactClient />;
}