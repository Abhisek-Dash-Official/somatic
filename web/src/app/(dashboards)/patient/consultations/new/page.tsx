import { Metadata } from "next";
import NewConsultationForm from "@/components/patient/NewConsultationForm";

export const metadata: Metadata = {
    title: "New Consultation | Somatic AI",
};

export default function NewConsultationPage() {
    return (
        <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-border bg-surface p-6">
            <h1 className="mb-3 text-3xl font-bold text-foreground">
                New AI Consultation
            </h1>

            <p className="mb-8 text-muted">
                Describe your symptoms to get an instant AI preliminary analysis and triage.
            </p>

            <NewConsultationForm />
        </div>
    );
}