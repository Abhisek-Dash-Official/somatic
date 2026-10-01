import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import UserInitializer from "@/components/UserInitializer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <UserInitializer>
            <div className="flex min-h-screen flex-col bg-background font-sans text-foreground selection:bg-primary/20">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
            </div>
        </UserInitializer>
    );
}