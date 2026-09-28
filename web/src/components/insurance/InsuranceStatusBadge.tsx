"use client";

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
        label: "Pending Review",
        className: "bg-warning/10 text-warning border-warning/20",
    },
    approved: {
        label: "Approved",
        className: "bg-primary/10 text-primary border-primary/20",
    },
    payment_pending: {
        label: "Payment Pending",
        className: "bg-warning/10 text-warning border-warning/20",
    },
    active: {
        label: "Active",
        className: "bg-success/10 text-success border-success/20",
    },
    rejected: {
        label: "Rejected",
        className: "bg-danger/10 text-danger border-danger/20",
    },
    expired: {
        label: "Expired",
        className: "bg-surface-secondary text-muted border-border",
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-danger/10 text-danger border-danger/20",
    },
    draft: {
        label: "Draft",
        className: "bg-surface-secondary text-muted border-border",
    },
    submitted: {
        label: "Submitted",
        className: "bg-primary/10 text-primary border-primary/20",
    },
    under_review: {
        label: "Under Review",
        className: "bg-warning/10 text-warning border-warning/20",
    },
    documents_required: {
        label: "Documents Required",
        className: "bg-info/10 text-info border-info/20",
    },
    partially_approved: {
        label: "Partially Approved",
        className: "bg-primary/10 text-primary border-primary/20",
    },
    settled: {
        label: "Settled",
        className: "bg-success/10 text-success border-success/20",
    },
};

export default function InsuranceStatusBadge({ status }: { status: string }) {
    const config = statusConfig[status] || {
        label: status.replaceAll("_", " "),
        className: "bg-surface-secondary text-muted border-border",
    };

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}