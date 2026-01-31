import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, SearchCondition } from "@/types";

interface AppState {
  // 사용자 정보
  user: User | null;
  setUser: (user: User | null) => void;

  // 선택된 조건 검색
  selectedCondition: SearchCondition | null;
  setSelectedCondition: (condition: SearchCondition | null) => void;

  // 선택된 종목 코드
  selectedStockCode: string | null;
  setSelectedStockCode: (code: string | null) => void;

  // 다크 모드
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // 로그아웃
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 사용자
      user: null,
      setUser: (user) => set({ user }),

      // 조건 검색
      selectedCondition: null,
      setSelectedCondition: (condition) => set({ selectedCondition: condition }),

      // 종목
      selectedStockCode: null,
      setSelectedStockCode: (code) => set({ selectedStockCode: code }),

      // 다크 모드
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // 로그아웃
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
        set({ user: null });
      },
    }),
    {
      name: "trader-park-storage",
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
