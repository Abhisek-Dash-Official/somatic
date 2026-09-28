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
            <div className="flex h-screen flex-col overflow-hidden bg-background font-sans text-foreground selection:bg-primary/30">
                <Header />

                <div className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
                    <Sidebar />

                    <div className="custom-scrollbar flex w-full flex-1 flex-col overflow-x-hidden overflow-y-auto pb-16 md:pb-0">
                        <main className="w-full flex-1 p-4 md:p-6 lg:p-8">
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