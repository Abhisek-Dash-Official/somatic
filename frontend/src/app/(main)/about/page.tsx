import { pageContent } from "@/config/content";
import { Activity } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcon";
import Link from "next/link";

export default function AboutPage() {
  const { about } = pageContent;

  return (
    <div className="container mx-auto px-4 py-20 sm:px-6 max-w-6xl">
      {/* Header Section */}
      <div className="mb-16 flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <Activity className="h-10 w-10" />
        </div>
        <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl tracking-tight">
          {about.title}
        </h1>
        <p className="max-w-2xl text-lg sm:text-xl text-blue-400 font-medium">
          {about.subtitle}
        </p>
      </div>

      {/* Story & Context Section */}
      <div className="mb-20 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        <h2 className="mb-6 text-2xl sm:text-3xl font-bold text-white border-b border-white/10 pb-4">
          Our Story & Context
        </h2>
        <p className="text-slate-300 leading-relaxed text-lg mb-8">
          {about.story}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl bg-black/20 p-6 border border-white/5">
            <h3 className="mb-3 text-xl font-bold text-blue-400">Our Mission</h3>
            <p className="text-slate-400 leading-relaxed">{about.mission}</p>
          </div>
          <div className="rounded-2xl bg-black/20 p-6 border border-white/5">
            <h3 className="mb-3 text-xl font-bold text-blue-400">Our Vision</h3>
            <p className="text-slate-400 leading-relaxed">{about.vision}</p>
          </div>
        </div>
      </div>

      {/* Meet The Team Section */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Meet The Team</h2>
        <p className="text-slate-400 text-lg">The minds building the future of digital Ayush.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {about.team.map((member, index) => (
          <div key={index} className="group rounded-3xl border border-white/10 bg-[#0f172a]/60 p-6 transition-all hover:bg-white/5 hover:border-blue-500/30 text-center">
            <div className="relative mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-[#0B1120] shadow-xl group-hover:scale-105 transition-transform duration-300">
              <img
                src={member.image}
                alt={member.name}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
            <p className="text-sm font-semibold text-blue-400 mb-4">{member.role}</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 px-2">
              {member.bio}
            </p>

            <div className="flex justify-center gap-4">
              {member.github !== "#" && (
                <Link href={member.github} target="_blank" className="rounded-full bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
                  <SocialIcon name="github" className="h-5 w-5" />
                </Link>
              )}
              {member.linkedin !== "#" && (
                <Link href={member.linkedin} target="_blank" className="rounded-full bg-white/5 p-2 text-slate-400 transition-colors hover:bg-[#0A66C2] hover:text-white">
                  <SocialIcon name="linkedin" className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}