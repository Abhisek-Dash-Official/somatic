"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Activity, ArrowRight, Lock, Loader2, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", { email, password, redirect: false });

            if (res?.error) {
                setError("Invalid email or password");
            } else {
                window.location.href = "/";
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-10 text-foreground sm:px-6 lg:py-16">
            <div className="mx-auto grid w-full max-w-5xl border border-border bg-surface lg:grid-cols-[0.9fr_1.1fr]">
                <section className="hidden border-r border-border bg-surface-secondary p-10 lg:flex lg:flex-col lg:justify-between">
                    <div>
                        <div className="mb-10 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-accent text-primary">
                                <Activity className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">SOMATIC</span>
                        </div>

                        <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-primary">
                            Smarter Care. Healthier Tomorrow.
                        </p>

                        <h2 className="max-w-sm text-3xl font-semibold leading-tight text-foreground">
                            From Emergency to Recovery — SOMATIC is with you at every step.
                        </h2>

                        <p className="mt-5 max-w-sm text-sm leading-6 text-muted">
                            First aid, doctor consultations, lab tests, medical reports and everyday healthcare — all connected in one place.
                        </p>
                    </div>

                    <div className="border-t border-border pt-6">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Your Health. Our Priority.</p>
                                <p className="mt-1 text-xs leading-5 text-muted">
                                    One place for the care, guidance and healthcare services you need.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="p-6 sm:p-10 lg:p-12">
                    <div className="mb-8">
                        <div className="mb-5 flex h-11 w-11 items-center justify-center border border-border bg-surface-secondary text-primary lg:hidden">
                            <Activity className="h-5 w-5" />
                        </div>

                        <p className="text-sm font-medium text-primary">Welcome back</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                            Sign in to SOMATIC
                        </h1>
                        <p className="mt-2 text-sm text-muted">
                            Continue where you left off.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 bg-danger" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-border bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border border-border bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-7 flex items-center gap-4">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <p className="text-center text-sm text-muted">
                        Don't have an account?{" "}
                        <Link href="/register" className="font-medium text-primary transition-colors hover:text-primary-hover">
                            Create one
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
}