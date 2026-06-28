import { create } from "zustand";

interface ToastRecord {
  id: string;
  message: string;
}

/** A tiny in-memory toast queue is provided by sonner; this store is for
 *  cross-component ephemeral UI state that does not warrant a full store. */
interface UIState {
  lastToastId: string;
  bump: () => void;
}

export const useUI = create<UIState>((set) => ({
  lastToastId: "",
  bump: () => set({ lastToastId: Math.random().toString(36).slice(2) }),
}));
