export function exportConsultationsToCSV(
  cases: any[],
  filenamePrefix = "Consultations_Export",
) {
  if (!cases || cases.length === 0) return;

  const headers = [
    "Consultation ID",
    "Created Date",
    "Status",
    "Is Emergency",
    "Department Name",
    "Patient ID",
    "Patient Username",
    "Patient Age",
    "Patient Weight (kg)",
    "Preferred Language",
    "Claimed Doctor ID",
    "Claimed Doctor Username",
    "Chief Complaints",
    "AI Summary and Advice",
    "Ayurvedic Hints",
    "Prescribed Medicines",
    "Doctor Instructions",
    "Resolved Date",
  ];

  const csvRows = [headers.join(",")];

  cases.forEach((c) => {
    const id = c._id || "";
    const date = c.created_at
      ? new Date(c.created_at).toISOString().split("T")[0]
      : "";
    const status = c.status ? c.status.replace("_", " ").toUpperCase() : "";
    const emergency = c.ai_draft?.is_emergency ? "YES" : "NO";

    const deptName =
      typeof c.assigned_department_id === "object" &&
      c.assigned_department_id !== null
        ? c.assigned_department_id.name
        : c.assigned_department_name || "";

    const patientId =
      typeof c.patient_id === "object"
        ? c.patient_id?._id || ""
        : c.patient_id || "";
    const patientName =
      typeof c.patient_id === "object" ? c.patient_id?.username || "" : "";
    const age = c.patient_input?.age ?? "";
    const weight = c.patient_input?.weight_kg ?? "";
    const lang = c.patient_input?.preferred_prescription_language || "";

    const docId =
      typeof c.claimed_by_doctor_id === "object"
        ? c.claimed_by_doctor_id?._id || ""
        : c.claimed_by_doctor_id || "";
    const docName =
      typeof c.claimed_by_doctor_id === "object"
        ? c.claimed_by_doctor_id?.username || ""
        : "";

    const chiefComplaints = `"${(c.ai_draft?.chief_complaints || []).join("; ").replace(/"/g, '""')}"`;
    const summary = `"${(c.ai_draft?.ai_summary_and_advice || "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
    const ayurvedicHints = `"${(c.ai_draft?.ayurvedic_hints || "").replace(/"/g, '""').replace(/\n/g, " ")}"`;

    const medicines = `"${(c.doctor_final_prescription?.medicines || []).join("; ").replace(/"/g, '""')}"`;
    const instructions = `"${(c.doctor_final_prescription?.instructions || "").replace(/"/g, '""').replace(/\n/g, " ")}"`;

    const resolvedAt = c.resolved_at
      ? new Date(c.resolved_at).toISOString().split("T")[0]
      : "";

    const row = [
      id,
      date,
      status,
      emergency,
      `"${deptName}"`,
      patientId,
      `"${patientName}"`,
      age,
      weight,
      `"${lang}"`,
      docId,
      `"${docName}"`,
      chiefComplaints,
      summary,
      ayurvedicHints,
      medicines,
      instructions,
      resolvedAt,
    ];

    csvRows.push(row.join(","));
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${filenamePrefix}_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
