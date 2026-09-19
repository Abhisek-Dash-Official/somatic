import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  item_type: "medicine" | "blood";
  item_id: any;
  blood_group?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total_amount: number;
  isLoading: boolean;

  fetchCart: () => Promise<void>;
  addItem: (
    item: Omit<CartItem, "item_id"> & { item_id: string },
  ) => Promise<void>;
  updateItemQuantity: (
    item_id: string,
    blood_group: string | undefined,
    action: "increase" | "decrease" | "remove",
  ) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total_amount: 0,
      isLoading: false,

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/shop/cart");
          if (res.ok) {
            const data = await res.json();
            set({
              items: data.items || [],
              total_amount: data.total_amount || 0,
            });
          }
        } catch (error) {
          console.error("Failed to fetch cart DB sync:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (newItem) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          (i) =>
            i.item_id?._id === newItem.item_id || i.item_id === newItem.item_id,
        );

        let updatedItems = [...items];
        if (existingItemIndex > -1) {
          updatedItems[existingItemIndex].quantity += newItem.quantity;
        } else {
          updatedItems.push(newItem as any);
        }
        set({ items: updatedItems });

        try {
          const res = await fetch("/api/shop/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newItem),
          });

          if (res.ok) {
            const data = await res.json();
            set({ items: data.items, total_amount: data.total_amount });
          }
        } catch (error) {
          console.error("Cart DB sync failed on add:", error);
        }
      },

      updateItemQuantity: async (item_id, blood_group, action) => {
        const { items } = get();

        let updatedItems = items.map((item) => {
          const isMatch =
            (item.item_id?._id === item_id || item.item_id === item_id) &&
            item.blood_group === blood_group;
          if (isMatch) {
            if (action === "increase")
              return { ...item, quantity: item.quantity + 1 };
            if (action === "decrease")
              return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        });

        if (action === "remove" || action === "decrease") {
          updatedItems = updatedItems.filter((item) => item.quantity > 0);
        }

        set({ items: updatedItems });

        try {
          const res = await fetch("/api/shop/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_id, blood_group, action }),
          });

          if (res.ok) {
            const data = await res.json();
            set({ items: data.items, total_amount: data.total_amount });
          }
        } catch (error) {
          console.error("Cart DB sync failed on update:", error);
        }
      },

      clearCart: () => set({ items: [], total_amount: 0 }),
    }),
    {
      name: "somatic-cart-storage",
      partialize: (state) => ({
        items: state.items,
        total_amount: state.total_amount,
      }),
    },
  ),
);
