"use client";

import { Plus, Trash2, UserRound } from "lucide-react";

export interface InsuranceMember {
    name: string;
    relationship: string;
    date_of_birth: string;
}

interface InsuranceMemberFormProps {
    members: InsuranceMember[];
    onChange: (members: InsuranceMember[]) => void;
}

const relationships = ["self", "spouse", "father", "mother", "son", "daughter", "brother", "sister", "other"];

export default function InsuranceMemberForm({ members, onChange }: InsuranceMemberFormProps) {
    const updateMember = (index: number, field: keyof InsuranceMember, value: string) => {
        const updated = [...members];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const addMember = () => {
        onChange([...members, { name: "", relationship: "other", date_of_birth: "" }]);
    };

    const removeMember = (index: number) => {
        if (members.length === 1) return;
        onChange(members.filter((_, memberIndex) => memberIndex !== index));
    };

    return (
        <div className="space-y-5">
            {members.map((member, index) => (
                <div key={index} className="rounded-2xl border border-slate-800 bg-[#0c1426] p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                                <UserRound size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    Insured Member {index + 1}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {index === 0 ? "Primary insured member" : "Additional family member"}
                                </p>
                            </div>
                        </div>

                        {members.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeMember(index)}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                            >
                                <Trash2 size={17} />
                            </button>
                        )}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-xs font-medium text-slate-400">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={member.name}
                                required
                                onChange={(event) => updateMember(index, "name", event.target.value)}
                                placeholder="Enter full name"
                                className="w-full rounded-xl border border-slate-700 bg-[#111a2f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-medium text-slate-400">
                                Relationship
                            </label>
                            <select
                                value={member.relationship}
                                required
                                onChange={(event) => updateMember(index, "relationship", event.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-[#111a2f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                            >
                                {relationships.map((relationship) => (
                                    <option key={relationship} value={relationship}>
                                        {relationship.charAt(0).toUpperCase() + relationship.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-xs font-medium text-slate-400">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                required
                                value={member.date_of_birth}
                                onChange={(event) => updateMember(index, "date_of_birth", event.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-[#111a2f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addMember}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 px-4 py-3 text-sm font-medium text-slate-400 transition hover:border-blue-500/50 hover:text-blue-400"
            >
                <Plus size={18} />
                Add Family Member
            </button>
        </div>
    );
}