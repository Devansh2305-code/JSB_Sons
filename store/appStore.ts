import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  image: string;
  stock: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'customer';
  phone: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  cart: CartItem[];
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      cart: [],
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      addToCart: (item) => {
        const cart = get().cart;
        const existing = cart.find(c => c.productId === item.productId);
        if (existing) {
          const newQty = Math.min(existing.quantity + item.quantity, item.stock);
          set({ cart: cart.map(c => c.productId === item.productId ? { ...c, quantity: newQty } : c) });
        } else {
          set({ cart: [...cart, item] });
        }
      },
      removeFromCart: (productId) => set({ cart: get().cart.filter(c => c.productId !== productId) }),
      updateCartQty: (productId, qty) => {
        if (qty <= 0) {
          set({ cart: get().cart.filter(c => c.productId !== productId) });
        } else {
          set({ cart: get().cart.map(c => c.productId === productId ? { ...c, quantity: qty } : c) });
        }
      },
      clearCart: () => set({ cart: [] }),
      logout: () => set({ user: null, token: null, cart: [] }),
    }),
    {
      name: 'jsb-store',
    }
  )
);
