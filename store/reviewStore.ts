"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ReviewItemStatus = "open" | "acknowledged" | "reviewed";

export interface ReviewItem {
  status: ReviewItemStatus;
  note?: string;
  updatedAt: string;
}

interface ReviewState {
  items: Record<string, ReviewItem>;
  acknowledge: (assessmentId: string) => void;
  markReviewed: (assessmentId: string) => void;
  setNote: (assessmentId: string, note: string) => void;
  reset: (assessmentId: string) => void;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set) => ({
      items: {},
      acknowledge: (id) =>
        set((state) => ({
          items: {
            ...state.items,
            [id]: {
              ...(state.items[id] ?? { note: "" }),
              status: "acknowledged",
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      markReviewed: (id) =>
        set((state) => ({
          items: {
            ...state.items,
            [id]: {
              ...(state.items[id] ?? { note: "" }),
              status: "reviewed",
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      setNote: (id, note) =>
        set((state) => ({
          items: {
            ...state.items,
            [id]: {
              status: state.items[id]?.status ?? "open",
              note,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      reset: (id) =>
        set((state) => {
          const next = { ...state.items };
          delete next[id];
          return { items: next };
        }),
    }),
    {
      name: "shift-review-store",
    },
  ),
);

export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useReviewStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    if (useReviewStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);
  return hydrated;
}
