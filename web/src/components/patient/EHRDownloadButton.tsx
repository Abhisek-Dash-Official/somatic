"use client";

import { Download } from "lucide-react";
import { siteConfig } from "@/config/site";

// Escape user-generated text so it can't break (or inject into) the print HTML
const esc = (value: unknown): string =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

export default function EHRDownloadButton({ consultation }: { consultation: any }) {
    const handleDownload = () => {
        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            alert("Please allow popups to download the EHR.");
            return;
        }

        // The print window is about:blank, so relative logo paths must be made absolute
        const rawLogo: any = siteConfig.logo;
        const logoPath: string = typeof rawLogo === "string" ? rawLogo : rawLogo?.src || "";
        const logoUrl = logoPath ? new URL(logoPath, window.location.origin).href : "";

        const patientName = esc(consultation.patient_id?.username || "Patient");
        const doctorName = esc(consultation.claimed_by_doctor_id?.username || "Assigned Doctor");
        const deptName = esc(consultation.assigned_department_id?.name || "General");
        const isEmergency = consultation.ai_draft?.is_emergency;

        const age = esc(consultation.patient_input?.age || "N/A");
        const weight = esc(consultation.patient_input?.weight_kg || "N/A");
        const caseId = esc(consultation._id);

        const recordDate = new Date(consultation.resolved_at || consultation.created_at);
        const dateStr = recordDate.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
        const timeStr = recordDate.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });

        const medsList: string[] = consultation.doctor_final_prescription?.medicines || [];
        const meds = medsList.length
            ? medsList
                .map(
                    (m: string, i: number) =>
                        `<li><span class="med-index">${i + 1}</span><span class="med-name">${esc(m)}</span></li>`
                )
                .join("")
            : `<li class="med-empty">No medicines prescribed.</li>`;

        const instructionsTranslated = consultation.doctor_final_prescription?.translated_instructions;
        const instructionsEng = consultation.doctor_final_prescription?.instructions;
        const summaryTranslated = consultation.ai_draft?.translated_ai_summary_and_advice;
        const summaryEng = consultation.ai_draft?.ai_summary_and_advice;

        const complaints = esc(
            consultation.ai_draft?.chief_complaints?.join(", ") ||
            consultation.patient_input?.symptoms_raw_text ||
            "Not specified"
        );

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EHR - ${patientName}</title>
    <style>
        @page { size: A4; margin: 14mm; }

        :root {
            --primary: #047857;
            --primary-dark: #065f46;
            --primary-soft: #ecfdf5;
            --ink: #17231c;
            --muted: #63756b;
            --faint: #87968e;
            --line: #d6e1da;
            --bg-soft: #f5f8f6;
        }

        * { box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: var(--ink);
            margin: 0;
            padding: 24px;
            line-height: 1.55;
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

        /* Faint watermark */
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 380px;
            transform: translate(-50%, -50%);
            opacity: 0.04;
            pointer-events: none;
            z-index: 0;
        }

        .content { position: relative; z-index: 1; }

        /* Header */
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--primary);
        }

        .brand { display: flex; align-items: center; gap: 14px; }

        .brand img { height: 56px; width: auto; max-width: 160px; object-fit: contain; }

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

        .record-meta { text-align: right; }

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

        .record-meta p { margin: 6px 0 0; font-size: 12px; color: var(--muted); }
        .record-meta strong { color: var(--ink); }

        /* Emergency */
        .emergency-banner {
            margin-top: 16px;
            background: #fef2f2;
            color: #b91c1c;
            border: 1px solid #f87171;
            border-left: 5px solid #dc2626;
            padding: 9px 14px;
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 0.5px;
            border-radius: 6px;
        }

        /* Patient / consultation info */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            margin-top: 18px;
            border: 1px solid var(--line);
            border-radius: 8px;
            overflow: hidden;
            background: var(--bg-soft);
        }

        .info-cell { padding: 10px 16px; border-bottom: 1px solid var(--line); }
        .info-cell:nth-child(odd) { border-right: 1px solid var(--line); }
        .info-cell:nth-last-child(-n+2) { border-bottom: none; }

        .info-label {
            display: block;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--faint);
            font-weight: 700;
        }

        .info-value { font-size: 14px; font-weight: 600; word-break: break-word; }

        /* Sections */
        .section { margin-top: 22px; page-break-inside: avoid; }

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

        .complaints {
            margin: 0;
            font-size: 14px;
            background: var(--primary-soft);
            border: 1px solid #a7f3d0;
            border-radius: 8px;
            padding: 10px 14px;
        }

        /* Prescription */
        .rx-box {
            border: 1px solid var(--line);
            border-radius: 8px;
            padding: 14px 16px 10px 64px;
            position: relative;
        }

        .rx-symbol {
            position: absolute;
            left: 14px;
            top: 10px;
            font-size: 30px;
            font-weight: 800;
            font-style: italic;
            color: var(--primary);
            font-family: Georgia, 'Times New Roman', serif;
            letter-spacing: -1px;
        }

        .med-list { list-style: none; margin: 0; padding: 0; }

        .med-list li {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 7px 0;
            border-bottom: 1px dashed var(--line);
            font-size: 14px;
        }

        .med-list li:last-child { border-bottom: none; }

        .med-index {
            flex: none;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: var(--primary);
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .med-name { font-weight: 600; }
        .med-empty { color: var(--muted); font-style: italic; }

        /* Dual-language blocks */
        .dual-lang {
            border: 1px solid var(--line);
            border-radius: 8px;
            padding: 12px 16px;
            background: #fff;
        }

        .lang-primary {
            font-size: 15px;
            font-weight: 600;
            color: var(--ink);
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px dashed var(--line);
            white-space: pre-line;
        }

        .lang-secondary {
            font-size: 13px;
            color: var(--muted);
            white-space: pre-line;
        }

        .lang-secondary b {
            color: var(--primary-dark);
            font-style: normal;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        /* Signature */
        .signature-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 34px;
            gap: 20px;
        }

        .verified {
            font-size: 11px;
            color: var(--muted);
            max-width: 340px;
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

        .signature { text-align: center; min-width: 200px; }
        .signature .line { border-top: 1.5px solid var(--ink); margin-bottom: 4px; }
        .signature .name { font-size: 14px; font-weight: 700; }
        .signature .role { font-size: 11px; color: var(--muted); }

        /* Footer */
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
            body { padding: 10px; }
            .page { padding: 18px 16px; }
            .header { flex-direction: column; align-items: flex-start; }
            .record-meta { text-align: left; }
            .info-grid { grid-template-columns: 1fr; }
            .info-cell:nth-child(odd) { border-right: none; }
            .info-cell:nth-last-child(2) { border-bottom: 1px solid var(--line); }
            .signature-row { flex-direction: column; align-items: flex-start; }
            .footer { flex-direction: column; }
        }

        @media print {
            body { padding: 0; }
            .page { border: none; border-top: 6px solid var(--primary); border-radius: 0; padding: 18px 4px 0; }
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
                    <p>Date: <strong>${dateStr}</strong> &nbsp;|&nbsp; Time: <strong>${timeStr}</strong></p>
                </div>
            </div>

            ${isEmergency
                ? '<div class="emergency-banner">&#9888; EMERGENCY CASE &mdash; IMMEDIATE ATTENTION REQUIRED</div>'
                : ""}

            <div class="info-grid">
                <div class="info-cell">
                    <span class="info-label">Patient Name</span>
                    <span class="info-value">${patientName}</span>
                </div>
                <div class="info-cell">
                    <span class="info-label">Consulting Doctor</span>
                    <span class="info-value">Dr. ${doctorName}</span>
                </div>
                <div class="info-cell">
                    <span class="info-label">Age / Weight</span>
                    <span class="info-value">${age} Yrs / ${weight} kg</span>
                </div>
                <div class="info-cell">
                    <span class="info-label">Department</span>
                    <span class="info-value">${deptName}</span>
                </div>
                <div class="info-cell">
                    <span class="info-label">Case ID</span>
                    <span class="info-value">${caseId}</span>
                </div>
                <div class="info-cell">
                    <span class="info-label">Record Date</span>
                    <span class="info-value">${dateStr}</span>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Chief Complaints</h2>
                <p class="complaints">${complaints}</p>
            </div>

            <div class="section">
                <h2 class="section-title">Prescribed Medicines</h2>
                <div class="rx-box">
                    <span class="rx-symbol">Rx</span>
                    <ul class="med-list">${meds}</ul>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Instructions &amp; Diet</h2>
                <div class="dual-lang">
                    ${instructionsTranslated
                ? `<div class="lang-primary">${esc(instructionsTranslated)}</div>`
                : ""}
                    <div class="lang-secondary"><b>English:</b> ${esc(instructionsEng || "No specific instructions.")}</div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Diagnosis Summary</h2>
                <div class="dual-lang">
                    ${summaryTranslated
                ? `<div class="lang-primary">${esc(summaryTranslated)}</div>`
                : ""}
                    <div class="lang-secondary"><b>English:</b> ${esc(summaryEng || "No summary provided.")}</div>
                </div>
            </div>

            <div class="signature-row">
                <div class="verified">
                    <span class="badge">&#10003; Verified</span><br />
                    This is a digitally generated Electronic Health Record, verified by Dr. ${doctorName}.
                </div>
                <div class="signature">
                    <div class="line"></div>
                    <div class="name">Dr. ${doctorName}</div>
                    <div class="role">${deptName} Department</div>
                </div>
            </div>

            <div class="footer">
                <span>Somatic Digital Health &bull; Confidential medical record</span>
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

        (printWindow.document as any).write(html);
        printWindow.document.close();
    };

    return (
        <button
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover sm:w-auto sm:text-base"
        >
            <Download className="h-4 w-4" />
            Download EHR
        </button>
    );
}