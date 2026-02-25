import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  exportDialogOpen: boolean;
  toggleSidebar: () => void;
  setExportDialogOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  exportDialogOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setExportDialogOpen: (open) => set({ exportDialogOpen: open }),
}));
