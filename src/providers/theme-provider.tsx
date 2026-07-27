"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  CATEGORY_THEMES,
  type CategoryId,
  type ProductCategoryId,
} from "@/lib/category-themes"

// re-export so every existing import from "@/providers/theme-provider" keeps working
export { CATEGORY_THEMES, type CategoryId, type ProductCategoryId }

interface ThemeContextType {
  activeTab: CategoryId
  setActiveTab: (tab: CategoryId) => void
  theme: (typeof CATEGORY_THEMES)[CategoryId]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function CategoryThemeProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<CategoryId>("all")
  const theme = CATEGORY_THEMES[activeTab]

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--theme-primary", theme.primary)
    root.style.setProperty("--theme-primary-hover", theme.primaryHover)
    root.style.setProperty("--theme-primary-light", theme.primaryLight)
    root.style.setProperty("--theme-bg", theme.bg)
    root.style.setProperty("--theme-border", theme.border)
    root.style.setProperty("--theme-text", theme.textColor)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ activeTab, setActiveTab, theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within a CategoryThemeProvider")
  return context
}

export function useCategoryColor(category: CategoryId) {
  return CATEGORY_THEMES[category]
}