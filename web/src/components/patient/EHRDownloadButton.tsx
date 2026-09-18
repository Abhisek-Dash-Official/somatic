"use client";

import { Download } from "lucide-react";

export default function EHRDownloadButton({ consultation }: { consultation: any }) {
    const handleDownload = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert("Please allow popups to download the EHR.");
            return;
        }

        const patientName = consultation.patient_id?.username || "Patient";
        const doctorName = consultation.claimed_by_doctor_id?.username || "Assigned Doctor";
        const deptName = consultation.assigned_department_id?.name || "General";
        const isEmergency = consultation.ai_draft?.is_emergency;

        const meds = consultation.doctor_final_prescription?.medicines?.map((m: string) => `<li>${m}</li>`).join("") || "<li>No medicines prescribed.</li>";

        const instructionsTranslated = consultation.doctor_final_prescription?.translated_instructions;
        const instructionsEng = consultation.doctor_final_prescription?.instructions;

        const summaryTranslated = consultation.ai_draft?.translated_ai_summary_and_advice;
        const summaryEng = consultation.ai_draft?.ai_summary_and_advice;

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>EHR - ${patientName}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 20px; line-height: 1.6; max-width: 800px; margin: auto; }
                    .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
                    .header h1 { color: #1e3a8a; margin: 0; font-size: 22px; font-weight: bold; }
                    .header p { margin: 5px 0 0; color: #64748b; font-size: 13px; }
                    .emergency-banner { background-color: #fef2f2; color: #dc2626; border: 1px solid #f87171; padding: 10px; text-align: center; font-weight: bold; margin-bottom: 20px; border-radius: 6px; font-size: 14px; }
                    .info-grid { display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                    .info-group p { margin: 5px 0; font-size: 14px; }
                    .info-group strong { color: #334155; display: inline-block; min-width: 130px; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-size: 16px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold; }
                    ul { padding-left: 20px; margin-top: 0; font-size: 14px; }
                    li { margin-bottom: 5px; }
                    .dual-lang { margin-bottom: 15px; }
                    .lang-primary { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
                    .lang-secondary { font-size: 13px; color: #64748b; font-style: italic; }
                    .footer { text-align: center; margin-top: 40px; padding-top: 15px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #94a3b8; }
                    
                    /* Desktop styling */
                    @media (min-width: 600px) {
                        body { padding: 40px; }
                        .header h1 { font-size: 28px; }
                        .header p { font-size: 15px; }
                        .info-grid { flex-direction: row; justify-content: space-between; gap: 30px; padding: 20px; }
                        .section-title { font-size: 18px; }
                        .info-group p { font-size: 15px; }
                        ul { font-size: 15px; }
                    }
                    
                    /* Print styling */
                    @media print { 
                        body { padding: 0; }
                        .info-grid { border: none; background: transparent; padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>SOMATIC DIGITAL HEALTH</h1>
                    <p>Official Electronic Health Record (EHR)</p>
                </div>

                ${isEmergency ? '<div class="emergency-banner">EMERGENCY CASE - IMMEDIATE ATTENTION REQUIRED</div>' : ''}

                <div class="info-grid">
                    <div class="info-group">
                        <p><strong>Patient Name:</strong> ${patientName}</p>
                        <p><strong>Age/Weight:</strong> ${consultation.patient_input?.age || 'N/A'} Yrs / ${consultation.patient_input?.weight_kg || 'N/A'} kg</p>
                        <p><strong>Date:</strong> ${new Date(consultation.resolved_at || consultation.created_at).toLocaleString()}</p>
                    </div>
                    <div class="info-group">
                        <p><strong>Consulting Doctor:</strong> Dr. ${doctorName}</p>
                        <p><strong>Department:</strong> ${deptName}</p>
                        <p><strong>Case ID:</strong> ${consultation._id}</p>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Chief Complaints</h2>
                    <p style="font-size: 14px; margin: 0;">${consultation.ai_draft?.chief_complaints?.join(", ") || consultation.patient_input?.symptoms_raw_text}</p>
                </div>

                <div class="section">
                    <h2 class="section-title">Prescribed Medicines</h2>
                    <ul>${meds}</ul>
                </div>

                <div class="section">
                    <h2 class="section-title">Instructions & Diet</h2>
                    <div class="dual-lang">
                        ${instructionsTranslated ? `<div class="lang-primary">${instructionsTranslated}</div>` : ''}
                        <div class="lang-secondary">(English: ${instructionsEng || "No specific instructions."})</div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Diagnosis Summary</h2>
                    <div class="dual-lang">
                        ${summaryTranslated ? `<div class="lang-primary">${summaryTranslated}</div>` : ''}
                        <div class="lang-secondary">(English: ${summaryEng || "No summary provided."})</div>
                    </div>
                </div>

                <div class="footer">
                    <p>This is a digitally generated Electronic Health Record. Verified by Dr. ${doctorName}.</p>
                    <p>Generated on ${new Date().toLocaleString()}</p>
                </div>
                <script>
                    window.onload = () => { window.print(); };
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
            className="flex items-center justify-center w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-lg text-sm sm:text-base"
        >
            <Download className="w-4 h-4" /> Download EHR
        </button>
    );
}