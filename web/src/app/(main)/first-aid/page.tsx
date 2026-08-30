"use client";

import { useState, useEffect } from "react";
import {
    Search, ShieldAlert, HeartPulse, Bandage,
    Thermometer, AlertTriangle, X
} from "lucide-react";
import firstAidData from "@/config/first_aid.json";

interface FirstAidItem {
    id: string;
    title: string;
    category: string;
    severity: string;
    short_desc: string;
    steps: string[];
    warnings: string[];
}

export default function FirstAidGuidePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedItem, setSelectedItem] = useState<FirstAidItem | null>(null);

    const categories = ["All", ...Array.from(new Set(firstAidData.map(item => item.category)))];

    const filteredData = firstAidData.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.short_desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "All" || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "high": return "text-red-400 bg-red-500/10 border-red-500/20";
            case "medium": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
            case "low": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
            default: return "text-slate-400 bg-slate-800 border-slate-700";
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Critical Emergencies": return <HeartPulse className="w-5 h-5 text-red-400" />;
            case "Minor Injuries": return <Bandage className="w-5 h-5 text-orange-400" />;
            case "General Illness": return <Thermometer className="w-5 h-5 text-blue-400" />;
            case "Poisoning & Bites": return <AlertTriangle className="w-5 h-5 text-purple-400" />;
            default: return <HeartPulse className="w-5 h-5" />;
        }
    };

    useEffect(() => {
        if (selectedItem) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [selectedItem]);

    return (
        <div className="space-y-6 sm:space-y-8 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8 w-full max-w-5xl mx-auto text-slate-200">

            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 shrink-0">
                            <ShieldAlert className="h-6 w-6 text-red-400" />
                        </div>
                        Emergency & First-Aid Guide
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 mt-2">
                        Zero-latency offline access for critical triage steps and home care protocols.
                    </p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-200 leading-relaxed">
                        <strong className="font-bold">Medical Disclaimer:</strong> This guide is for informational and first-aid purposes only. It does not replace professional medical advice, diagnosis, or treatment. In a severe emergency, call your local emergency services immediately.
                    </p>
                </div>
            </div>

            <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for symptoms or injuries..."
                        className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-blue-500 outline-none"
                    />
                </div>

                <div className="flex overflow-x-auto custom-scrollbar w-full md:w-auto gap-2 pb-2 md:pb-0">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${activeCategory === category
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-[#0B1120] border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-[#131C31] border border-slate-800 rounded-2xl border-dashed">
                    <Search className="h-10 w-10 text-slate-600 mb-4" />
                    <p className="text-lg font-medium text-slate-400">No matching guides found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
                    {filteredData.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item as FirstAidItem)}
                            className="bg-[#131C31] border border-slate-800 rounded-2xl shadow-lg p-5 cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 flex flex-col h-full"
                        >
                            <div className="flex gap-4 mb-3">
                                <div className="p-3 bg-[#0B1120] border border-slate-700 rounded-xl shrink-0 h-fit">
                                    {getCategoryIcon(item.category)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white leading-tight mb-1">{item.title}</h2>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border inline-block ${getSeverityColor(item.severity)}`}>
                                        {item.severity}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-3 mt-auto">{item.short_desc}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* First-Aid Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-[#0B1120] border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="flex items-start justify-between p-5 border-b border-slate-800 shrink-0">
                            <div className="flex gap-4">
                                <div className="p-3 bg-[#131C31] border border-slate-700 rounded-xl shrink-0 h-fit">
                                    {getCategoryIcon(selectedItem.category)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">{selectedItem.title}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-400">{selectedItem.category}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getSeverityColor(selectedItem.severity)}`}>
                                            {selectedItem.severity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded-lg transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-6">
                            <p className="text-slate-300 text-sm bg-[#131C31] p-4 rounded-xl border border-slate-800">
                                {selectedItem.short_desc}
                            </p>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <HeartPulse className="w-4 h-4 text-blue-400" /> Action Steps
                                </h4>
                                <ol className="space-y-4">
                                    {selectedItem.steps.map((step, idx) => (
                                        <li key={idx} className="flex gap-4 text-sm text-slate-300 bg-[#131C31]/50 p-3 rounded-xl border border-slate-800/50">
                                            <span className="flex items-center justify-center bg-blue-500/10 text-blue-400 font-bold rounded-xl h-8 w-8 shrink-0 text-sm border border-blue-500/20 shadow-inner">
                                                {idx + 1}
                                            </span>
                                            <span className="mt-1 leading-relaxed">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {selectedItem.warnings.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 mt-6">
                                    <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5" /> Important Warnings
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-2">
                                        {selectedItem.warnings.map((warn, idx) => (
                                            <li key={idx} className="text-sm text-red-200/90 leading-relaxed font-medium">{warn}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-800 flex justify-end shrink-0 bg-[#0B1120] rounded-b-2xl">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition"
                            >
                                Close Guide
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}