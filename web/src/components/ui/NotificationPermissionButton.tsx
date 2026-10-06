"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Check, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { urlBase64ToUint8Array } from "@/lib/push";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export default function NotificationPermissionButton() {
    const [permission, setPermission] = useState<PermissionState>("default");
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkNotificationState = async () => {
            if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
                setPermission("unsupported");
                return;
            }

            const currentPermission = Notification.permission;
            setPermission(currentPermission);

            if (currentPermission !== "granted") {
                setSubscribed(false);
                return;
            }

            try {
                await navigator.serviceWorker.register("/sw.js");
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();

                setSubscribed(!!subscription);
            } catch (error) {
                console.error("Failed to check notification subscription:", error);
                setSubscribed(false);
            }
        };

        checkNotificationState();
    }, []);

    const enableNotifications = async () => {
        if (loading) return;

        if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
            toast.error("Push notifications are not supported by this browser.");
            setPermission("unsupported");
            return;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
            toast.error("Notification service is not configured.");
            console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing.");
            return;
        }

        try {
            setLoading(true);

            let permissionResult = Notification.permission;

            if (permissionResult === "default") {
                permissionResult = await Notification.requestPermission();
            }

            setPermission(permissionResult);

            if (permissionResult !== "granted") {
                if (permissionResult === "denied") {
                    toast.error("Notifications are blocked. Please enable them from your browser site settings.");
                }

                return;
            }

            const registration = await navigator.serviceWorker.register("/sw.js");
            const readyRegistration = await navigator.serviceWorker.ready;

            let subscription = await readyRegistration.pushManager.getSubscription();

            if (!subscription) {
                subscription = await readyRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                });
            }

            const subscriptionJson = subscription.toJSON();

            if (!subscriptionJson.endpoint || !subscriptionJson.keys?.p256dh || !subscriptionJson.keys?.auth) {
                throw new Error("Invalid push subscription received from browser.");
            }

            const response = await fetch("/api/users/push-subscription", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    endpoint: subscriptionJson.endpoint,
                    keys: subscriptionJson.keys,
                    userAgent: navigator.userAgent,
                    deviceName: getDeviceName(),
                }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.message || "Failed to enable notifications.");
            }

            setPermission("granted");
            setSubscribed(true);

            toast.success("Notifications enabled.");
        } catch (error) {
            console.error("Failed to enable notifications:", error);
            toast.error(error instanceof Error ? error.message : "Failed to enable notifications.");
        } finally {
            setLoading(false);
        }
    };

    const disableNotifications = async () => {
        if (loading) return;

        try {
            setLoading(true);

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                setSubscribed(false);
                toast.info("Notifications are already disabled.");
                return;
            }

            const endpoint = subscription.endpoint;

            const response = await fetch("/api/users/push-subscription", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ endpoint }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.message || "Failed to disable notifications.");
            }

            await subscription.unsubscribe();

            setSubscribed(false);

            toast.success("Notifications disabled.");
        } catch (error) {
            console.error("Failed to disable notifications:", error);
            toast.error(error instanceof Error ? error.message : "Failed to disable notifications.");
        } finally {
            setLoading(false);
        }
    };

    if (permission === "unsupported") return null;

    if (permission === "denied") {
        return (
            <button
                type="button"
                onClick={() => {
                    toast.info("Notifications are blocked. Please enable them from your browser site settings.");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:border-red-400/50"
            >
                <BellOff size={16} />
                Notifications blocked
            </button>
        );
    }

    if (permission === "granted" && subscribed) {
        return (
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <div className="inline-flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-4 py-2.5 text-sm font-medium text-success">
                    <Check size={16} />
                    Notifications enabled
                </div>

                <button
                    type="button"
                    onClick={disableNotifications}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition hover:border-danger/30 hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <BellOff size={16} />}
                    {loading ? "Disabling..." : "Disable"}
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={enableNotifications}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
            {loading ? "Enabling..." : "Enable notifications"}
        </button>
    );
}

function getDeviceName() {
    const userAgent = navigator.userAgent;

    if (/iPhone/i.test(userAgent)) return "iPhone";
    if (/iPad/i.test(userAgent)) return "iPad";
    if (/Android/i.test(userAgent)) return "Android";
    if (/Mac/i.test(userAgent)) return "Mac";
    if (/Windows/i.test(userAgent)) return "Windows";
    if (/Linux/i.test(userAgent)) return "Linux";

    return "Unknown device";
}