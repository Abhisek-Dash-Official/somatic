import { create } from "zustand";

interface UserState {
  user: any | null;
  isLoading: boolean;
  isFetched: boolean;
  fetchUser: (force?: boolean) => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  isFetched: false,

  fetchUser: async (force = false) => {
    if (!force && (get().isFetched || get().isLoading)) return;

    set({ isLoading: true });

    try {
      const res = await fetch("/api/users/me");

      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isFetched: true });
      } else if (res.status === 401) {
        set({ user: null, isFetched: true });
      } else {
        set({ isFetched: true });
      }
    } catch (error) {
      set({ isFetched: true });
    } finally {
      set({ isLoading: false });
    }
  },

  clearUser: () => set({ user: null, isFetched: false, isLoading: false }),
}));
