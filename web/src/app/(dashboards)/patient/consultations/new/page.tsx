import { Metadata } from "next";
import NewConsultationForm from "@/components/patient/NewConsultationForm";

export const metadata: Metadata = {
    title: "New Consultation | Somatic AI",
};

export default function NewConsultationPage() {
    return (
        <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                    <div className="mb-3 inline-flex items-center rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-semibold text-primary">
                        AI Healthcare
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        New AI Consultation
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                        Describe your symptoms and provide a few details so Somatic AI can
                        prepare a preliminary analysis and triage.
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7 lg:p-8">
                    <NewConsultationForm />
                </div>

                <div className="mt-4 rounded-xl border border-border bg-surface-secondary p-4 text-xs leading-5 text-muted">
                    <strong className="text-foreground">Important:</strong> AI-generated
                    results are preliminary and should not replace professional medical
                    advice. Emergency symptoms require immediate medical attention.
                </div>
            </div>
        </main>
    );
}