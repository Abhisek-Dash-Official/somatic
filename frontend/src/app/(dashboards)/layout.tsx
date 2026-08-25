import React from "react";
import UserInitializer from "@/components/UserInitializer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserInitializer>
            <div className="flex h-screen overflow-hidden bg-[#0B1120] text-white">
                {/* TODO: Sidebar Component will go here */}

                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* TODO: Dashboard Header Component will go here */}

                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </UserInitializer>
    );
}