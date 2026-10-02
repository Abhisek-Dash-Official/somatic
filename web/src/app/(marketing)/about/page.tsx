import { pageContent } from "@/config/content";
import { SocialIcon } from "@/components/ui/SocialIcon";
import Link from "next/link";
import { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { siteConfig } from "@/config/site";

const display = Fraunces({ subsets: ["latin"], weight: ["400", "600"], display: "swap" });

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.name}`,
  description: "Learn about Somatic, a connected digital healthcare platform built to make healthcare easier to access, understand, and navigate.",
};

export default function AboutPage() {
  const { about } = pageContent;

  return (
    <main className="overflow-x-clip bg-background text-foreground">
      <style>{`
                @keyframes about-fade-up {
                    from {
                        opacity: 0;
                        transform: translateY(18px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .about-fade-up {
                    animation: about-fade-up 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .about-fade-up {
                        animation: none;
                    }
                }
            `}</style>

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <section className="pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pt-28">
          <div className="about-fade-up max-w-4xl">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.18em] text-primary">
              About Somatic
            </p>

            <h1 className={`${display.className} text-5xl font-semibold leading-[1.03] tracking-tight text-foreground sm:text-6xl lg:text-7xl`}>
              {about.title}
            </h1>
          </div>

          <p
            className="about-fade-up mt-8 max-w-2xl text-base leading-7 text-muted sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            {about.subtitle}
          </p>
        </section>

        <section className="grid gap-12 border-t border-border py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="about-fade-up self-start lg:sticky lg:top-28">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Our Story
            </p>

            <h2 className={`${display.className} text-3xl font-semibold leading-tight tracking-tight sm:text-4xl`}>
              Building a more connected approach to healthcare.
            </h2>
          </div>

          <div>
            <p className={`${display.className} about-fade-up text-lg leading-9 text-foreground sm:text-xl sm:leading-10 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-7xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-primary`}>
              {about.story}
            </p>

            <div className="relative mt-16 space-y-14 pl-10 sm:pl-14">
              <div aria-hidden="true" className="absolute bottom-3 left-1.75 top-3 w-px bg-border" />

              <div className="about-fade-up relative" style={{ animationDelay: "100ms" }}>
                <span
                  aria-hidden="true"
                  className="absolute -left-10 top-2 h-3.75 w-3.75 border border-primary bg-primary sm:-left-14"
                />

                <h3 className={`${display.className} text-2xl font-semibold sm:text-3xl`}>
                  What drives us
                  <span className="ml-3 font-sans text-sm font-normal text-primary">
                    Mission
                  </span>
                </h3>

                <p className="mt-3 max-w-xl text-base leading-8 text-muted">
                  {about.mission}
                </p>
              </div>

              <div className="about-fade-up relative" style={{ animationDelay: "180ms" }}>
                <span
                  aria-hidden="true"
                  className="absolute -left-10 top-2 h-3.75 w-3.75 border border-primary bg-background sm:-left-14"
                />

                <h3 className={`${display.className} text-2xl font-semibold sm:text-3xl`}>
                  Where we&apos;re going
                  <span className="ml-3 font-sans text-sm font-normal text-primary">
                    Vision
                  </span>
                </h3>

                <p className="mt-3 max-w-xl text-base leading-8 text-muted">
                  {about.vision}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border pb-16 pt-14 sm:pb-24 sm:pt-20">
          <div className="about-fade-up mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                The Team
              </p>

              <h2
                className={`${display.className} max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl`}
              >
                Meet the people behind Somatic.
              </h2>
            </div>

            <p className="max-w-xs text-sm leading-6 text-muted sm:text-right">
              A multidisciplinary team working across technology, healthcare, product, and operations.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {about.team.map((member, index) => (
              <article key={index} className="ab-rise group">
                <div className="flex h-full flex-col border border-border bg-surface p-6 transition-colors duration-300 hover:border-primary/40">
                  <div className="flex items-center justify-center">
                    <div className="h-28 w-28 overflow-hidden rounded-full border border-border bg-surface-secondary sm:h-32 sm:w-32">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-1 flex-col text-center">
                    <h3 className={`${display.className} text-xl font-semibold`}>{member.name}</h3>
                    <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
                    <p className="mt-4 line-clamp-4 text-sm leading-6 text-muted">{member.bio}</p>

                    <div className="mt-auto flex justify-center gap-5 pt-6">
                      {member.github !== "#" && (
                        <Link
                          href={member.github}
                          target="_blank"
                          aria-label={`${member.name} GitHub`}
                          className="group/link relative inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-primary"
                        >
                          <SocialIcon name="github" className="h-4 w-4" />
                          GitHub
                          <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover/link:scale-x-100" />
                        </Link>
                      )}

                      {member.linkedin !== "#" && (
                        <Link
                          href={member.linkedin}
                          target="_blank"
                          aria-label={`${member.name} LinkedIn`}
                          className="group/link relative inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-primary"
                        >
                          <SocialIcon name="linkedin" className="h-4 w-4" />
                          LinkedIn
                          <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover/link:scale-x-100" />
                        </Link>
                      )}
                    </div>
                  </div>

                  <span
                    aria-hidden="true"
                    className="mt-6 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}