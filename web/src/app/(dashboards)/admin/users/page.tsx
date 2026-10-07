"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Activity,
    AlertTriangle,
    Ambulance,
    Ban,
    ClipboardPlus,
    Loader2,
    RotateCcw,
    Search,
    Shield,
    ShieldAlert,
    Stethoscope,
    Trash2,
    UserPlus,
    Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { useUserStore } from "@/store/useUserStore";
import CreateUserModal from "@/components/admin/CreateUserModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface UserItem {
    _id: string;
    username: string;
    email: string;
    role: "admin" | "doctor" | "patient" | "assistant_doctor" | "dispatcher";
    avatar_id?: string;
    is_ban: boolean;
    is_delete: boolean;
    created_at: string;
    contact_no?: string;
    patient_info?: { blood_grp?: string };
    doctor_info?: {
        experience?: number;
        qualification?: string;
        department_id?: { _id: string; name: string };
    };
}

interface Department {
    _id: string;
    name: string;
}

export default function AdminUsersPage() {
    const { user: currentUser } = useUserStore();

    const [activeTab, setActiveTab] = useState<
        "patient" | "doctor" | "admin" | "assistant_doctor" | "dispatcher"
    >("patient");

    const [users, setUsers] = useState<UserItem[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [bloodGroupFilter, setBloodGroupFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [acceptingFilter, setAcceptingFilter] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        userId: string;
        action: "BAN" | "DELETE";
        value: boolean;
    }>({
        isOpen: false,
        title: "",
        message: "",
        userId: "",
        action: "BAN",
        value: false,
    });

    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetch("/api/admin/departments?limit=100")
            .then((res) => res.json())
            .then((json) => {
                if (json.success) setDepartments(json.departments);
            })
            .catch(() => { });
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                role: activeTab,
                page: page.toString(),
                limit: "8",
                search,
                status: statusFilter,
                sortBy,
                sortOrder,
            });

            if (activeTab === "patient" && bloodGroupFilter) {
                params.append("bloodGroup", bloodGroupFilter);
            }

            if (activeTab === "doctor" || activeTab === "assistant_doctor") {
                if (departmentFilter) params.append("departmentId", departmentFilter);
                if (acceptingFilter !== "") params.append("acceptingCases", acceptingFilter);
            }

            const res = await fetch(`/api/admin/users?${params.toString()}`);
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || "Failed to fetch users");
            }

            setUsers(json.users);
            setTotalPages(json.pagination.pages);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [
        activeTab,
        page,
        search,
        statusFilter,
        sortBy,
        sortOrder,
        bloodGroupFilter,
        departmentFilter,
        acceptingFilter,
    ]);

    useEffect(() => {
        setPage(1);
    }, [
        activeTab,
        search,
        statusFilter,
        bloodGroupFilter,
        departmentFilter,
        acceptingFilter,
        sortBy,
        sortOrder,
    ]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (userId === currentUser?.id) {
            toast.error("You cannot perform this action on your own account!");
            return;
        }

        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    action: "ROLE",
                    value: newRole,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || "Action failed");
            }

            toast.success("User role updated successfully");
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const executeConfirmedAction = async () => {
        setActionLoading(true);

        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: confirmModal.userId,
                    action: confirmModal.action,
                    value: confirmModal.value,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || "Action failed");
            }

            toast.success("User status updated successfully");

            setConfirmModal({
                isOpen: false,
                title: "",
                message: "",
                userId: "",
                action: "BAN",
                value: false,
            });

            fetchUsers();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 pt-20 text-foreground sm:space-y-8 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        <div className="shrink-0 rounded-xl border border-primary/20 bg-primary/10 p-2.5">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        User Management
                    </h1>

                    <p className="mt-1 text-sm text-muted sm:text-base">
                        Manage platform users, roles, statuses, and permissions.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary-hover"
                >
                    <UserPlus className="h-5 w-5" />
                    Add New User
                </button>
            </div>

            <div className="flex w-fit flex-wrap rounded-xl border border-border bg-surface p-1.5">
                {[
                    { id: "patient", label: "Patients", icon: Activity },
                    { id: "doctor", label: "Doctors", icon: Stethoscope },
                    { id: "assistant_doctor", label: "Assistant Docs", icon: ClipboardPlus },
                    { id: "dispatcher", label: "Dispatchers", icon: Ambulance },
                    { id: "admin", label: "Admins", icon: Shield },
                ].map((tab) => {
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:px-6 ${activeTab === tab.id
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted hover:bg-accent hover:text-foreground"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5 lg:flex-row">
                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by username or email..."
                        className="w-full rounded-xl border border-border bg-surface-secondary py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                </div>

                <div className="flex w-full flex-wrap items-center justify-end gap-3 lg:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="banned">Banned</option>
                        <option value="deleted">Deleted</option>
                    </select>

                    {activeTab === "patient" && (
                        <select
                            value={bloodGroupFilter}
                            onChange={(e) => setBloodGroupFilter(e.target.value)}
                            className="rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        >
                            <option value="">All Blood Groups</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                        </select>
                    )}

                    {(activeTab === "doctor" || activeTab === "assistant_doctor") && (
                        <>
                            <select
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            >
                                <option value="">All Departments</option>
                                {departments.map((d) => (
                                    <option key={d._id} value={d._id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={acceptingFilter}
                                onChange={(e) => setAcceptingFilter(e.target.value)}
                                className="rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            >
                                <option value="">All Availability</option>
                                <option value="true">Accepting Cases</option>
                                <option value="false">On Break</option>
                            </select>
                        </>
                    )}

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    >
                        <option value="created_at">Sort by Date</option>
                        <option value="username">Sort by Name</option>
                        {(activeTab === "doctor" || activeTab === "assistant_doctor") && (
                            <option value="experience">Sort by Experience</option>
                        )}
                    </select>

                    <button
                        onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                        className="rounded-xl border border-border bg-surface-secondary px-3.5 py-2.5 text-sm font-semibold text-muted transition hover:bg-accent hover:text-foreground"
                    >
                        {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-16 shadow-sm">
                    <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium text-muted">No users found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {users.map((u) => {
                        const isSelf = u._id === currentUser?.id;

                        return (
                            <div
                                key={u._id}
                                className={`flex flex-col justify-between rounded-2xl border bg-surface p-5 shadow-sm transition-all ${u.is_delete
                                        ? "border-danger/30 opacity-60"
                                        : u.is_ban
                                            ? "border-warning/30"
                                            : "border-border hover:border-primary/30"
                                    }`}
                            >
                                <div>
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-primary/20 bg-primary/10">
                                                <img
                                                    src={`/avatars/avatar-${u.avatar_id || "1"}.png`}
                                                    alt="Avatar"
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "/avatars/avatar-1.png";
                                                    }}
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-bold text-foreground">
                                                    {u.username}
                                                </h3>
                                                <p className="truncate text-xs text-muted">{u.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4 flex flex-wrap gap-2">
                                        <span
                                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${u.role === "admin"
                                                    ? "border-danger/20 bg-danger/10 text-danger"
                                                    : u.role === "dispatcher"
                                                        ? "border-warning/20 bg-warning/10 text-warning"
                                                        : u.role === "doctor" || u.role === "assistant_doctor"
                                                            ? "border-primary/20 bg-primary/10 text-primary"
                                                            : "border-info/20 bg-info/10 text-info"
                                                }`}
                                        >
                                            {u.role.replace("_", " ")}
                                        </span>

                                        {u.is_delete ? (
                                            <span className="rounded-full border border-danger/20 bg-danger/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-danger">
                                                Deleted
                                            </span>
                                        ) : u.is_ban ? (
                                            <span className="rounded-full border border-warning/20 bg-warning/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
                                                Banned
                                            </span>
                                        ) : (
                                            <span className="rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-6 space-y-1.5 border-t border-border pt-3 text-xs text-muted">
                                        <div className="flex justify-between gap-3">
                                            <span className="text-muted-foreground">Contact:</span>
                                            <span className="font-mono text-foreground">
                                                {u.contact_no || "N/A"}
                                            </span>
                                        </div>

                                        {u.role === "patient" && (
                                            <div className="flex justify-between gap-3">
                                                <span className="text-muted-foreground">Blood Group:</span>
                                                <span className="font-mono text-info">
                                                    {u.patient_info?.blood_grp || "N/A"}
                                                </span>
                                            </div>
                                        )}

                                        {(u.role === "doctor" || u.role === "assistant_doctor") && (
                                            <>
                                                <div className="flex justify-between gap-3">
                                                    <span className="text-muted-foreground">Experience:</span>
                                                    <span className="font-mono text-foreground">
                                                        {u.doctor_info?.experience ?? 0} yrs
                                                    </span>
                                                </div>

                                                <div className="flex justify-between gap-3">
                                                    <span className="text-muted-foreground">Department:</span>
                                                    <span className="max-w-30 truncate font-mono text-primary">
                                                        {u.doctor_info?.department_id?.name || "Unassigned"}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-border pt-3">
                                    <div className="flex items-center gap-2">
                                        <select
                                            disabled={isSelf}
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                            className="w-full rounded-xl border border-border bg-surface-secondary px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-40"
                                        >
                                            <option value="patient">Patient</option>
                                            <option value="doctor">Doctor</option>
                                            <option value="assistant_doctor">Assistant Doctor</option>
                                            <option value="dispatcher">Dispatcher</option>
                                            <option value="admin">Admin</option>
                                        </select>

                                        <button
                                            disabled={isSelf}
                                            onClick={() =>
                                                setConfirmModal({
                                                    isOpen: true,
                                                    title: u.is_ban ? "Unban User" : "Ban User",
                                                    message: `Are you sure you want to ${u.is_ban ? "unban" : "ban"} ${u.username}?`,
                                                    userId: u._id,
                                                    action: "BAN",
                                                    value: !u.is_ban,
                                                })
                                            }
                                            title={u.is_ban ? "Unban User" : "Ban User"}
                                            className={`shrink-0 rounded-xl border p-2 transition disabled:opacity-40 ${u.is_ban
                                                    ? "border-success/20 bg-success/10 text-success hover:bg-success/15"
                                                    : "border-warning/20 bg-warning/10 text-warning hover:bg-warning/15"
                                                }`}
                                        >
                                            {u.is_ban ? (
                                                <ShieldAlert className="h-4 w-4" />
                                            ) : (
                                                <Ban className="h-4 w-4" />
                                            )}
                                        </button>

                                        <button
                                            disabled={isSelf}
                                            onClick={() =>
                                                setConfirmModal({
                                                    isOpen: true,
                                                    title: u.is_delete ? "Restore User" : "Delete User",
                                                    message: `Are you sure you want to ${u.is_delete ? "restore" : "delete"} ${u.username}?`,
                                                    userId: u._id,
                                                    action: "DELETE",
                                                    value: !u.is_delete,
                                                })
                                            }
                                            title={u.is_delete ? "Restore User" : "Soft Delete User"}
                                            className={`shrink-0 rounded-xl border p-2 transition disabled:opacity-40 ${u.is_delete
                                                    ? "border-success/20 bg-success/10 text-success hover:bg-success/15"
                                                    : "border-danger/20 bg-danger/10 text-danger hover:bg-danger/15"
                                                }`}
                                        >
                                            {u.is_delete ? (
                                                <RotateCcw className="h-4 w-4" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {isSelf && (
                                        <p className="text-center text-[10px] italic text-muted-foreground">
                                            Self-actions restricted
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted transition hover:bg-accent hover:text-foreground disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="font-mono text-sm text-muted">
                        Page <span className="text-foreground">{page}</span> of {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted transition hover:bg-accent hover:text-foreground disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}

            <CreateUserModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => fetchUsers()}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                loading={actionLoading}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={executeConfirmedAction}
            />
        </div>
    );
}