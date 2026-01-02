import { create } from 'zustand'
import { User } from '@/lib/type'

interface UserState {
  user: User | null
  coupleNames: string
  setUser: (user: User | null) => void
  setCoupleNames: (names: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  coupleNames: '',
  setUser: (user) => set({ user }),
  setCoupleNames: (names) => set({ coupleNames: names }),
}))

