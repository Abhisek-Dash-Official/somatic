import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { navLinks } from "@/config/nav";
import { SocialIcon } from "@/components/ui/SocialIcon";

export default function Footer() {
    return (
        <footer className="border-t border-border bg-surface pt-16 pb-12">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-8">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="mb-4 flex items-center gap-3">
                            <Image
                                src={`/${siteConfig.logo}`}
                                alt={siteConfig.name}
                                width={36}
                                height={36}
                                className="object-contain"
                            />
                            <span className="text-xl font-bold tracking-tight text-foreground">{siteConfig.name}</span>
                        </Link>

                        <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted">
                            {siteConfig.description}
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {navLinks.footerNav.social.map((link) => (
                                <Link
                                    key={link.title}
                                    href={link.href}
                                    target="_blank"
                                    aria-label={link.title}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted transition-colors hover:border-primary hover:bg-accent hover:text-primary"
                                >
                                    <SocialIcon name={link.icon} className="h-5 w-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Company</h3>

                        <ul className="space-y-3">
                            {navLinks.footerNav.company.map((link) => (
                                <li key={link.title}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted transition-colors hover:text-primary"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Support</h3>

                        <ul className="space-y-3">
                            {navLinks.footerNav.support.map((link) => (
                                <li key={link.title}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted transition-colors hover:text-primary"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>

                        <ul className="space-y-3">
                            {navLinks.footerNav.legal.map((link) => (
                                <li key={link.title}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted transition-colors hover:text-primary"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-center justify-between border-t border-border pt-8 text-center md:flex-row md:text-left">
                    <p className="mb-4 text-sm text-muted-foreground md:mb-0">
                        &copy; {new Date().getFullYear()} {siteConfig.name}. A Smart India Hackathon Project.
                    </p>

                    <div className="flex flex-wrap justify-center gap-2">
                        {siteConfig.keywords.slice(0, 4).map((keyword, i) => (
                            <span
                                key={i}
                                className="rounded-lg border border-border bg-background px-3 py-1 text-xs text-muted"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}