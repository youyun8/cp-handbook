'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LeetCodeSite = 'cn' | 'en';
export type ContentWidth = 'standard' | 'wide';
export type TextSize = 'small' | 'standard' | 'large';

interface SettingsState {
  leetCodeSite: LeetCodeSite;
  contentWidth: ContentWidth;
  textSize: TextSize;
  setLeetCodeSite: (site: LeetCodeSite) => void;
  setContentWidth: (width: ContentWidth) => void;
  setTextSize: (size: TextSize) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      leetCodeSite: 'cn',
      contentWidth: 'standard',
      textSize: 'standard',
      setLeetCodeSite: (site) => set({ leetCodeSite: site }),
      setContentWidth: (width) => set({ contentWidth: width }),
      setTextSize: (size) => set({ textSize: size })
    }),
    {
      name: 'cp-handbook-settings',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
