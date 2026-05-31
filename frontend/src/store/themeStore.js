import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const applyTheme = (theme) => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
}

const useThemeStore = create(
    persist(
        (set, get) => ({
            theme: 'light',
            toggle: () => {
                const next = get().theme === 'dark' ? 'light' : 'dark'
                applyTheme(next)
                set({ theme: next })
            },
        }),
        {
            name: 'theme-storage',
            onRehydrateStorage: () => (state) => applyTheme(state?.theme ?? 'light'),
        }
    )
)

export default useThemeStore
