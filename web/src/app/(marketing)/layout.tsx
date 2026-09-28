import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import UserInitializer from "@/components/UserInitializer";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserInitializer>
            <div className="flex min-h-screen flex-col bg-[#0B1120] text-slate-300 font-sans selection:bg-blue-500/30">
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </div>
        </UserInitializer>
    );
}