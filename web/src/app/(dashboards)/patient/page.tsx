import { Metadata } from "next";
import PatientDashboardClient from "@/components/patient/PatientDashboardClient";
import { siteConfig } from "@/config/site";
import QRScannerBtn from "@/components/patient/QRScannerBtn";

export const metadata: Metadata = {
    title: `Patient Dashboard | ${siteConfig.name}`,
    description: "View your active consultations, upcoming follow-ups, and health statistics.",
};

export default function PatientDashboardPage() {
    return (
        <>
            <PatientDashboardClient />

            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 sm:flex-row">
                <div>
                    <h3 className="font-semibold text-foreground">
                        Visiting a Hospital?
                    </h3>

                    <p className="mt-1 text-sm text-muted">
                        Scan the hospital QR code to prefill your available information.
                    </p>
                </div>

                <QRScannerBtn className="w-full sm:w-auto" />
            </div>
        </>
    );
}