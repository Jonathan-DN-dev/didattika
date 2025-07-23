"use client"

import { PersonaType } from "types/chat"
import { getAllPersonas } from "lib/ai/persona-configs"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

const personaCardStyles = cva(
  ["p-4", "rounded-lg", "text-left", "transition-all", "duration-200", "cursor-pointer", "border-2"],
  {
    variants: {
      persona: {
        tutor: ["bg-blue-50", "hover:bg-blue-100", "border-blue-200", "hover:border-blue-300"],
        docente: ["bg-yellow-50", "hover:bg-yellow-100", "border-yellow-200", "hover:border-yellow-300"],
        coach: ["bg-green-50", "hover:bg-green-100", "border-green-200", "hover:border-green-300"],
      },
      selected: {
        true: ["ring-2", "ring-didattika-blue", "border-didattika-blue"],
        false: [],
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
)

interface PersonaSelectorProps extends VariantProps<typeof personaCardStyles> {
  onPersonaSelect: (persona: PersonaType) => void
  selectedPersona?: PersonaType | null
  className?: string
  showDescriptions?: boolean
}

export function PersonaSelector({ 
  onPersonaSelect, 
  selectedPersona, 
  className,
  showDescriptions = true 
}: PersonaSelectorProps) {
  const personas = getAllPersonas()

  return (
    <div className={twMerge("space-y-3", className)}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Scegli il tuo assistente AI
        </h3>
        <p className="text-sm text-gray-600">
          Ogni assistente ha competenze specifiche per aiutarti al meglio
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => onPersonaSelect(persona.id)}
            className={twMerge(
              personaCardStyles({ 
                persona: persona.id, 
                selected: selectedPersona === persona.id 
              })
            )}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">
                {persona.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-didattika-blue text-base">
                  {persona.displayName}
                </div>
                {showDescriptions && (
                  <div className="text-sm text-gray-600 mt-1">
                    {persona.description}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {persona.characteristics.slice(0, 2).map((char, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-white rounded-full text-gray-700 border"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
