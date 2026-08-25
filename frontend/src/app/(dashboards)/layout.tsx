import React from "react";
import UserInitializer from "@/components/UserInitializer";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserInitializer>
            <div className="flex h-screen flex-col bg-[#0B1120] font-sans text-slate-300 selection:bg-blue-500/30 overflow-hidden">

                <Header />

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">

                    <Sidebar />

                    <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden custom-scrollbar w-full pb-16 md:pb-0">
                        <main className="flex-1 w-full p-4 md:p-6 lg:p-8">
                            <div className="mx-auto w-full max-w-7xl">
                                {children}
                            </div>
                        </main>
                        <Footer />
                    </div>

                </div>
            </div>
        </UserInitializer>
    );
}