import { create } from "zustand";

interface NotificationStore {
  unreadCount: number;
  initialized: boolean;
  setUnreadCount: (count: number) => void;
  decrementUnread: (amount?: number) => void;
  clearUnread: () => void;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  initialized: false,

  setUnreadCount: (count) =>
    set({ unreadCount: Math.max(count, 0), initialized: true }),

  decrementUnread: (amount = 1) =>
    set((state) => ({
      unreadCount: Math.max(state.unreadCount - amount, 0),
    })),

  clearUnread: () => set({ unreadCount: 0 }),

  fetchUnreadCount: async () => {
    try {
      const response = await fetch("/api/users/notifications?count=true", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = await response.json();

      set({
        unreadCount: Math.max(data.unread_count || 0, 0),
        initialized: true,
      });
    } catch {}
  },
}));
