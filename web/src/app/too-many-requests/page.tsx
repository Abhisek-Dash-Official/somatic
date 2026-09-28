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
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        className={`relative z-10 flex w-full max-w-2xl flex-col transition-all duration-700 ease-out ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
      >
        <div className="flex flex-col items-center rounded-xl border border-border bg-surface p-8 text-center shadow-sm sm:p-12">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-xl border border-warning/30 bg-warning/10 text-warning">
            <ShieldAlert className="h-10 w-10" />
          </div>

          <h1 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
            Slowing Down for Safety
          </h1>

          <p className="mb-8 max-w-md text-base leading-relaxed text-muted">
            To protect patient data and maintain system stability across the network, we've temporarily paused activity from your session due to too many requests.
          </p>

          <div className="mb-8 w-full max-w-sm rounded-lg border border-border bg-surface-secondary p-5">
            <div className="mb-2 flex items-end justify-between">
              <span className="text-sm font-medium text-foreground">Cooldown Timer</span>
              <span className="font-mono text-2xl font-bold text-warning">
                00:{timeLeft.toString().padStart(2, "0")}
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-warning transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / COOLDOWN_SECONDS) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={handleRetry}
              disabled={!canRetry}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-8 py-3.5 font-bold transition sm:w-auto ${canRetry
                ? "bg-warning text-primary-foreground hover:opacity-90"
                : "cursor-not-allowed bg-surface-secondary text-muted-foreground"
                }`}
            >
              <RotateCw className={`h-5 w-5 ${!canRetry ? "animate-spin-slow opacity-50" : ""}`} />
              {canRetry ? "Try Again Now" : "Please Wait..."}
            </button>

            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-6 py-3.5 font-semibold text-foreground transition hover:bg-accent sm:w-auto"
            >
              <Home className="h-5 w-5" />
              Go Home
            </Link>
          </div>
        </div>

        <div className="mt-6 flex w-full items-start gap-4 rounded-xl border border-danger/20 bg-danger/10 p-6">
          <div className="mt-1 shrink-0 rounded-lg bg-danger/10 p-2">
            <Phone className="h-6 w-6 text-danger" />
          </div>

          <div>
            <h3 className="mb-1 text-lg font-bold text-danger">Medical Emergency?</h3>
            <p className="text-sm leading-relaxed text-danger/80">
              If you are experiencing a life-threatening condition, do not wait for the system to reset. Please call your local emergency services (911/112) or proceed to the nearest emergency department immediately.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          This security measure ensures the Somatic platform remains highly available for all clinical triages and doctors globally.
        </p>
      </div>
    </div>
  );
}