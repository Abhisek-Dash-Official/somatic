import { pageContent } from "@/config/content";
import { Activity, ArrowUpRight } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcon";
import Link from "next/link";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.name}`,
  description: "Learn about our mission to revolutionize Ayush healthcare by combining traditional Ayurvedic wisdom with advanced AI technology.",
};

export default function AboutPage() {
  const { about } = pageContent;

  return (
    <main className="bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        {/* INTRO */}
        <section className="border-b border-border pb-12 sm:pb-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                <Activity className="h-4 w-4" />
                About Somatic
              </div>

              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {about.title}
              </h1>
            </div>

            <p className="max-w-md text-base leading-7 text-muted sm:text-lg lg:pb-1">
              {about.subtitle}
            </p>
          </div>
        </section>

        {/* STORY */}
        <section className="grid gap-10 border-b border-border py-14 sm:py-20 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Our story
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Building a more connected approach to healthcare.
            </h2>
          </div>

          <div>
            <p className="text-base leading-8 text-muted sm:text-lg">
              {about.story}
            </p>

            <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
              <div className="bg-surface p-6 sm:p-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-primary">
                  Mission
                </p>
                <h3 className="mb-3 text-xl font-bold">What drives us</h3>
                <p className="text-sm leading-7 text-muted">
                  {about.mission}
                </p>
              </div>

              <div className="bg-surface p-6 sm:p-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-primary">
                  Vision
                </p>
                <h3 className="mb-3 text-xl font-bold">Where we're going</h3>
                <p className="text-sm leading-7 text-muted">
                  {about.vision}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="pt-14 sm:pt-20">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                The team
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Meet the people behind Somatic.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-muted sm:text-right">
              The minds building the future of digital Ayush healthcare.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {about.team.map((member, index) => (
              <div
                key={index}
                className="group overflow-hidden border border-border bg-surface transition-colors hover:border-primary/40"
              >
                <div className="aspect-4/3 overflow-hidden bg-surface-secondary">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{member.name}</h3>
                      <p className="mt-1 text-sm font-medium text-primary">
                        {member.role}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {member.github !== "#" && (
                        <Link
                          href={member.github}
                          target="_blank"
                          aria-label={`${member.name} GitHub`}
                          className="flex h-8 w-8 items-center justify-center border border-border text-muted transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          <SocialIcon name="github" className="h-4 w-4" />
                        </Link>
                      )}

                      {member.linkedin !== "#" && (
                        <Link
                          href={member.linkedin}
                          target="_blank"
                          aria-label={`${member.name} LinkedIn`}
                          className="flex h-8 w-8 items-center justify-center border border-border text-muted transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          <SocialIcon name="linkedin" className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-muted">
                    {member.bio}
                  </p>

                  <div className="mt-6 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    View profile
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}