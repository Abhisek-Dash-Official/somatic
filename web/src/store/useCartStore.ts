import { create } from "zustand";

export interface CartItem {
  item_type: "Medicine" | "BloodBank";
  item_id: any;
  blood_group?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  total_amount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  updateItemQuantity: (
    item_id: string,
    blood_group: string | undefined,
    action: "increase" | "decrease" | "remove",
  ) => void;
  syncCartWithDB: (
    item_id: string,
    blood_group: string | undefined,
    targetQuantity: number,
    action?: string,
  ) => Promise<void>;
}

const debounceTimers: Record<string, NodeJS.Timeout> = {};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total_amount: 0,
  isLoading: false,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/shop/cart");
      if (res.ok) {
        const data = await res.json();
        set({ items: data.items || [], total_amount: data.total_amount || 0 });
      }
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateItemQuantity: (item_id, blood_group, action) => {
    const { items } = get();
    let targetQuantity = 0;

    const updatedItems = items
      .map((item) => {
        const currentItemId = item.item_id?._id || item.item_id;
        const matches =
          currentItemId.toString() === item_id.toString() &&
          (item.blood_group ?? undefined) === (blood_group ?? undefined);

        if (!matches) return item;

        let newQty = item.quantity;
        if (action === "increase") newQty += 1;
        if (action === "decrease") newQty -= 1;
        if (action === "remove") newQty = 0;

        targetQuantity = newQty;
        return { ...item, quantity: newQty };
      })
      .filter((item) => item.quantity > 0);

    set({ items: updatedItems });

    const itemKey = `${item_id}_${blood_group || "default"}`;

    if (debounceTimers[itemKey]) {
      clearTimeout(debounceTimers[itemKey]);
    }

    debounceTimers[itemKey] = setTimeout(() => {
      delete debounceTimers[itemKey];
      get().syncCartWithDB(item_id, blood_group, targetQuantity, action);
    }, 500);
  },

  syncCartWithDB: async (item_id, blood_group, targetQuantity, action) => {
    const itemKey = `${item_id}_${blood_group || "default"}`;

    try {
      const res = await fetch("/api/shop/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id,
          blood_group,
          quantity: targetQuantity,
          action,
        }),
      });

      if (res.ok) {
        const updatedCart = await res.json();

        if (!debounceTimers[itemKey]) {
          set({
            items: updatedCart.items || [],
            total_amount: updatedCart.total_amount || 0,
          });
        } else {
          set({ total_amount: updatedCart.total_amount || 0 });
        }
      } else {
        get().fetchCart();
      }
    } catch (err) {
      console.error("Cart sync error:", err);
      get().fetchCart();
    }
  },
}));
