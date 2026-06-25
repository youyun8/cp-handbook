'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LeetCodeSite = 'cn' | 'en';

interface SettingsState {
  leetCodeSite: LeetCodeSite;
  setLeetCodeSite: (site: LeetCodeSite) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      leetCodeSite: 'cn',
      setLeetCodeSite: (site) => set({ leetCodeSite: site })
    }),
    {
      name: 'cp-handbook-settings',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
