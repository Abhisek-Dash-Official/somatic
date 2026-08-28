"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Users, Search, UserPlus, Shield, Stethoscope, ShieldAlert,
    Activity, Ban, Trash2, RotateCcw, Loader2, AlertTriangle
} from "lucide-react";
import { toast } from "react-toastify";
import { useUserStore } from "@/store/useUserStore";
import CreateUserModal from "@/components/admin/CreateUserModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface UserItem {
    _id: string;
    username: string;
    email: string;
    role: "admin" | "doctor" | "patient";
    avatar_id?: string;
    is_ban: boolean;
    is_delete: boolean;
    created_at: string;
    contact_no?: string;
    patient_info?: { blood_grp?: string };
    doctor_info?: { experience?: number; qualification?: string; department_id?: { _id: string; name: string } };
}

interface Department {
    _id: string;
    name: string;
}

export default function AdminUsersPage() {
    const { user: currentUser } = useUserStore();
    const [activeTab, setActiveTab] = useState<"patient" | "doctor" | "admin">("patient");
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
    }>({ isOpen: false, title: "", message: "", userId: "", action: "BAN", value: false });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetch("/api/admin/departments?limit=100")
            .then(res => res.json())
            .then(json => {
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

            if (activeTab === "patient" && bloodGroupFilter) params.append("bloodGroup", bloodGroupFilter);
            if (activeTab === "doctor") {
                if (departmentFilter) params.append("departmentId", departmentFilter);
                if (acceptingFilter !== "") params.append("acceptingCases", acceptingFilter);
            }

            const res = await fetch(`/api/admin/users?${params.toString()}`);
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Failed to fetch users");

            setUsers(json.users);
            setTotalPages(json.pagination.pages);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [activeTab, page, search, statusFilter, sortBy, sortOrder, bloodGroupFilter, departmentFilter, acceptingFilter]);

    useEffect(() => {
        setPage(1);
    }, [activeTab, search, statusFilter, bloodGroupFilter, departmentFilter, acceptingFilter, sortBy, sortOrder]);

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
                body: JSON.stringify({ userId, action: "ROLE", value: newRole }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Action failed");

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
                    value: confirmModal.value
                }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Action failed");

            toast.success("User status updated successfully");
            setConfirmModal({ isOpen: false, title: "", message: "", userId: "", action: "BAN", value: false });
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8 w-full max-w-7xl mx-auto text-slate-200">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                            <Users className="h-6 w-6 text-blue-400" />
                        </div>
                        User Management
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 mt-1">
                        Manage platform users, roles, statuses, and permissions.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-lg shrink-0"
                >
                    <UserPlus className="h-5 w-5" /> Add New User
                </button>
            </div>

            <div className="flex bg-[#131C31] border border-slate-800 p-1.5 rounded-2xl w-fit">
                {[
                    { id: "patient", label: "Patients", icon: Activity },
                    { id: "doctor", label: "Doctors", icon: Stethoscope },
                    { id: "admin", label: "Admins", icon: Shield },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === tab.id
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                }`}
                        >
                            <Icon className="h-4 w-4" /> {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col lg:flex-row gap-4 justify-between items-center">

                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by username or email..."
                        className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-blue-500 outline-none"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-[#0B1120] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="banned">Banned</option>
                        <option value="deleted">Deleted</option>
                    </select>

                    {activeTab === "patient" && (
                        <select
                            value={bloodGroupFilter}
                            onChange={e => setBloodGroupFilter(e.target.value)}
                            className="bg-[#0B1120] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                        >
                            <option value="">All Blood Groups</option>
                            <option value="A+">A+</option><option value="A-">A-</option>
                            <option value="B+">B+</option><option value="B-">B-</option>
                            <option value="O+">O+</option><option value="O-">O-</option>
                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        </select>
                    )}

                    {activeTab === "doctor" && (
                        <>
                            <select
                                value={departmentFilter}
                                onChange={e => setDepartmentFilter(e.target.value)}
                                className="bg-[#0B1120] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                            >
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>

                            <select
                                value={acceptingFilter}
                                onChange={e => setAcceptingFilter(e.target.value)}
                                className="bg-[#0B1120] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                            >
                                <option value="">All Availability</option>
                                <option value="true">Accepting Cases</option>
                                <option value="false">On Break</option>
                            </select>
                        </>
                    )}

                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-[#0B1120] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                    >
                        <option value="created_at">Sort by Date</option>
                        <option value="username">Sort by Name</option>
                        {activeTab === "doctor" && <option value="experience">Sort by Experience</option>}
                    </select>

                    <button
                        onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                        className="bg-[#0B1120] border border-slate-700 rounded-xl py-2.5 px-3.5 text-slate-300 hover:text-white text-sm font-semibold transition"
                    >
                        {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                    </button>

                </div>
            </div>

            {loading ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                </div>
            ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-[#131C31] border border-slate-800 rounded-2xl border-dashed">
                    <AlertTriangle className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-lg font-medium text-slate-400">No users found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {users.map((u) => {
                        const isSelf = u._id === currentUser?.id;

                        return (
                            <div
                                key={u._id}
                                className={`bg-[#131C31] border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all ${u.is_delete ? "border-red-900/50 opacity-60" : u.is_ban ? "border-yellow-900/50" : "border-slate-800 hover:border-slate-700"
                                    }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/30 overflow-hidden shrink-0">
                                                <img
                                                    src={`/avatars/avatar-${u.avatar_id || "1"}.png`}
                                                    alt="Avatar"
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/avatar-1.png"; }}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-white text-base truncate">{u.username}</h3>
                                                <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${u.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                            u.role === 'doctor' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                            {u.role}
                                        </span>

                                        {u.is_delete ? (
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                                                Deleted
                                            </span>
                                        ) : u.is_ban ? (
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                                Banned
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 mb-6 text-xs text-slate-300 border-t border-slate-800 pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Contact:</span>
                                            <span className="font-mono">{u.contact_no || "N/A"}</span>
                                        </div>
                                        {u.role === "patient" && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Blood Group:</span>
                                                <span className="font-mono text-blue-400">{u.patient_info?.blood_grp || "N/A"}</span>
                                            </div>
                                        )}
                                        {u.role === "doctor" && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Experience:</span>
                                                    <span className="font-mono">{u.doctor_info?.experience ?? 0} yrs</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Department:</span>
                                                    <span className="font-mono text-teal-400 truncate max-w-30">{u.doctor_info?.department_id?.name || "Unassigned"}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-3 border-t border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <select
                                            disabled={isSelf}
                                            value={u.role}
                                            onChange={e => handleRoleChange(u._id, e.target.value)}
                                            className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-1.5 px-2 text-xs text-white focus:border-blue-500 outline-none disabled:opacity-40"
                                        >
                                            <option value="patient">Patient</option>
                                            <option value="doctor">Doctor</option>
                                            <option value="admin">Admin</option>
                                        </select>

                                        <button
                                            disabled={isSelf}
                                            onClick={() => setConfirmModal({
                                                isOpen: true,
                                                title: u.is_ban ? "Unban User" : "Ban User",
                                                message: `Are you sure you want to ${u.is_ban ? "unban" : "ban"} ${u.username}?`,
                                                userId: u._id,
                                                action: "BAN",
                                                value: !u.is_ban,
                                            })}
                                            title={u.is_ban ? "Unban User" : "Ban User"}
                                            className={`p-2 rounded-xl border transition disabled:opacity-40 shrink-0 ${u.is_ban
                                                ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20"
                                                }`}
                                        >
                                            {u.is_ban ? <ShieldAlert className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                        </button>

                                        <button
                                            disabled={isSelf}
                                            onClick={() => setConfirmModal({
                                                isOpen: true,
                                                title: u.is_delete ? "Restore User" : "Delete User",
                                                message: `Are you sure you want to ${u.is_delete ? "restore" : "delete"} ${u.username}?`,
                                                userId: u._id,
                                                action: "DELETE",
                                                value: !u.is_delete,
                                            })}
                                            title={u.is_delete ? "Restore User" : "Soft Delete User"}
                                            className={`p-2 rounded-xl border transition disabled:opacity-40 shrink-0 ${u.is_delete
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                                                }`}
                                        >
                                            {u.is_delete ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {isSelf && <p className="text-[10px] text-center text-slate-500 italic">Self-actions restricted</p>}
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                        className="px-4 py-2 bg-[#131C31] border border-slate-800 rounded-xl text-sm font-semibold text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-mono text-slate-400">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                        className="px-4 py-2 bg-[#131C31] border border-slate-800 rounded-xl text-sm font-semibold text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
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