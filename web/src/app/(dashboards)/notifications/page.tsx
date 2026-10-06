"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Bell,
    CheckCheck,
    ChevronDown,
    ChevronUp,
    CircleAlert,
    Clock3,
    ExternalLink,
    FileText,
    HeartPulse,
    Info,
    ShieldCheck,
    ShoppingBag,
    Stethoscope,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNotificationStore } from "@/store/notificationStore";
import NotificationPermissionButton from "@/components/ui/NotificationPermissionButton";

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    priority: "low" | "normal" | "high" | "urgent";
    is_read: boolean;
    read_at?: string;
    action_url?: string;
    reference_id?: string;
    reference_type?: string;
    created_at: string;
}

interface NotificationResponse {
    notifications: Notification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
    unread_count: number;
}

const LIMIT = 20;

const getNotificationIcon = (type: string) => {
    const value = type.toLowerCase();

    if (value.includes("appointment") || value.includes("doctor") || value.includes("consultation")) return Stethoscope;
    if (value.includes("health") || value.includes("medical") || value.includes("record")) return HeartPulse;
    if (value.includes("prescription") || value.includes("medicine")) return FileText;
    if (value.includes("insurance") || value.includes("policy")) return ShieldCheck;
    if (value.includes("order") || value.includes("shop") || value.includes("delivery")) return ShoppingBag;
    if (value.includes("urgent") || value.includes("alert")) return CircleAlert;
    if (value.includes("system") || value.includes("info")) return Info;

    return Bell;
};

const formatTime = (date: string) => {
    const value = new Date(date);
    const now = new Date();
    const diff = now.getTime() - value.getTime();

    if (diff < 60 * 1000) return "Just now";
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;

    return value.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: value.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
};

const formatFullDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const getDateGroup = (date: string) => {
    const value = new Date(date);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (value >= today) return "Today";
    if (value >= yesterday) return "Yesterday";

    return value.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: value.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
};

const getPriorityClass = (notification: Notification) => {
    if (notification.priority === "urgent") return "border-l-red-500";
    if (notification.priority === "high") return "border-l-amber-500";
    if (!notification.is_read) return "border-l-[var(--primary)]";
    return "border-l-transparent";
};

