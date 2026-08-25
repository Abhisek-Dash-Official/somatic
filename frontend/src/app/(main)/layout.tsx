import React from "react";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-[#0B1120] text-white">
            {/* TODO: Header Component will go here */}
            <main className="flex-1">{children}</main>
            {/* TODO: Footer Component will go here */}
        </div>
    );
}