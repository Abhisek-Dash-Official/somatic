"use client";

import React, { useEffect, useState } from "react";
import {
    Building2,
    Edit,
    Loader2,
    Plus,
    UserMinus,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import { toast } from "react-toastify";

interface Department {
    _id: string;
    name: string;
    desc?: string;
    head_doctor_id?: {
        _id: string;
        username: string;
        email: string;
    };
    is_active: boolean;
}

interface Doctor {
    _id: string;
    username: string;
    email: string;
    doctor_info?: {
        qualification?: string;
        reg_no?: string;
    };
}

export default function AdminDepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editDept, setEditDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        desc: "",
        is_active: true,
    });
    const [saving, setSaving] = useState(false);

    const [isDoctorsModalOpen, setIsDoctorsModalOpen] = useState(false);
    const [activeDept, setActiveDept] = useState<Department | null>(null);
    const [deptDoctors, setDeptDoctors] = useState<Doctor[]>([]);
    const [unassignedDoctors, setUnassignedDoctors] = useState<Doctor[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState("");
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchDepartments(page);
    }, [page]);

    const fetchDepartments = async (currentPage: number) => {
        try {
            setLoading(true);

            const res = await fetch(
                `/api/admin/departments?page=${currentPage}&limit=8`,
            );
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(
                    json.message || "Failed to fetch departments",
                );
            }

            setDepartments(json.departments);
            setTotalPages(json.pagination.pages);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (dept?: Department) => {
        if (dept) {
            setEditDept(dept);
            setFormData({
                name: dept.name,
                desc: dept.desc || "",
                is_active: dept.is_active,
            });
        } else {
            setEditDept(null);
            setFormData({
                name: "",
                desc: "",
                is_active: true,
            });
        }

        setIsFormOpen(true);
    };

    const handleSaveDepartment = async (
        e: React.SubmitEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();
        setSaving(true);

        try {
            const endpoint = "/api/admin/departments";
            const method = editDept ? "PUT" : "POST";
            const payload = editDept
                ? { id: editDept._id, ...formData }
                : formData;

            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || "Operation failed");
            }

            toast.success(
                editDept
                    ? "Department updated successfully!"
                    : "Department created successfully!",
            );

            setIsFormOpen(false);
            fetchDepartments(page);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDoctorsModal = async (dept: Department) => {
        setActiveDept(dept);
        setIsDoctorsModalOpen(true);
        setLoadingDoctors(true);

        try {
            const res = await fetch(
                `/api/admin/departments/doctors?departmentId=${dept._id}`,
            );
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message);
            }

            setDeptDoctors(json.departmentDoctors);
            setUnassignedDoctors(json.unassignedDoctors);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoadingDoctors(false);
        }
    };

    const handleDoctorAction = async (
        doctorId: string,
        action: "ASSIGN" | "REMOVE",
    ) => {
        setActionLoading(true);

        try {
            const res = await fetch("/api/admin/departments/doctors", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    doctorId,
                    departmentId: activeDept?._id,
                    action,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message);
            }

            toast.success(json.message);
            setSelectedDoctorId("");

            if (activeDept) {
                handleOpenDoctorsModal(activeDept);
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && departments.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 pt-20 text-foreground sm:space-y-8 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        <div className="flex shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 p-2.5">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        Departments Management
                    </h1>

                    <p className="mt-1 text-sm text-muted sm:text-base">
                        Create departments, manage statuses, and assign doctors.
                    </p>
                </div>

                <button
                    onClick={() => handleOpenForm()}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary-hover"
                >
                    <Plus className="h-5 w-5" />
                    Add Department
                </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {departments.length === 0 ? (
                    <div className="col-span-full flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-12 shadow-sm">
                        <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />

                        <p className="text-lg font-medium text-muted">
                            No departments found.
                        </p>
                    </div>
                ) : (
                    departments.map((dept) => (
                        <div
                            key={dept._id}
                            className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-sm transition-colors hover:border-primary/20"
                        >
                            <div>
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <h2 className="truncate text-lg font-bold capitalize text-foreground">
                                        {dept.name}
                                    </h2>

                                    <span
                                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${dept.is_active
                                                ? "border-success/20 bg-success/10 text-success"
                                                : "border-danger/20 bg-danger/10 text-danger"
                                            }`}
                                    >
                                        {dept.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>

                                <p className="mb-6 min-h-10 line-clamp-3 text-sm leading-relaxed text-muted">
                                    {dept.desc || "No description provided."}
                                </p>
                            </div>

                            <div className="space-y-3 border-t border-border pt-4">
                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        onClick={() =>
                                            handleOpenDoctorsModal(dept)
                                        }
                                        className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-accent px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
                                    >
                                        <Users className="h-4 w-4" />
                                        View Doctors
                                    </button>

                                    <button
                                        onClick={() => handleOpenForm(dept)}
                                        className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-secondary px-3 py-2 text-xs font-semibold text-muted transition hover:bg-accent hover:text-foreground"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="font-mono text-sm text-muted">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() =>
                            setPage((p) => Math.min(p + 1, totalPages))
                        }
                        className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                            <h3 className="text-lg font-bold text-foreground">
                                {editDept
                                    ? "Edit Department"
                                    : "Create New Department"}
                            </h3>

                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="rounded-xl p-1 text-muted transition hover:bg-accent hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveDepartment}
                            className="space-y-4"
                        >
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-foreground">
                                    Department Name
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Cardiology"
                                    className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-foreground">
                                    Description
                                </label>

                                <textarea
                                    rows={3}
                                    value={formData.desc}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            desc: e.target.value,
                                        })
                                    }
                                    placeholder="Short department description..."
                                    className="custom-scrollbar w-full resize-none rounded-xl border border-border bg-surface-secondary px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_active: e.target.checked,
                                        })
                                    }
                                    className="h-5 w-5 rounded border-border bg-surface-secondary text-primary focus:ring-primary"
                                />

                                <label
                                    htmlFor="is_active"
                                    className="cursor-pointer text-sm font-medium text-foreground"
                                >
                                    Department is Active
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-border pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="rounded-xl px-5 py-2.5 font-semibold text-muted transition hover:bg-accent hover:text-foreground"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-bold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
                                >
                                    {saving && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDoctorsModalOpen && activeDept && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
                    <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-surface p-6 shadow-xl">
                        <div className="mb-6 flex shrink-0 items-center justify-between border-b border-border pb-4">
                            <div>
                                <h3 className="text-lg font-bold capitalize text-foreground">
                                    {activeDept.name} Doctors
                                </h3>

                                <p className="mt-0.5 text-xs text-muted">
                                    Manage doctor assignments for this
                                    department
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setIsDoctorsModalOpen(false)
                                }
                                className="rounded-xl p-1 text-muted transition hover:bg-accent hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {loadingDoctors ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto pr-1">
                                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row">
                                    <select
                                        value={selectedDoctorId}
                                        onChange={(e) =>
                                            setSelectedDoctorId(
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    >
                                        <option
                                            value=""
                                            className="bg-surface text-foreground"
                                        >
                                            Select unassigned doctor...
                                        </option>

                                        {unassignedDoctors.map((doc) => (
                                            <option
                                                key={doc._id}
                                                value={doc._id}
                                                className="bg-surface text-foreground"
                                            >
                                                {doc.username} ({doc.email})
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        disabled={
                                            !selectedDoctorId ||
                                            actionLoading
                                        }
                                        onClick={() =>
                                            handleDoctorAction(
                                                selectedDoctorId,
                                                "ASSIGN",
                                            )
                                        }
                                        className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50 sm:w-auto"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Assign
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                                        Assigned Doctors ({deptDoctors.length})
                                    </h4>

                                    {deptDoctors.length === 0 ? (
                                        <p className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted">
                                            No doctors assigned to this
                                            department yet.
                                        </p>
                                    ) : (
                                        deptDoctors.map((doc) => (
                                            <div
                                                key={doc._id}
                                                className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary p-3.5"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {doc.username}
                                                    </p>

                                                    <p className="truncate text-xs text-muted">
                                                        {doc.email}
                                                    </p>
                                                </div>

                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() =>
                                                        handleDoctorAction(
                                                            doc._id,
                                                            "REMOVE",
                                                        )
                                                    }
                                                    className="ml-3 flex shrink-0 items-center gap-1 rounded-xl border border-danger/20 bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/20 disabled:opacity-50"
                                                >
                                                    <UserMinus className="h-3.5 w-3.5" />
                                                    Remove
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}