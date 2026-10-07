import { Metadata } from "next";
import PatientDashboardClient from "@/components/patient/PatientDashboardClient";
import QRScannerBtn from "@/components/patient/QRScannerBtn";
import { siteConfig } from "@/config/site";
import { QrCode } from "lucide-react"

export const metadata: Metadata = {
    title: `Patient Dashboard | ${siteConfig.name}`,
    description: "View your active consultations, upcoming follow-ups, and health statistics.",
};

export default function PatientDashboardPage() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <PatientDashboardClient />

            <section className="mt-6 flex flex-col items-start justify-between gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                        <QrCode />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-foreground sm:text-base">
                            Visiting a hospital?
                        </h2>
                        <p className="mt-1 max-w-xl text-xs leading-5 text-muted sm:text-sm">
                            Scan the hospital QR code to securely prefill your available information.
                        </p>
                    </div>
                </div>

                <QRScannerBtn className="w-full shrink-0 sm:w-auto" />
            </section>
        </div>
    );
}