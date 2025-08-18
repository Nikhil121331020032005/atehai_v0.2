
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppContext } from "@/context/app-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const { profile } = useAppContext()

  if (profile?.isPremium) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (resolvedTheme === 'dark') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => setTheme('light')}>
                <Moon className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Switch to light mode</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Switch back to light mode.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
      <TooltipProvider>
          <Tooltip>
              <TooltipTrigger asChild>
                  {/* The div wrapper is necessary for the tooltip to work on a disabled button */}
                  <div>
                      <Button variant="outline" size="icon" disabled>
                          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
                          <span className="sr-only">Toggle theme</span>
                      </Button>
                  </div>
              </TooltipTrigger>
              <TooltipContent>
                  <p>Upgrade to Premium to use Dark Mode.</p>
              </TooltipContent>
          </Tooltip>
      </TooltipProvider>
  )
}