export default function NotificationsPage() {
    const router = useRouter();
    const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);
    const [showDeleteAll, setShowDeleteAll] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: String(page),
                limit: String(LIMIT),
            });

            if (activeFilter === "unread") params.set("unread", "true");

            const response = await fetch(`/api/users/notifications?${params.toString()}`, {
                cache: "no-store",
            });

            const data: NotificationResponse | null = await response.json().catch(() => null);

            console.log("Notifications API:", {
                status: response.status,
                statusText: response.statusText,
                data,
            });

            if (!response.ok) {
                throw new Error(data && "message" in data ? String(data.message) : `Notifications API failed (${response.status})`);
            }

            setNotifications(data?.notifications || []);
            setTotalPages(data?.pagination?.total_pages || 1);
            setTotal(data?.pagination?.total || 0);
            setLocalUnreadCount(data?.unread_count || 0);
            setUnreadCount(data?.unread_count || 0);
            setExpandedId(null);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            toast.error(error instanceof Error ? error.message : "Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    }, [activeFilter, page, setUnreadCount]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (notification: Notification) => {
        if (notification.is_read) return;

        try {
            setActionLoading(notification._id);

            const response = await fetch("/api/users/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: notification._id }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Failed to mark notification as read");
            }

            const data = await response.json();

            setNotifications((current) =>
                current.map((item) =>
                    item._id === notification._id
                        ? { ...item, is_read: true, read_at: new Date().toISOString() }
                        : item,
                ),
            );

            setLocalUnreadCount(data.unread_count || 0);
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            toast.error(error instanceof Error ? error.message : "Failed to mark notification as read");
        } finally {
            setActionLoading(null);
        }
    };

    const toggleNotification = async (notification: Notification) => {
        const isExpanded = expandedId === notification._id;

        setExpandedId(isExpanded ? null : notification._id);

        if (!isExpanded && !notification.is_read) {
            await markAsRead(notification);
        }
    };

    const goToAction = (actionUrl: string) => {
        if (/^https?:\/\//i.test(actionUrl)) {
            window.location.href = actionUrl;
            return;
        }

        router.push(actionUrl);
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        try {
            setActionLoading("mark-all");

            const response = await fetch("/api/users/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAll: true }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Failed to mark all notifications as read");
            }

            const data = await response.json();

            setNotifications((current) =>
                current.map((item) => ({
                    ...item,
                    is_read: true,
                    read_at: item.read_at || new Date().toISOString(),
                })),
            );

            setLocalUnreadCount(data.unread_count || 0);
            setUnreadCount(data.unread_count || 0);

            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
            toast.error(error instanceof Error ? error.message : "Failed to mark all notifications as read");
        } finally {
            setActionLoading(null);
        }
    };

    const deleteNotification = async () => {
        if (!deleteTarget) return;

        try {
            setDeleting(true);

            const response = await fetch(
                `/api/users/notifications?id=${encodeURIComponent(deleteTarget._id)}`,
                { method: "DELETE" },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Failed to delete notification");
            }

            const data = await response.json();

            setNotifications((current) =>
                current.filter((item) => item._id !== deleteTarget._id),
            );

            setLocalUnreadCount(data.unread_count || 0);
            setUnreadCount(data.unread_count || 0);
            setTotal((current) => Math.max(current - 1, 0));
            setExpandedId((current) => current === deleteTarget._id ? null : current);
            setDeleteTarget(null);

            toast.success("Notification deleted");

            if (notifications.length === 1 && page > 1) {
                setPage((current) => current - 1);
            } else {
                await fetchNotifications();
            }
        } catch (error) {
            console.error("Failed to delete notification:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete notification");
        } finally {
            setDeleting(false);
        }
    };

    const deleteAllNotifications = async () => {
        try {
            setDeleting(true);

            const response = await fetch("/api/users/notifications?all=true", {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Failed to delete notifications");
            }

            const data = await response.json();

            setNotifications([]);
            setTotal(0);
            setTotalPages(1);
            setPage(1);
            setExpandedId(null);
            setLocalUnreadCount(data.unread_count || 0);
            setUnreadCount(data.unread_count || 0);
            setShowDeleteAll(false);

            toast.success("All notifications deleted");
        } catch (error) {
            console.error("Failed to delete all notifications:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete notifications");
        } finally {
            setDeleting(false);
        }
    };

    const groupedNotifications = useMemo(() => {
        return notifications.reduce<Record<string, Notification[]>>((groups, notification) => {
            const group = getDateGroup(notification.created_at);
            if (!groups[group]) groups[group] = [];
            groups[group].push(notification);
            return groups;
        }, {});
    }, [notifications]);

    const groupOrder = Object.keys(groupedNotifications);

    return (
        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-(--card)">
                                    <Bell size={21} className="text-primary" />
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted">
                                        Your care updates
                                    </p>

                                    <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                                        Notifications
                                    </h1>
                                </div>
                            </div>

                            <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">
                                Important updates about your appointments, health records,
                                medicines, insurance and care.
                            </p>
                        </div>

                        {total > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteAll(true)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-muted transition hover:border-red-400/40 hover:text-red-400"
                            >
                                <Trash2 size={16} />
                                Delete all
                            </button>
                        )}
                    </div>
                </div>
                <div className="mb-6 rounded-xl border border-border bg-(--card) p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Notification preferences
                            </p>

                            <p className="mt-1 max-w-xl text-xs leading-5 text-muted sm:text-sm">
                                Allow SOMATIC to send you important healthcare updates,
                                reminders, and alerts on this device.
                            </p>
                        </div>

                        <NotificationPermissionButton />
                    </div>
                </div>

                <div className="mb-6 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-(--card) p-1">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveFilter("all");
                                setPage(1);
                            }}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition ${activeFilter === "all"
                                ? "bg-primary text-white"
                                : "text-muted hover:text-foreground"
                                }`}
                        >
                            All updates
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setActiveFilter("unread");
                                setPage(1);
                            }}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition ${activeFilter === "unread"
                                ? "bg-primary text-white"
                                : "text-muted hover:text-foreground"
                                }`}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="ml-2 text-xs opacity-80">({unreadCount})</span>
                            )}
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={actionLoading === "mark-all"}
                            className="inline-flex items-center gap-2 self-start text-sm font-medium text-primary transition hover:opacity-80 disabled:opacity-50 sm:self-auto"
                        >
                            <CheckCheck size={17} />
                            {actionLoading === "mark-all" ? "Marking..." : "Mark all as read"}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-28 animate-pulse rounded-xl border border-border bg-(--card)"
                            />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-(--card) px-6 py-16 text-center">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border">
                            <Bell size={24} className="text-muted" />
                        </div>

                        <h2 className="text-lg font-semibold text-foreground">
                            {activeFilter === "unread" ? "You're all caught up" : "No updates yet"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                            {activeFilter === "unread"
                                ? "There are no unread notifications at the moment."
                                : "When there is an important update about your care, it will appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {groupOrder.map((group) => (
                            <section key={group}>
                                <div className="mb-3 flex items-center gap-3">
                                    <h2 className="text-sm font-semibold text-foreground">{group}</h2>
                                    <div className="h-px flex-1 bg-border" />
                                </div>

                                <div className="space-y-3">
                                    {groupedNotifications[group].map((notification) => {
                                        const Icon = getNotificationIcon(notification.type);
                                        const isBusy = actionLoading === notification._id;
                                        const isExpanded = expandedId === notification._id;

                                        return (
                                            <article
                                                key={notification._id}
                                                className={`group relative overflow-hidden rounded-xl border border-l-4 border-border bg-(--card) transition ${isExpanded
                                                    ? "border-(--primary)/40"
                                                    : "hover:border-(--primary)/40"
                                                    } ${getPriorityClass(notification)}`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleNotification(notification)}
                                                    disabled={isBusy}
                                                    className="block w-full p-4 pr-14 text-left sm:p-5 sm:pr-14"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div
                                                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${notification.is_read
                                                                ? "border-border text-muted"
                                                                : "border-(--primary)/30 text-primary"
                                                                }`}
                                                        >
                                                            <Icon size={19} />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:pr-8">
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <h3
                                                                        className={`min-w-0 text-sm ${notification.is_read
                                                                            ? "font-medium"
                                                                            : "font-semibold"
                                                                            } text-foreground`}
                                                                    >
                                                                        {notification.title}
                                                                    </h3>

                                                                    {!notification.is_read && (
                                                                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                                                                    )}
                                                                </div>

                                                                <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
                                                                    <Clock3 size={13} />
                                                                    {formatTime(notification.created_at)}
                                                                </span>
                                                            </div>

                                                            <p
                                                                className={`mt-1.5 text-sm leading-6 text-muted ${isExpanded ? "" : "line-clamp-2"
                                                                    }`}
                                                            >
                                                                {notification.message}
                                                            </p>

                                                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                                                {notification.priority === "urgent" && (
                                                                    <span className="text-xs font-medium text-red-400">
                                                                        Urgent
                                                                    </span>
                                                                )}

                                                                {notification.priority === "high" && (
                                                                    <span className="text-xs font-medium text-amber-400">
                                                                        Important
                                                                    </span>
                                                                )}

                                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                                                                    {isExpanded ? "Collapse" : "View details"}
                                                                    {isExpanded ? (
                                                                        <ChevronUp size={13} />
                                                                    ) : (
                                                                        <ChevronDown size={13} />
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    aria-label="Delete notification"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setDeleteTarget(notification);
                                                    }}
                                                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:bg-red-500/10 hover:text-red-400 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                                >
                                                    <Trash2 size={15} />
                                                </button>

                                                {isExpanded && (
                                                    <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
                                                        <div className="ml-0 sm:ml-14">
                                                            <div className="grid gap-3 sm:grid-cols-2">
                                                                <div className="rounded-lg border border-border px-3 py-3">
                                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                                                                        Notification type
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-foreground">
                                                                        {notification.type}
                                                                    </p>
                                                                </div>

                                                                <div className="rounded-lg border border-border px-3 py-3">
                                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                                                                        Received
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-foreground">
                                                                        {formatFullDate(notification.created_at)}
                                                                    </p>
                                                                </div>

                                                                {notification.reference_type && (
                                                                    <div className="rounded-lg border border-border px-3 py-3">
                                                                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                                                                            Reference
                                                                        </p>
                                                                        <p className="mt-1 text-sm text-foreground">
                                                                            {notification.reference_type}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {notification.priority && (
                                                                    <div className="rounded-lg border border-border px-3 py-3">
                                                                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                                                                            Priority
                                                                        </p>
                                                                        <p
                                                                            className={`mt-1 text-sm font-medium capitalize ${notification.priority === "urgent"
                                                                                ? "text-red-400"
                                                                                : notification.priority === "high"
                                                                                    ? "text-amber-400"
                                                                                    : "text-foreground"
                                                                                }`}
                                                                        >
                                                                            {notification.priority}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                <div>
                                                                    <p className="text-xs text-muted">
                                                                        {notification.is_read
                                                                            ? "This notification has been read."
                                                                            : "This notification is unread."}
                                                                    </p>
                                                                </div>

                                                                {notification.action_url && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            goToAction(notification.action_url!);
                                                                        }}
                                                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                                                                    >
                                                                        Go to details
                                                                        <ExternalLink size={15} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                )}

                {!loading && totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((current) => Math.max(current - 1, 1))}
                            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="text-sm text-muted">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )}

                <div className="mt-10 border-t border-border pt-5 pb-8 text-center">
                    <p className="text-xs leading-5 text-muted">
                        Your health updates are private and visible only to you.
                    </p>
                </div>
            </div>

            {deleteTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#071116] px-4"
                    onClick={() => !deleting && setDeleteTarget(null)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-border bg-(--card) p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 text-red-400">
                                <Trash2 size={19} />
                            </div>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setDeleteTarget(null)}
                                className="text-muted transition hover:text-foreground"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <h2 className="text-lg font-semibold text-foreground">
                            Delete this notification?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-muted">
                            This notification will be permanently removed from your updates.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition hover:text-foreground disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={deleteNotification}
                                className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteAll && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#071116] px-4"
                    onClick={() => !deleting && setShowDeleteAll(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-border bg-(--card) p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 text-red-400">
                                <Trash2 size={19} />
                            </div>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setShowDeleteAll(false)}
                                className="text-muted transition hover:text-foreground"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <h2 className="text-lg font-semibold text-foreground">
                            Delete all notifications?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-muted">
                            This will permanently remove all your notifications. This action
                            cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setShowDeleteAll(false)}
                                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition hover:text-foreground disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={deleteAllNotifications}
                                className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete all"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}