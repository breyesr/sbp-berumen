"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Sparkles } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-surface-elevated animate-pulse" />
    )
  }

  const toggleTheme = () => {
    if (theme === "brand") setTheme("brand-dark")
    else if (theme === "brand-dark") setTheme("experimental")
    else setTheme("brand")
  }

  const getThemeTitle = () => {
    if (theme === "brand") return "Switch to Institutional Dark"
    if (theme === "brand-dark") return "Switch to Experimental (Tech)"
    return "Switch to Institutional Bright"
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-surface-elevated active:scale-95 group focus:outline-none focus:ring-2 focus:ring-primary/50"
      aria-label="Toggle theme"
      title={getThemeTitle()}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <Sun 
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            theme === "brand" ? "translate-y-0 opacity-100 rotate-0" : "translate-y-8 opacity-0 -rotate-90"
          } text-primary`} 
        />
        <Moon 
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            theme === "brand-dark" ? "translate-y-0 opacity-100 rotate-0" : theme === "brand" ? "-translate-y-8 opacity-0 rotate-90" : "translate-y-8 opacity-0 -rotate-90"
          } text-primary`} 
        />
        <Sparkles 
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            theme === "experimental" ? "translate-y-0 opacity-100 rotate-0" : "-translate-y-8 opacity-0 rotate-90"
          } text-primary`} 
        />
      </div>
      
      {/* Subtle indicator ring */}
      <div className="absolute inset-0 rounded-full border border-primary/20 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
    </button>
  )
}
