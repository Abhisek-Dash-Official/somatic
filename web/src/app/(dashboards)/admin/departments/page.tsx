"use client";

import React, { useEffect, useState } from "react";
import { Building2, Plus, Edit, Users, Loader2, X, UserMinus, UserPlus } from "lucide-react";
import { toast } from "react-toastify";

interface Department {
    _id: string;
    name: string;
    desc?: string;
    head_doctor_id?: { _id: string; username: string; email: string };
    is_active: boolean;
}

interface Doctor {
    _id: string;
    username: string;
    email: string;
    doctor_info?: { qualification?: string; reg_no?: string };
}

export default function AdminDepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editDept, setEditDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({ name: "", desc: "", is_active: true });
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
            const res = await fetch(`/api/admin/departments?page=${currentPage}&limit=8`);
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Failed to fetch departments");
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
            setFormData({ name: dept.name, desc: dept.desc || "", is_active: dept.is_active });
        } else {
            setEditDept(null);
            setFormData({ name: "", desc: "", is_active: true });
        }
        setIsFormOpen(true);
    };

    const handleSaveDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const endpoint = "/api/admin/departments";
            const method = editDept ? "PUT" : "POST";
            const payload = editDept ? { id: editDept._id, ...formData } : formData;

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Operation failed");

            toast.success(editDept ? "Department updated successfully!" : "Department created successfully!");
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
            const res = await fetch(`/api/admin/departments/doctors?departmentId=${dept._id}`);
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message);
            setDeptDoctors(json.departmentDoctors);
            setUnassignedDoctors(json.unassignedDoctors);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoadingDoctors(false);
        }
    };

    const handleDoctorAction = async (doctorId: string, action: "ASSIGN" | "REMOVE") => {
        setActionLoading(true);
        try {
            const res = await fetch("/api/admin/departments/doctors", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doctorId, departmentId: activeDept?._id, action }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message);

            toast.success(json.message);
            setSelectedDoctorId("");
            if (activeDept) handleOpenDoctorsModal(activeDept);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && departments.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8 w-full max-w-7xl mx-auto text-slate-200">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                            <Building2 className="h-6 w-6 text-blue-400" />
                        </div>
                        Departments Management
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 mt-1">
                        Create departments, manage statuses, and assign doctors.
                    </p>
                </div>

                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-lg shrink-0"
                >
                    <Plus className="h-5 w-5" /> Add Department
                </button>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-[#131C31] border border-slate-800 rounded-2xl border-dashed">
                        <Building2 className="h-12 w-12 text-slate-600 mb-4" />
                        <p className="text-lg font-medium text-slate-400">No departments found.</p>
                    </div>
                ) : (
                    departments.map((dept) => (
                        <div key={dept._id} className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start gap-3 mb-3">
                                    <h2 className="text-lg font-bold text-white capitalize truncate">{dept.name}</h2>
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border uppercase tracking-wider shrink-0 ${dept.is_active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                        }`}>
                                        {dept.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 line-clamp-3 mb-6 min-h-10">
                                    {dept.desc || "No description provided."}
                                </p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-800">
                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => handleOpenDoctorsModal(dept)}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl transition"
                                    >
                                        <Users className="h-4 w-4" /> View Doctors
                                    </button>
                                    <button
                                        onClick={() => handleOpenForm(dept)}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl transition"
                                    >
                                        <Edit className="h-4 w-4" /> Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
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

            {/* Create / Edit Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-[#0B1120] border border-slate-700 rounded-2xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                            <h3 className="text-lg font-bold text-white">
                                {editDept ? "Edit Department" : "Create New Department"}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveDepartment} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">Department Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Cardiology"
                                    className="w-full bg-[#131C31] border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.desc}
                                    onChange={e => setFormData({ ...formData, desc: e.target.value })}
                                    placeholder="Short department description..."
                                    className="w-full bg-[#131C31] border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none resize-none custom-scrollbar"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="h-5 w-5 rounded border-slate-700 bg-[#131C31] text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-slate-300 cursor-pointer">
                                    Department is Active
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-semibold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition disabled:opacity-50"
                                >
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View & Manage Doctors Modal */}
            {isDoctorsModalOpen && activeDept && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl bg-[#0B1120] border border-slate-700 rounded-2xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-white capitalize">{activeDept.name} Doctors</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Manage doctor assignments for this department</p>
                            </div>
                            <button onClick={() => setIsDoctorsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {loadingDoctors ? (
                            <div className="flex py-16 justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        ) : (
                            <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-1">

                                {/* Assign New Doctor Section */}
                                <div className="bg-[#131C31] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center">
                                    <select
                                        value={selectedDoctorId}
                                        onChange={e => setSelectedDoctorId(e.target.value)}
                                        className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Select unassigned doctor...</option>
                                        {unassignedDoctors.map(doc => (
                                            <option key={doc._id} value={doc._id}>
                                                {doc.username} ({doc.email})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        disabled={!selectedDoctorId || actionLoading}
                                        onClick={() => handleDoctorAction(selectedDoctorId, "ASSIGN")}
                                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shrink-0 disabled:opacity-50"
                                    >
                                        <UserPlus className="h-4 w-4" /> Assign
                                    </button>
                                </div>

                                {/* Current Doctors List */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Doctors ({deptDoctors.length})</h4>
                                    {deptDoctors.length === 0 ? (
                                        <p className="text-sm text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-xl">
                                            No doctors assigned to this department yet.
                                        </p>
                                    ) : (
                                        deptDoctors.map(doc => (
                                            <div key={doc._id} className="flex items-center justify-between bg-[#131C31] border border-slate-800/80 p-3.5 rounded-xl">
                                                <div>
                                                    <p className="font-semibold text-slate-200 text-sm">{doc.username}</p>
                                                    <p className="text-xs text-slate-400">{doc.email}</p>
                                                </div>
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => handleDoctorAction(doc._id, "REMOVE")}
                                                    className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                                                >
                                                    <UserMinus className="h-3.5 w-3.5" /> Remove
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