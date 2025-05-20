"use client"

import { useTheme } from "./theme-provider"
import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Cambiar tema">
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  )
}
