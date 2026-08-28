"use client";

import { useState } from "react";
import { Check, X, Camera } from "lucide-react";

interface AvatarSelectorProps {
    currentAvatarId?: string;
    onSelect: (avatarId: string) => void;
    isAdmin?: boolean;
}

export default function AvatarSelector({ currentAvatarId = "1", onSelect, isAdmin = false }: AvatarSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Generate array: ["1", "2", ..., "20"] for normal users + optionally "admin" for admin only
    const avatarOptions = Array.from({ length: 20 }, (_, i) => (i + 1).toString());
    if (isAdmin) {
        avatarOptions.unshift("admin");
    }

    const currentAvatarSrc = `/avatars/avatar-${currentAvatarId || "1"}.png`;

    return (
        <>
            {/* Avatar Display & Edit Button */}
            <div className="relative group inline-block">
                <div className="h-24 w-24 rounded-full bg-blue-500/10 border-2 border-blue-500/30 overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all group-hover:border-blue-400">
                    <img
                        src={currentAvatarSrc}
                        alt="User Avatar"
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/avatar-1.png"; }}
                    />
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    type="button"
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white border-2 border-[#131C31] hover:bg-blue-500 transition-colors shadow-lg"
                >
                    <Camera className="h-4 w-4" />
                </button>
            </div>

            {/* Selection Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl bg-[#0B1120] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-[#131C31]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                Choose Avatar
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {avatarOptions.map((id) => {
                                    const isSelected = currentAvatarId === id;
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => {
                                                onSelect(id);
                                                setIsOpen(false);
                                            }}
                                            className={`relative aspect-square rounded-full border-2 transition-all p-1 ${isSelected ? "border-blue-500 bg-blue-500/10 scale-105" : "border-transparent hover:border-slate-600 hover:bg-slate-800"
                                                }`}
                                        >
                                            <img
                                                src={`/avatars/avatar-${id}.png`}
                                                alt={`Avatar ${id}`}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-[#0B1120]">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}