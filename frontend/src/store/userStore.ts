import { create } from 'zustand'

interface UserState {
  coupleNames: string
  setCoupleNames: (names: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  coupleNames: '',
  setCoupleNames: (names) => set({ coupleNames: names }),
}))

