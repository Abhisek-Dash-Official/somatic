"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function UserInitializer({ children }: { children: React.ReactNode }) {
    const fetchUser = useUserStore((state) => state.fetchUser);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return <>{children}</>;
}