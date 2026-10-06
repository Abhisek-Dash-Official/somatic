self.addEventListener("push", (event) => {
    if (!event.data) return;

    let data;

    try {
        data = event.data.json();
    } catch {
        data = {
            title: "SOMATIC",
            message: event.data.text(),
        };
    }

    const title = data.title || "SOMATIC";

    const options = {
        body: data.message || "",
        icon: "/android-chrome-512x512.png",
        badge: "/android-chrome-512x512.png",
        data: {
            action_url: data.action_url || "/notifications",
            notification_id: data.notification_id || null,
        },
        tag: data.notification_id || undefined,
        renotify: true,
    };

    event.waitUntil(
        self.registration.showNotification(title, options),
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const actionUrl = event.notification.data?.action_url || "/notifications";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true,
        }).then((clientList) => {
            for (const client of clientList) {
                if ("focus" in client) {
                    client.navigate(actionUrl);
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(actionUrl);
            }
        }),
    );
});