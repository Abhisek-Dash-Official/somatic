import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, HeartPulse, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { navLinks } from "@/config/nav";
import { SocialIcon } from "@/components/ui/SocialIcon";

export default function Footer() {
    return (
        <footer className="border-t border-border bg-surface">
            <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-16">
                    <div>
                        <Link href="/" className="group inline-flex items-center gap-3">
                            <Image
                                src={`/${siteConfig.logo}`}
                                alt={siteConfig.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
                            />

                            <div>
                                <span className="block text-lg font-bold tracking-tight text-foreground">
                                    {siteConfig.name}
                                </span>
                                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
                                    Healthcare
                                </span>
                            </div>
                        </Link>

                        <p className="mt-5 max-w-md text-sm leading-7 text-muted">
                            {siteConfig.description}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {navLinks.footerNav.social.map((link) => (
                                <Link
                                    key={link.title}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={link.title}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-secondary text-muted transition-all duration-200 hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                                >
                                    <SocialIcon name={link.icon} className="h-4 w-4" />
                                </Link>
                            ))}
                        </div>

                        <div className="mt-7 flex flex-wrap gap-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-muted">
                                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                Trusted Healthcare
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-muted">
                                <HeartPulse className="h-3.5 w-3.5 text-primary" />
                                Patient First
                            </div>
                        </div>
                    </div>

                    <FooterColumn title="Company" links={navLinks.footerNav.company} />
                    <FooterColumn title="Support" links={navLinks.footerNav.support} />
                    <FooterColumn title="Legal" links={navLinks.footerNav.legal} />
                </div>

                <div className="mt-12 border-t border-border pt-7">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs text-muted">
                            © {new Date().getFullYear()} {siteConfig.name}. Smarter Care. Healthier Tomorrow.
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {["AI Healthcare", "Doctor Consultation", "Lab Tests", "Patient Care"].map((keyword) => (
                                <span
                                    key={keyword}
                                    className="rounded-full border border-border bg-surface-secondary px-3 py-1 text-[11px] font-medium text-muted"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, links }: { title: string; links: any[] }) {
    return (
        <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-foreground">
                {title}
            </h3>

            <ul className="space-y-3">
                {links.map((link) => (
                    <li key={link.title}>
                        <Link
                            href={link.href}
                            className="group inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
                        >
                            {link.title}
                            <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}