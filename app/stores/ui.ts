import { defineStore } from 'pinia'

interface SidebarState {
  isOpen: boolean
}

export const useUIStore = defineStore('ui', {
  state: (): SidebarState => ({
    isOpen: true,
  }),

  actions: {
    toggleSidebar() {
      this.isOpen = !this.isOpen
    },
    openSidebar() {
      this.isOpen = true
    },
    closeSidebar() {
      this.isOpen = false
    },
  },
})
