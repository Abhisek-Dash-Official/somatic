"use client";

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending Review", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    approved: { label: "Approved", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    payment_pending: { label: "Payment Pending", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    active: { label: "Active", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    rejected: { label: "Rejected", className: "bg-red-500/10 text-red-400 border-red-500/20" },
    expired: { label: "Expired", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
    cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-400 border-red-500/20" },
    draft: { label: "Draft", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
    submitted: { label: "Submitted", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    under_review: { label: "Under Review", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    documents_required: { label: "Documents Required", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    partially_approved: { label: "Partially Approved", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    settled: { label: "Settled", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

export default function InsuranceStatusBadge({ status }: { status: string }) {
    const config = statusConfig[status] || {
        label: status.replaceAll("_", " "),
        className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };

    return (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
}