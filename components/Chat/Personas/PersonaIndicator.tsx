"use client"

import { PersonaType } from "types/chat"
import { getPersonaConfig } from "lib/ai/persona-configs"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

const indicatorStyles = cva(
  ["flex", "items-center", "gap-2", "px-3", "py-2", "rounded-lg", "text-sm", "font-medium"],
  {
    variants: {
      persona: {
        tutor: ["bg-blue-100", "text-blue-800", "border", "border-blue-200"],
        docente: ["bg-yellow-100", "text-yellow-800", "border", "border-yellow-200"],
        coach: ["bg-green-100", "text-green-800", "border", "border-green-200"],
      },
      size: {
        sm: ["text-xs", "px-2", "py-1"],
        md: ["text-sm", "px-3", "py-2"],
        lg: ["text-base", "px-4", "py-3"],
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface PersonaIndicatorProps extends VariantProps<typeof indicatorStyles> {
  persona: PersonaType
  className?: string
  showIcon?: boolean
  showDescription?: boolean
  onSwitch?: () => void
}

export function PersonaIndicator({ 
  persona, 
  className, 
  size,
  showIcon = true,
  showDescription = false,
  onSwitch
}: PersonaIndicatorProps) {
  const config = getPersonaConfig(persona)

  return (
    <div className={twMerge(indicatorStyles({ persona, size }), className)}>
      {showIcon && (
        <span className="text-lg">
          {config.icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold">
          {config.displayName}
        </div>
        {showDescription && (
          <div className="text-xs opacity-75 truncate">
            {config.description}
          </div>
        )}
      </div>
      {onSwitch && (
        <button
          onClick={onSwitch}
          className="ml-2 text-xs hover:underline opacity-75 hover:opacity-100 transition-opacity"
          title="Cambia assistente"
        >
          Cambia
        </button>
      )}
    </div>
  )
}
