"use client"

import { useState } from "react"
import { PersonaType } from "types/chat"
import { getAllPersonas, getPersonaConfig } from "lib/ai/persona-configs"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

const switcherCardStyles = cva(
  ["p-3", "rounded-lg", "border", "cursor-pointer", "transition-all", "duration-200", "text-left"],
  {
    variants: {
      selected: {
        true: ["border-didattika-blue", "bg-blue-50", "shadow-md"],
        false: ["border-gray-200", "hover:border-gray-300", "hover:bg-gray-50"],
      },
      current: {
        true: ["ring-2", "ring-blue-200"],
        false: [],
      },
    },
  }
)

interface PersonaSwitcherProps {
  currentPersona: PersonaType
  onPersonaSwitch: (persona: PersonaType) => void
  onCancel: () => void
  className?: string
}

export function PersonaSwitcher({ 
  currentPersona, 
  onPersonaSwitch, 
  onCancel, 
  className 
}: PersonaSwitcherProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>(currentPersona)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const personas = getAllPersonas()
  const currentConfig = getPersonaConfig(currentPersona)

  const handlePersonaSelect = (persona: PersonaType) => {
    if (persona === currentPersona) {
      onCancel()
      return
    }
    setSelectedPersona(persona)
    setShowConfirmation(true)
  }

  const handleConfirmSwitch = () => {
    onPersonaSwitch(selectedPersona)
    setShowConfirmation(false)
  }

  const handleCancelSwitch = () => {
    setSelectedPersona(currentPersona)
    setShowConfirmation(false)
  }

  if (showConfirmation) {
    const selectedConfig = getPersonaConfig(selectedPersona)
    
    return (
      <div className={twMerge("p-4 bg-white rounded-lg border border-gray-200", className)}>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Conferma cambio assistente
          </h3>
          <p className="text-sm text-gray-600">
            Stai per passare da <strong>{currentConfig.displayName}</strong> a <strong>{selectedConfig.displayName}</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Current Persona */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">{currentConfig.icon}</div>
            <div className="font-medium text-sm text-gray-700">{currentConfig.displayName}</div>
            <div className="text-xs text-gray-500 mt-1">Attuale</div>
          </div>

          {/* New Persona */}
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl mb-2">{selectedConfig.icon}</div>
            <div className="font-medium text-sm text-didattika-blue">{selectedConfig.displayName}</div>
            <div className="text-xs text-blue-600 mt-1">Nuovo</div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <div className="text-yellow-600 flex-shrink-0 mt-0.5">⚠️</div>
            <div className="text-sm text-yellow-800">
              <strong>Nota:</strong> Il cambio di assistente manterrà la cronologia della conversazione, 
              ma il nuovo assistente avrà uno stile di risposta diverso.
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancelSwitch}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirmSwitch}
            className="flex-1 px-4 py-2 bg-didattika-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Conferma cambio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={twMerge("p-4 bg-white rounded-lg border border-gray-200", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Cambia assistente
        </h3>
        <p className="text-sm text-gray-600">
          Scegli un altro assistente per continuare la conversazione con uno stile diverso
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => handlePersonaSelect(persona.id)}
            className={twMerge(
              switcherCardStyles({ 
                selected: selectedPersona === persona.id,
                current: currentPersona === persona.id
              })
            )}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl flex-shrink-0">
                {persona.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {persona.displayName}
                  </span>
                  {currentPersona === persona.id && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      Attuale
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {persona.description}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {persona.characteristics.slice(0, 2).map((char, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
              {currentPersona === persona.id && (
                <div className="text-blue-500 flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.667 5L7.50033 14.1667L3.33366 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Annulla
        </button>
      </div>
    </div>
  )
}
