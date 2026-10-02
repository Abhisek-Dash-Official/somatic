import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { navLinks } from "@/config/nav";
import { SocialIcon } from "@/components/ui/SocialIcon";

export default function Footer() {
    return (
        <footer className="border-t border-[#1d343c] bg-[#071116] pt-16 pb-12 text-[#e8f1f3]">
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
                            <span className="text-xl font-bold tracking-tight text-[#e8f1f3]">
                                {siteConfig.name}
                            </span>
                        </Link>

                        <p className="mb-8 max-w-sm text-sm leading-relaxed text-[#91a5aa]">
                            {siteConfig.description}
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {navLinks.footerNav.social.map((link) => (
                                <Link
                                    key={link.title}
                                    href={link.href}
                                    target="_blank"
                                    aria-label={link.title}
                                    className="flex h-10 w-10 items-center justify-center border border-[#1d343c] bg-[#0d1a20] text-[#91a5aa] transition-colors hover:border-[#08a9b5] hover:bg-[#10353b] hover:text-[#08a9b5]"
                                >
                                    <SocialIcon name={link.icon} className="h-5 w-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#e8f1f3]">
                            Company
                        </h3>

                        <ul className="space-y-3">
                            {navLinks.footerNav.company.map((link) => (
                                <li key={link.title}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[#91a5aa] transition-colors hover:text-[#08a9b5]"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#e8f1f3]">
                            Support
                        </h3>

                        <ul className="space-y-3">
                            {navLinks.footerNav.support.map((link) => (
                                <li key={link.title}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[#91a5aa] transition-colors hover:text-[#08a9b5]"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#e8f1f3]">
                            Legal
                        </h3>

                        <ul className="space-y-3">
                            {navLinks.footerNav.legal.map((link) => (
                                <li key={link.title}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[#91a5aa] transition-colors hover:text-[#08a9b5]"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-center justify-between border-t border-[#1d343c] pt-8 text-center md:flex-row md:text-left">
                    <p className="mb-4 text-sm text-[#687d83] md:mb-0">
                        &copy; {new Date().getFullYear()} {siteConfig.name}. A Smart India Hackathon Project.
                    </p>

                    <div className="flex flex-wrap justify-center gap-2">
                        {siteConfig.keywords.slice(0, 4).map((keyword, i) => (
                            <span
                                key={i}
                                className="border border-[#1d343c] bg-[#0d1a20] px-3 py-1 text-xs text-[#91a5aa]"
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