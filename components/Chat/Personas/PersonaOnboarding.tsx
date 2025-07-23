"use client"

import { useState } from "react"
import { PersonaType } from "types/chat"
import { getAllPersonas } from "lib/ai/persona-configs"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

const stepStyles = cva(
  ["w-8", "h-8", "rounded-full", "flex", "items-center", "justify-center", "text-sm", "font-semibold", "transition-colors"],
  {
    variants: {
      status: {
        completed: ["bg-didattika-blue", "text-white"],
        current: ["bg-didattika-blue", "text-white", "ring-2", "ring-blue-200"],
        upcoming: ["bg-gray-200", "text-gray-600"],
      },
    },
  }
)

const cardStyles = cva(
  ["p-4", "rounded-xl", "border-2", "cursor-pointer", "transition-all", "duration-200"],
  {
    variants: {
      selected: {
        true: ["border-didattika-blue", "bg-blue-50", "shadow-md"],
        false: ["border-gray-200", "hover:border-gray-300", "hover:shadow-sm"],
      },
    },
  }
)

interface PersonaOnboardingProps {
  onComplete: (selectedPersona: PersonaType) => void
  onSkip: () => void
  className?: string
}

export function PersonaOnboarding({ onComplete, onSkip, className }: PersonaOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null)
  
  const personas = getAllPersonas()
  
  const steps = [
    {
      title: "Benvenuto in DIDATTIKA AI",
      description: "Il tuo assistente intelligente per l'apprendimento"
    },
    {
      title: "Scegli il tuo assistente",
      description: "Ogni assistente ha competenze specifiche per aiutarti"
    },
    {
      title: "Inizia a chattare!",
      description: "Il tuo assistente è pronto per aiutarti"
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else if (selectedPersona) {
      onComplete(selectedPersona)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const canProceed = currentStep === 0 || (currentStep === 1 && selectedPersona) || currentStep === 2

  return (
    <div className={twMerge("max-w-lg mx-auto p-6", className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={twMerge(
              stepStyles({ 
                status: index < currentStep ? "completed" : 
                        index === currentStep ? "current" : "upcoming" 
              })
            )}>
              {index < currentStep ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.333 4L5.99967 11.3333L2.66634 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${index < currentStep ? "bg-didattika-blue" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {steps[currentStep].title}
        </h2>
        <p className="text-gray-600">
          {steps[currentStep].description}
        </p>
      </div>

      {/* Step 0: Welcome */}
      {currentStep === 0 && (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🤖</div>
          <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">Cosa puoi fare con DIDATTIKA AI:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Ricevere aiuto personalizzato per lo studio
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Creare materiali didattici e piani di lezione
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Migliorare i tuoi metodi di apprendimento
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Avere supporto motivazionale costante
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 1: Persona Selection */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              Ogni assistente ha uno stile diverso. Puoi cambiare in qualsiasi momento!
            </p>
          </div>
          
          {personas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(persona.id)}
              className={twMerge(
                cardStyles({ selected: selectedPersona === persona.id })
              )}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {persona.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {persona.displayName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {persona.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {persona.characteristics.slice(0, 3).map((char, index) => (
                      <span 
                        key={index}
                        className="text-xs px-2 py-1 bg-white rounded-full text-gray-600 border"
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
      )}

      {/* Step 2: Ready to Start */}
      {currentStep === 2 && selectedPersona && (
        <div className="text-center space-y-6">
          <div className="text-5xl mb-4">
            {personas.find(p => p.id === selectedPersona)?.icon}
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-didattika-blue mb-2">
              Hai scelto: {personas.find(p => p.id === selectedPersona)?.displayName}
            </h3>
            <p className="text-sm text-gray-700">
              {personas.find(p => p.id === selectedPersona)?.description}
            </p>
          </div>
          
          <div className="text-left bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Suggerimenti per iniziare:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {selectedPersona === "tutor" && (
                <>
                  <li>• Chiedi spiegazioni su argomenti difficili</li>
                  <li>• Richiedi esempi pratici</li>
                  <li>• Fai domande per verificare la comprensione</li>
                </>
              )}
              {selectedPersona === "docente" && (
                <>
                  <li>• Chiedi aiuto per la programmazione didattica</li>
                  <li>• Richiedi strategie di valutazione</li>
                  <li>• Crea materiali educativi innovativi</li>
                </>
              )}
              {selectedPersona === "coach" && (
                <>
                  <li>• Condividi le tue sfide di apprendimento</li>
                  <li>• Chiedi consigli per la gestione del tempo</li>
                  <li>• Richiedi tecniche di motivazione</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <div className="flex gap-2">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Indietro
            </button>
          )}
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Salta introduzione
          </button>
        </div>
        
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="px-6 py-2 bg-didattika-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {currentStep === steps.length - 1 ? "Inizia!" : "Avanti"}
        </button>
      </div>
    </div>
  )
}
