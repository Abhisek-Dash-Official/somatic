"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, RotateCw, Home, Phone } from "lucide-react";

export default function TooManyRequestsPage() {
  const router = useRouter();
  const COOLDOWN_SECONDS = 60;
  const [timeLeft, setTimeLeft] = useState(COOLDOWN_SECONDS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const canRetry = timeLeft === 0;

  const handleRetry = () => {
    if (canRetry) router.back();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className={`w-full max-w-2xl transition-all duration-700 ease-out ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex flex-col items-center px-5 py-8 text-center sm:px-10 sm:py-10">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-warning/30 bg-warning/10 text-warning sm:h-20 sm:w-20">
              <ShieldAlert className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-warning">
              Security protection
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Slowing Down for Safety
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-6 text-muted sm:text-base">
              To protect patient data and maintain system stability, we&apos;ve temporarily paused activity from your session because too many requests were detected.
            </p>

            <div className="mt-7 w-full max-w-sm rounded-xl border border-border bg-surface-secondary/60 p-4 sm:p-5">
              <div className="mb-3 flex items-end justify-between gap-4">
                <span className="text-sm font-medium text-foreground">
                  Cooldown
                </span>

                <span className="font-mono text-2xl font-semibold tabular-nums text-warning">
                  00:{timeLeft.toString().padStart(2, "0")}
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-warning transition-all duration-1000 ease-linear"
                  style={{ width: `${(timeLeft / COOLDOWN_SECONDS) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-7 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={handleRetry}
                disabled={!canRetry}
                className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition sm:w-auto ${canRetry
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "cursor-not-allowed bg-surface-secondary text-muted opacity-70"
                  }`}
              >
                <RotateCw className={`h-4 w-4 ${!canRetry ? "animate-spin" : ""}`} />
                {canRetry ? "Try Again" : "Please Wait..."}
              </button>

              <Link
                href="/"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 text-sm font-medium text-foreground transition hover:bg-surface-secondary sm:w-auto"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </div>
          </div>

          <div className="border-t border-border bg-danger/5 px-5 py-5 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                <Phone className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-danger">
                  Medical Emergency?
                </h2>

                <p className="mt-1 text-xs leading-5 text-danger/80 sm:text-sm">
                  If you are experiencing a life-threatening condition, do not wait for the system to reset. Call your local emergency services or proceed to the nearest emergency department immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 px-4 text-center text-[11px] leading-5 text-muted">
          This security measure helps keep Somatic highly available for patients, clinicians, and healthcare teams.
        </p>
      </div>
    </main>
  );
}