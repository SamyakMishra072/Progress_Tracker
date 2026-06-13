import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeSession: boolean;
  sessionCategory: string | null;
  sessionStartTime: Date | null;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  startSession: (category: string) => void;
  endSession: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      activeSession: false,
      sessionCategory: null,
      sessionStartTime: null,
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: newTheme };
        }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      startSession: (category: string) =>
        set({
          activeSession: true,
          sessionCategory: category,
          sessionStartTime: new Date(),
        }),
      endSession: () =>
        set({
          activeSession: false,
          sessionCategory: null,
          sessionStartTime: null,
        }),
    }),
    {
      name: 'mission-control-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('mission-control-theme');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch {
      // ignore
    }
  }
}
