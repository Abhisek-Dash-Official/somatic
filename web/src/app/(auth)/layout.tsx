import React from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen w-full bg-background text-foreground">
            <div className="absolute right-5 top-5 z-50">
                <ThemeToggle />
            </div>

            <div className="mx-auto flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:py-12">
                <div className="w-full">{children}</div>
            </div>
        </div>
    );
}