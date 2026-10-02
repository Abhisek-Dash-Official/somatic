"use client";

import { Download } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { ILabBookingDocument } from "@/models/LabBooking";
import { toast } from "react-toastify";

const esc = (value: unknown): string =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

type LabEHRDownloadButtonProps = {
    booking: ILabBookingDocument;
};

export default function LabEHRDownloadButton({ booking }: LabEHRDownloadButtonProps) {
    const handleDownload = () => {
        if (!booking.results?.length) {
            toast.error("Lab results are not available yet.");
            return;
        }

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            toast.error("Please allow popups to download the EHR.");
            return;
        }

        const rawLogo: any = siteConfig.logo;
        const logoPath: string = typeof rawLogo === "string" ? rawLogo : rawLogo?.src || "";
        const logoUrl = logoPath ? new URL(logoPath, window.location.origin).href : "";

        const patient = booking.patient_id as any;

        const patientName = esc(patient?.username || "Patient");
        const patientEmail = esc(patient?.email || "N/A");
        const patientContact = esc(patient?.contact_no || "N/A");

        const bookingNumber = esc(booking.booking_number);
        const recordId = esc(booking._id);

        const collectionDate = booking.sample_collected_at
            ? new Date(booking.sample_collected_at).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            : "N/A";

        const reportDate = booking.report_ready_at
            ? new Date(booking.report_ready_at).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            : new Date().toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });

        const reportTime = booking.report_ready_at
            ? new Date(booking.report_ready_at).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
            })
            : "";

        const abnormalResults = booking.results.flatMap((result) =>
            result.parameters.filter((parameter) => parameter.status !== "normal"),
        );

        const summaryHtml = abnormalResults.length
            ? `
                <div class="notice abnormal">
                    <strong>Attention:</strong> ${abnormalResults.length} result${abnormalResults.length === 1 ? "" : "s"} ${abnormalResults.length === 1 ? "is" : "are"
            } marked outside the normal range. Please discuss the results with a qualified healthcare professional.
                </div>
            `
            : `
                <div class="notice normal">
                    All recorded laboratory parameters are marked as normal.
                </div>
            `;

        const testsHtml = booking.results
            .map(
                (result) => `
                    <div class="test-section">
                        <div class="test-header">
                            <h3>${esc(result.test_name)}</h3>
                            <p>Laboratory Test</p>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Result</th>
                                    <th>Unit</th>
                                    <th>Reference Range</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                ${result.parameters
                        .map(
                            (parameter) => `
                                            <tr>
                                                <td class="parameter">${esc(parameter.name)}</td>
                                                <td class="value">${esc(parameter.value)}</td>
                                                <td>${esc(parameter.unit)}</td>
                                                <td>${esc(parameter.reference_range)}</td>
                                                <td>
                                                    <span class="status status-${esc(parameter.status)}">
                                                        ${esc(parameter.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        `,
                        )
                        .join("")}
                            </tbody>
                        </table>
                    </div>
                `,
            )
            .join("");

        const notesHtml = booking.notes
            ? `
                <div class="section">
                    <h2 class="section-title">Laboratory Notes</h2>
                    <div class="notes">${esc(booking.notes)}</div>
                </div>
            `
            : "";

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab EHR - ${patientName}</title>

    <style>
        @page {
            size: A4;
            margin: 14mm;
        }

        :root {
            --primary: #047857;
            --primary-dark: #065f46;
            --ink: #17231c;
            --muted: #63756b;
            --faint: #87968e;
            --line: #d6e1da;
            --bg-soft: #f5f8f6;
            --danger: #b91c1c;
            --danger-soft: #fef2f2;
            --warning: #b45309;
            --warning-soft: #fffbeb;
            --success: #15803d;
            --success-soft: #f0fdf4;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: var(--ink);
            margin: 0;
            padding: 24px;
            line-height: 1.5;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .page {
            max-width: 800px;
            margin: auto;
            position: relative;
            border: 1px solid var(--line);
            border-top: 6px solid var(--primary);
            border-radius: 10px;
            padding: 28px 32px 20px;
            overflow: hidden;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 380px;
            transform: translate(-50%, -50%);
            opacity: 0.04;
            pointer-events: none;
        }

        .content {
            position: relative;
            z-index: 1;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--primary);
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .brand img {
            height: 56px;
            width: auto;
            max-width: 160px;
            object-fit: contain;
        }

        .brand-text h1 {
            margin: 0;
            font-size: 22px;
            letter-spacing: 1px;
            color: var(--primary-dark);
            font-weight: 800;
        }

        .brand-text p {
            margin: 2px 0 0;
            font-size: 11px;
            color: var(--muted);
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }

        .record-meta {
            text-align: right;
        }

        .record-tag {
            display: inline-block;
            background: var(--primary);
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            padding: 4px 10px;
            border-radius: 4px;
        }

        .record-meta p {
            margin: 6px 0 0;
            font-size: 12px;
            color: var(--muted);
        }

        .record-meta strong {
            color: var(--ink);
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-top: 18px;
            border: 1px solid var(--line);
            border-radius: 8px;
            overflow: hidden;
            background: var(--bg-soft);
        }

        .info-cell {
            padding: 10px 16px;
            border-bottom: 1px solid var(--line);
        }

        .info-cell:nth-child(odd) {
            border-right: 1px solid var(--line);
        }

        .info-cell:nth-last-child(-n+2) {
            border-bottom: none;
        }

        .info-label {
            display: block;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--faint);
            font-weight: 700;
        }

        .info-value {
            font-size: 14px;
            font-weight: 600;
            word-break: break-word;
        }

        .section {
            margin-top: 22px;
            page-break-inside: avoid;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 0 0 10px;
            font-size: 13px;
            font-weight: 800;
            color: var(--primary-dark);
            text-transform: uppercase;
            letter-spacing: 1.2px;
        }

        .section-title::before {
            content: "";
            width: 4px;
            height: 16px;
            background: var(--primary);
            border-radius: 2px;
        }

        .section-title::after {
            content: "";
            flex: 1;
            height: 1px;
            background: var(--line);
        }

        .notice {
            padding: 10px 14px;
            border: 1px solid;
            border-radius: 7px;
            font-size: 13px;
        }

        .notice.normal {
            background: var(--success-soft);
            border-color: #bbf7d0;
            color: var(--success);
        }

        .notice.abnormal {
            background: var(--warning-soft);
            border-color: #fde68a;
            color: var(--warning);
        }

        .test-section {
            margin-top: 18px;
            border: 1px solid var(--line);
            border-radius: 8px;
            overflow: hidden;
            page-break-inside: avoid;
        }

        .test-header {
            padding: 12px 16px;
            background: var(--bg-soft);
            border-bottom: 1px solid var(--line);
        }

        .test-header h3 {
            margin: 0;
            font-size: 14px;
            color: var(--primary-dark);
        }

        .test-header p {
            margin: 3px 0 0;
            font-size: 10px;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11.5px;
        }

        th {
            padding: 9px 10px;
            text-align: left;
            background: #f8faf9;
            color: var(--muted);
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            border-bottom: 1px solid var(--line);
        }

        td {
            padding: 9px 10px;
            border-bottom: 1px solid var(--line);
            vertical-align: middle;
        }

        tr:last-child td {
            border-bottom: none;
        }

        .parameter {
            font-weight: 600;
        }

        .value {
            font-weight: 700;
        }

        .status {
            display: inline-block;
            padding: 3px 7px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-normal {
            background: var(--success-soft);
            color: var(--success);
        }

        .status-high,
        .status-low,
        .status-abnormal {
            background: var(--warning-soft);
            color: var(--warning);
        }

        .status-critical {
            background: var(--danger-soft);
            color: var(--danger);
        }

        .notes {
            padding: 12px 14px;
            border: 1px solid var(--line);
            border-radius: 8px;
            background: var(--bg-soft);
            font-size: 13px;
            white-space: pre-line;
        }

        .signature-row {
            margin-top: 34px;
        }

        .verified {
            font-size: 11px;
            color: var(--muted);
            max-width: 450px;
        }

        .verified .badge {
            display: inline-block;
            border: 1.5px solid var(--primary);
            color: var(--primary);
            font-weight: 800;
            letter-spacing: 1.5px;
            font-size: 11px;
            padding: 3px 10px;
            border-radius: 4px;
            margin-bottom: 6px;
            text-transform: uppercase;
        }

        .footer {
            margin-top: 22px;
            padding-top: 10px;
            border-top: 1px solid var(--line);
            display: flex;
            justify-content: space-between;
            gap: 12px;
            font-size: 10.5px;
            color: var(--faint);
        }

        @media (max-width: 600px) {
            body {
                padding: 10px;
            }

            .page {
                padding: 18px 16px;
            }

            .header {
                flex-direction: column;
                align-items: flex-start;
            }

            .record-meta {
                text-align: left;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }

            .info-cell:nth-child(odd) {
                border-right: none;
            }

            .info-cell:nth-last-child(2) {
                border-bottom: 1px solid var(--line);
            }

            .footer {
                flex-direction: column;
            }

            table {
                font-size: 9px;
            }

            th,
            td {
                padding: 7px 5px;
            }
        }

        @media print {
            body {
                padding: 0;
            }

            .page {
                border: none;
                border-top: 6px solid var(--primary);
                border-radius: 0;
                padding: 18px 4px 0;
            }
        }
    </style>
</head>

<body>
    <div class="page">
        ${logoUrl ? `<img class="watermark" src="${esc(logoUrl)}" alt="" />` : ""}

        <div class="content">
            <div class="header">
                <div class="brand">
                    ${logoUrl ? `<img src="${esc(logoUrl)}" alt="Somatic logo" />` : ""}
                    <div class="brand-text">
                        <h1>SOMATIC</h1>
                        <p>Digital Health</p>
                    </div>
                </div>

                <div class="record-meta">
                    <span class="record-tag">Electronic Health Record</span>
                    <p>
                        Date: <strong>${esc(reportDate)}</strong>
                        ${reportTime ? `&nbsp;|&nbsp; Time: <strong>${esc(reportTime)}</strong>` : ""}
                    </p>
                </div>
            </div>

            <div class="info-grid">
                <div class="info-cell">
                    <span class="info-label">Patient Name</span>
                    <span class="info-value">${patientName}</span>
                </div>

                <div class="info-cell">
                    <span class="info-label">Booking Number</span>
                    <span class="info-value">${bookingNumber}</span>
                </div>

                <div class="info-cell">
                    <span class="info-label">Contact</span>
                    <span class="info-value">${patientContact}</span>
                </div>

                <div class="info-cell">
                    <span class="info-label">Email</span>
                    <span class="info-value">${patientEmail}</span>
                </div>

                <div class="info-cell">
                    <span class="info-label">Sample Collected</span>
                    <span class="info-value">${esc(collectionDate)}</span>
                </div>

                <div class="info-cell">
                    <span class="info-label">Record ID</span>
                    <span class="info-value">${recordId}</span>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Laboratory Results</h2>
                ${summaryHtml}
                ${testsHtml}
            </div>

            ${notesHtml}

            <div class="signature-row">
                <div class="verified">
                    <span class="badge">&#10003; Verified</span><br />
                    This is a digitally generated Electronic Health Record containing laboratory test results recorded through SOMATIC.
                </div>
            </div>

            <div class="footer">
                <span>SOMATIC Digital Health &bull; Confidential medical record</span>
                <span>Generated on ${esc(new Date().toLocaleString())}</span>
            </div>
        </div>
    </div>

    <script>
        window.onload = () => {
            window.print();
        };
    </script>
</body>
</html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
        >
            <Download className="h-4 w-4" />
            Download EHR
        </button>
    );
}