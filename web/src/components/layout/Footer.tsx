import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { navLinks } from "@/config/nav";
import { SocialIcon } from "@/components/ui/SocialIcon";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#0B1120] pt-16 pb-12">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-8">

                    {/* Brand Info */}
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="mb-4 flex items-center gap-3">
                            <Image
                                src={`/${siteConfig.logo}`}
                                alt={siteConfig.name}
                                width={36}
                                height={36}
                                className="object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                            />
                            <span className="text-xl font-bold tracking-tight text-white">{siteConfig.name}</span>
                        </Link>
                        <p className="mb-8 max-w-sm text-sm leading-relaxed text-slate-400">
                            {siteConfig.description}
                        </p>

                        {/* Social Icons */}
                        <div className="flex flex-wrap gap-3">
                            {navLinks.footerNav.social.map((link) => (
                                <Link
                                    key={link.title}
                                    href={link.href}
                                    target="_blank"
                                    aria-label={link.title}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all hover:bg-blue-600 hover:text-white hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                >
                                    <SocialIcon name={link.icon} className="h-5 w-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">Company</h3>
                        <ul className="space-y-3">
                            {navLinks.footerNav.company.map((link) => (
                                <li key={link.title}>
                                    <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-blue-400">{link.title}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">Support</h3>
                        <ul className="space-y-3">
                            {navLinks.footerNav.support.map((link) => (
                                <li key={link.title}>
                                    <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-blue-400">{link.title}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">Legal</h3>
                        <ul className="space-y-3">
                            {navLinks.footerNav.legal.map((link) => (
                                <li key={link.title}>
                                    <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-blue-400">{link.title}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-16 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row text-center md:text-left">
                    <p className="text-sm text-slate-500 mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} {siteConfig.name}. A Smart India Hackathon Project.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {siteConfig.keywords.slice(0, 4).map((keyword, i) => (
                            <span key={i} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 backdrop-blur-md">
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}