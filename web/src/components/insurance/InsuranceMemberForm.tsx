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

const relationships = [
    "self",
    "spouse",
    "father",
    "mother",
    "son",
    "daughter",
    "brother",
    "sister",
    "other",
];

export default function InsuranceMemberForm({
    members,
    onChange,
}: InsuranceMemberFormProps) {
    const updateMember = (
        index: number,
        field: keyof InsuranceMember,
        value: string
    ) => {
        const updated = [...members];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const addMember = () => {
        onChange([
            ...members,
            { name: "", relationship: "other", date_of_birth: "" },
        ]);
    };

    const removeMember = (index: number) => {
        if (members.length === 1) return;
        onChange(members.filter((_, memberIndex) => memberIndex !== index));
    };

    return (
        <div className="space-y-5">
            {members.map((member, index) => (
                <div key={index} className="rounded-xl border border-border bg-surface-secondary p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <UserRound size={18} />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    Insured Member {index + 1}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {index === 0
                                        ? "Primary insured member"
                                        : "Additional family member"}
                                </p>
                            </div>
                        </div>

                        {members.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeMember(index)}
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-danger/10 hover:text-danger"
                            >
                                <Trash2 size={17} />
                            </button>
                        )}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-xs font-medium text-muted">
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={member.name}
                                required
                                onChange={(event) =>
                                    updateMember(index, "name", event.target.value)
                                }
                                placeholder="Enter full name"
                                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-medium text-muted">
                                Relationship
                            </label>

                            <select
                                value={member.relationship}
                                required
                                onChange={(event) =>
                                    updateMember(
                                        index,
                                        "relationship",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                            >
                                {relationships.map((relationship) => (
                                    <option key={relationship} value={relationship}>
                                        {relationship.charAt(0).toUpperCase() +
                                            relationship.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-xs font-medium text-muted">
                                Date of Birth
                            </label>

                            <input
                                type="date"
                                required
                                value={member.date_of_birth}
                                onChange={(event) =>
                                    updateMember(
                                        index,
                                        "date_of_birth",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addMember}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted transition hover:border-primary/50 hover:bg-accent hover:text-primary"
            >
                <Plus size={18} />
                Add Family Member
            </button>
        </div>
    );
}