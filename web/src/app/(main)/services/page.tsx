import { pageContent } from "@/config/content";
import { Stethoscope, Database, Zap, BriefcaseMedical } from "lucide-react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `Our Services | ${siteConfig.name}`,
    description: "Discover how Somatic delivers clinical value through AI-assisted case taking and secure health records management.",
};

const IconMap: Record<string, any> = { Stethoscope, Database, Zap };

export default function ServicesPage() {
    return (
        <div className="container mx-auto px-4 py-20 sm:px-6 max-w-6xl">
            <div className="mb-16 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <BriefcaseMedical className="h-8 w-8" />
                </div>
                <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">Our <span className="text-blue-400">Services</span></h1>
                <p className="max-w-2xl text-lg text-slate-400">How we deliver tangible clinical value to the Ayush healthcare ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {pageContent.services.map((service, index) => {
                    const Icon = IconMap[service.icon];
                    return (
                        <div key={index} className="group rounded-3xl border border-white/10 bg-[#0f172a]/60 p-8 text-center transition-all hover:bg-white/5 hover:border-blue-500/30">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                {Icon && <Icon className="h-8 w-8" />}
                            </div>
                            <h3 className="mb-4 text-2xl font-bold text-white">{service.title}</h3>
                            <p className="text-base text-slate-400 leading-relaxed">{service.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}