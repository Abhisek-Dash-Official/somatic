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
    if (canRetry) {
      router.back()
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0B1120] px-4 overflow-hidden py-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div
        className={`relative z-10 flex flex-col w-full max-w-2xl transition-all duration-700 ease-out transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
      >
        {/* Main Content Card */}
        <div className="bg-[#131C31] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center text-center">

          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <ShieldAlert className="h-10 w-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Slowing Down for Safety
          </h1>

          <p className="mb-8 text-base text-slate-400 leading-relaxed max-w-md">
            To protect patient data and maintain system stability across the network, we've temporarily paused activity from your session due to too many requests.
          </p>

          {/* Countdown Timer UI */}
          <div className="w-full max-w-sm mb-8 bg-[#0B1120] rounded-xl border border-slate-800 p-5">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-slate-300">Cooldown Timer</span>
              <span className="text-2xl font-mono font-bold text-amber-500">
                00:{timeLeft.toString().padStart(2, '0')}
              </span>
            </div>

            {/* Shrinking Bar */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(timeLeft / COOLDOWN_SECONDS) * 100}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <button
              onClick={handleRetry}
              disabled={!canRetry}
              className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-bold transition-all ${canRetry
                ? "bg-amber-600 text-white hover:bg-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.3)] cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
            >
              <RotateCw className={`h-5 w-5 ${!canRetry && "animate-spin-slow opacity-50"}`} />
              {canRetry ? "Try Again Now" : "Please Wait..."}
            </button>

            <Link
              href="/"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-transparent px-6 py-3.5 font-semibold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
            >
              <Home className="h-5 w-5" />
              Go Home
            </Link>
          </div>
        </div>

        {/* Emergency SOS Warning */}
        <div className="mt-6 w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4 shadow-lg backdrop-blur-sm">
          <div className="bg-red-500/20 p-2 rounded-lg shrink-0 mt-1">
            <Phone className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-red-400 font-bold text-lg mb-1">Medical Emergency?</h3>
            <p className="text-red-300/80 text-sm leading-relaxed">
              If you are experiencing a life-threatening condition, do not wait for the system to reset. Please call your local emergency services (911/112) or proceed to the nearest emergency department immediately.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          This security measure ensures the Somatic platform remains highly available for all clinical triages and doctors globally.
        </p>

      </div>
    </div>
  );
}