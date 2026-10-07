import { pageContent } from "@/config/content";
import { SocialIcon } from "@/components/ui/SocialIcon";
import Link from "next/link";
import { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { siteConfig } from "@/config/site";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.name}`,
  description:
    "Learn about Somatic, a connected digital healthcare platform built to make healthcare easier to access, understand, and navigate.",
};

export default function AboutPage() {
  const { about } = pageContent;

  return (
    <main className="overflow-x-clip bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
              About {siteConfig.name}
            </div>

            <h1
              className={`${display.className} text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl`}
            >
              {about.title}
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
              {about.subtitle}
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="border-t border-border py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div className="self-start">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                Our Story
              </div>

              <h2
                className={`${display.className} mt-5 max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl`}
              >
                Building a more connected approach to healthcare.
              </h2>
            </div>

            <div>
              <p
                className={`${display.className} text-xl leading-9 text-foreground sm:text-2xl sm:leading-10`}
              >
                {about.story}
              </p>

              <div className="mt-14 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:bg-surface-secondary">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Mission
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-foreground">
                    What drives us
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted">
                    {about.mission}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:bg-surface-secondary">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Vision
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-foreground">
                    Where we&apos;re going
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted">
                    {about.vision}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="border-t border-border py-16 sm:py-24">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                The Team
              </div>

              <h2
                className={`${display.className} max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl`}
              >
                Meet the people behind {siteConfig.name}.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-muted sm:text-right">
              A multidisciplinary team working across technology,
              healthcare, product, and operations.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {about.team.map((member, index) => (
              <article
                key={index}
                className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-surface-secondary hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex justify-center">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full border border-border bg-surface-secondary sm:h-32 sm:w-32">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <h3
                    className={`${display.className} text-xl font-semibold text-foreground`}
                  >
                    {member.name}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-primary">
                    {member.role}
                  </p>

                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-muted">
                    {member.bio}
                  </p>
                </div>

                <div className="mt-6 flex justify-center gap-5">
                  {member.github !== "#" && (
                    <Link
                      href={member.github}
                      target="_blank"
                      aria-label={`${member.name} GitHub`}
                      className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-primary"
                    >
                      <SocialIcon name="github" className="h-4 w-4" />
                      GitHub
                    </Link>
                  )}

                  {member.linkedin !== "#" && (
                    <Link
                      href={member.linkedin}
                      target="_blank"
                      aria-label={`${member.name} LinkedIn`}
                      className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-primary"
                    >
                      <SocialIcon name="linkedin" className="h-4 w-4" />
                      LinkedIn
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}