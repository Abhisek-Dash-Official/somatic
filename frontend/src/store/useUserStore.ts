import { create } from "zustand";

interface UserState {
  user: any | null;
  isLoading: boolean;
  isFetched: boolean;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  isFetched: false,

  fetchUser: async () => {
    if (get().isFetched || get().isLoading) return;

    set({ isLoading: true });

    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isFetched: true });
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("API error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearUser: () => set({ user: null, isFetched: false, isLoading: false }),
}));
