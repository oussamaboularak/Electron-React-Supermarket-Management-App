import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set, get) => ({
      // Theme state
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      // Language state
      language: 'en',
      setLanguage: (language) => {
        set({ language });
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', language);
      },

      // Loading states
      loading: false,
      setLoading: (loading) => set({ loading }),

      // Current page
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page }),

      // Settings
      settings: {
        currency: 'USD',
        taxRate: 0,
        storeName: 'Market Manager',
        storeAddress: '',
        storePhone: '',
      },
      updateSettings: (newSettings) => 
        set((state) => ({ 
          settings: { ...state.settings, ...newSettings } 
        })),

      // Initialize app
      initializeApp: () => {
        const { theme, language } = get();
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', language);
      },
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        settings: state.settings,
      }),
    }
  )
);

export default useAppStore;
