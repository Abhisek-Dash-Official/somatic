import { pageContent } from "@/config/content";
import { Cpu, Activity, FileText, ShieldCheck, Database, Zap, Layers } from "lucide-react";

const IconMap: Record<string, any> = { Cpu, Activity, FileText, ShieldCheck, Database, Zap };

export default function FeaturesPage() {
    return (
        <div className="container mx-auto px-4 py-20 sm:px-6 max-w-6xl">
            <div className="mb-16 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Layers className="h-8 w-8" />
                </div>
                <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">Platform <span className="text-blue-400">Features</span></h1>
                <p className="max-w-2xl text-lg text-slate-400">The core technical capabilities that power the Somatic healthcare engine.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {pageContent.features.map((feature, index) => {
                    const Icon = IconMap[feature.icon];
                    return (
                        <div key={index} className="flex flex-col sm:flex-row gap-6 rounded-3xl border border-white/10 bg-[#0f172a]/60 p-8 transition-all hover:bg-white/5 hover:border-blue-500/30">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {Icon && <Icon className="h-7 w-7" />}
                            </div>
                            <div>
                                <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                                <p className="text-base text-slate-400 leading-relaxed">{feature.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}