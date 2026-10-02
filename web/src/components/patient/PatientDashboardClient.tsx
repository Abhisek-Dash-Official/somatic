"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import { AlertCircle, ArrowRight, Calendar, CheckCircle2, Clock3, FileSearch, FlaskConical, HeartPulse, Loader2, MessageSquare, Package, Plus, ShieldCheck, ShoppingBag, Sparkles, Stethoscope } from "lucide-react";

interface DashboardData {
    consultations: any[];
    feedbacks: any[];
    labs: any[];
    orders: any[];
    stats: {
        total: number;
        active: number;
        completed: number;
        activeLabs: number;
        activeOrders: number;
    };
    nextFollowUp: string | null;
}

export default function PatientDashboard() {
    const { user, isLoading: userLoading, isFetched } = useUserStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("/api/patient/dashboard", { cache: "no-store" });

                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (isFetched && user) {
            fetchDashboardData();
            const interval = setInterval(fetchDashboardData, 30000);
            return () => clearInterval(interval);
        }
    }, [isFetched, user]);

    if (userLoading || !isFetched || loading) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending_review: "Pending Review",
            in_review: "In Review",
            completed: "Completed",
            booked: "Booked",
            collection_scheduled: "Collection Scheduled",
            sample_collected: "Sample Collected",
            processing: "Processing",
            report_ready: "Report Ready",
        };

        return labels[status] || status.replaceAll("_", " ");
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <section className="border border-border bg-surface">
                <div className="flex flex-col justify-between gap-6 p-5 sm:p-7 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-primary/20 bg-primary/10">
                            <img
                                src={`/avatars/avatar-${user?.avatar_id || "0"}.png`}
                                alt="Patient Avatar"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/avatars/avatar-1.png";
                                }}
                            />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted">Patient Portal</p>
                            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Hi, {user?.username}
                            </h1>
                            <p className="mt-1 text-sm text-muted">
                                Your healthcare, consultations and services in one place.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/patient/consultations/new"
                        className="flex w-full items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover sm:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        New Consultation
                    </Link>
                </div>
            </section>

            {data?.nextFollowUp ? (
                <section className="flex flex-col justify-between gap-4 border border-primary/20 bg-accent p-5 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <div>
                            <p className="text-sm font-semibold text-foreground">Your next follow-up is scheduled</p>
                            <p className="mt-1 text-xs text-muted">
                                {formatDate(data.nextFollowUp)} · Keep your consultation history ready.
                            </p>
                        </div>
                    </div>

                    <Link href="/patient/consultations" className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover">
                        View consultations
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </section>
            ) : (
                <section className="flex flex-col justify-between gap-4 border border-border bg-surface-secondary p-5 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <div>
                            <p className="text-sm font-semibold text-foreground">Need medical guidance?</p>
                            <p className="mt-1 text-xs text-muted">Start a consultation and share what you're experiencing.</p>
                        </div>
                    </div>

                    <Link href="/patient/consultations/new" className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover">
                        Start consultation
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </section>
            )}

            <section className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-5">
                <MetricCard title="Consultations" value={data?.stats.total || 0} icon={Stethoscope} iconClass="text-primary bg-primary/10" />
                <MetricCard title="Active Cases" value={data?.stats.active || 0} icon={Clock3} iconClass="text-warning bg-warning/10" />
                <MetricCard title="Completed" value={data?.stats.completed || 0} icon={CheckCircle2} iconClass="text-success bg-success/10" />
                <MetricCard title="Lab Activity" value={data?.stats.activeLabs || 0} icon={FlaskConical} iconClass="text-info bg-info/10" />
                <MetricCard title="Orders" value={data?.stats.activeOrders || 0} icon={Package} iconClass="text-primary bg-primary/10" />
            </section>

            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-foreground">What do you need today?</h2>
                    <p className="mt-1 text-sm text-muted">Quick access to the services you use most.</p>
                </div>

                <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
                    <ServiceCard href="/chat" icon={Sparkles} title="SOMA AI" description="Health guidance" iconClass="text-primary bg-primary/10" />
                    <ServiceCard href="/lab-tests" icon={FlaskConical} title="Lab Tests" description="Book a test" iconClass="text-info bg-info/10" />
                    <ServiceCard href="/reports" icon={FileSearch} title="Reports" description="Understand reports" iconClass="text-success bg-success/10" />
                    <ServiceCard href="/shop" icon={ShoppingBag} title="Shop" description="Healthcare essentials" iconClass="text-primary bg-primary/10" />
                    <ServiceCard href="/patient/insurance" icon={ShieldCheck} title="Insurance" description="Coverage & claims" iconClass="text-warning bg-warning/10" />
                    <ServiceCard href="/first-aid" icon={HeartPulse} title="First Aid" description="Quick guidance" iconClass="text-danger bg-danger/10" />
                </div>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="border border-border bg-surface lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-border p-5">
                        <div>
                            <h2 className="flex items-center gap-2 font-semibold text-foreground">
                                <Stethoscope className="h-5 w-5 text-primary" />
                                Recent Consultations
                            </h2>
                            <p className="mt-1 text-xs text-muted">Your latest medical consultations</p>
                        </div>

                        <Link href="/patient/consultations" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="divide-y divide-border">
                        {data?.consultations?.length ? (
                            data.consultations.map((consult) => (
                                <Link
                                    key={consult._id}
                                    href={`/patient/consultations/${consult._id}`}
                                    className="block p-5 transition hover:bg-surface-secondary"
                                >
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted">{formatDate(consult.created_at)}</p>
                                            <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">
                                                {consult.patient_input?.symptoms_raw_text || "Consultation"}
                                            </h3>
                                        </div>

                                        <StatusBadge status={getStatusLabel(consult.status)} statusKey={consult.status} />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <EmptyState
                                icon={Stethoscope}
                                title="No consultations yet"
                                description="Start your first consultation when you need medical guidance."
                                href="/patient/consultations/new"
                                action="Start Consultation"
                            />
                        )}
                    </div>
                </div>

                <div className="border border-border bg-surface">
                    <div className="border-b border-border p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 font-semibold text-foreground">
                                    <FlaskConical className="h-5 w-5 text-info" />
                                    Lab Activity
                                </h2>
                                <p className="mt-1 text-xs text-muted">Recent lab bookings</p>
                            </div>

                            <Link href="/lab-tests/bookings" className="text-primary hover:text-primary-hover">
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="divide-y divide-border">
                        {data?.labs?.length ? (
                            data.labs.map((lab) => (
                                <Link key={lab._id} href={`/lab-tests/bookings/${lab._id}`} className="block p-4 transition hover:bg-surface-secondary">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-foreground">
                                                {lab.booking_number || "Lab Booking"}
                                            </p>
                                            <p className="mt-1 text-xs text-muted">
                                                {lab.tests?.length || 0} test{lab.tests?.length === 1 ? "" : "s"}
                                            </p>
                                        </div>

                                        <StatusBadge status={getStatusLabel(lab.status)} statusKey={lab.status} />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <FlaskConical className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted">No lab bookings yet.</p>
                                <Link href="/lab-tests" className="mt-2 inline-block text-xs font-medium text-primary">
                                    Explore Lab Tests
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="border border-border bg-surface lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-border p-5">
                        <div>
                            <h2 className="flex items-center gap-2 font-semibold text-foreground">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Support
                            </h2>
                            <p className="mt-1 text-xs text-muted">Your recent support requests</p>
                        </div>

                        <Link href="/contact" className="text-sm font-medium text-primary hover:text-primary-hover">
                            Contact Us
                        </Link>
                    </div>

                    <div className="divide-y divide-border">
                        {data?.feedbacks?.length ? (
                            data.feedbacks.map((ticket) => (
                                <div key={ticket._id} className="flex items-start justify-between gap-4 p-5">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">{ticket.ticket_type}</p>
                                        <p className="mt-1 line-clamp-2 text-xs text-muted">{ticket.message}</p>
                                    </div>

                                    {ticket.status === "Open" ? (
                                        <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted">No recent support tickets.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border border-border bg-surface">
                    <div className="border-b border-border p-5">
                        <h2 className="font-semibold text-foreground">Your Health Shortcuts</h2>
                        <p className="mt-1 text-xs text-muted">Keep useful tools close by.</p>
                    </div>

                    <div className="divide-y divide-border">
                        <Shortcut href="/learn" icon={HeartPulse} title="Learn" description="Explore health information" />
                        <Shortcut href="/subscription" icon={Sparkles} title="Subscription" description="Manage your SOMA AI access" />
                        <Shortcut href="/shop/orders" icon={Package} title="My Orders" description="Track your healthcare orders" />
                        <Shortcut href="/shop/cart" icon={ShoppingBag} title="My Cart" description="Review saved items" />
                    </div>
                </div>
            </section>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, iconClass }: { title: string; value: number; icon: any; iconClass: string }) {
    return (
        <div className="bg-surface p-4 sm:p-5">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center border border-border ${iconClass}`}>
                <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted">{title}</p>
            <p className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">{value}</p>
        </div>
    );
}

function ServiceCard({ href, icon: Icon, title, description, iconClass }: { href: string; icon: any; title: string; description: string; iconClass: string }) {
    return (
        <Link href={href} className="group bg-surface p-4 transition hover:bg-surface-secondary sm:p-5">
            <div className={`mb-4 flex h-9 w-9 items-center justify-center border border-border ${iconClass}`}>
                <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold text-foreground group-hover:text-primary">{title}</p>
            <p className="mt-1 text-[11px] leading-4 text-muted">{description}</p>
        </Link>
    );
}

function Shortcut({ href, icon: Icon, title, description }: { href: string; icon: any; title: string; description: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 p-4 transition hover:bg-surface-secondary">
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mt-0.5 truncate text-xs text-muted">{description}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
        </Link>
    );
}

function StatusBadge({ status, statusKey }: { status: string; statusKey: string }) {
    const styles: Record<string, string> = {
        pending_review: "border-warning/20 bg-warning/10 text-warning",
        in_review: "border-info/20 bg-info/10 text-info",
        completed: "border-success/20 bg-success/10 text-success",
        booked: "border-warning/20 bg-warning/10 text-warning",
        collection_scheduled: "border-primary/20 bg-primary/10 text-primary",
        sample_collected: "border-info/20 bg-info/10 text-info",
        processing: "border-info/20 bg-info/10 text-info",
        report_ready: "border-success/20 bg-success/10 text-success",
    };

    return (
        <span className={`shrink-0 border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles[statusKey] || "border-border bg-surface-secondary text-muted"}`}>
            {status}
        </span>
    );
}

function EmptyState({ icon: Icon, title, description, href, action }: { icon: any; title: string; description: string; href: string; action: string }) {
    return (
        <div className="px-5 py-10 text-center">
            <Icon className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted">{description}</p>
            <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover">
                {action}
                <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}