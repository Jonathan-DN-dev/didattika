import { NextRequest, NextResponse } from "next/server"
import { getAllPersonas, getPersonaConfig } from "lib/ai/persona-configs"
import { PersonaType } from "types/chat"

export async function GET(request: NextRequest) {
  try {
    const personas = getAllPersonas()
    
    return NextResponse.json({
      personas: personas.map(persona => ({
        id: persona.id,
        name: persona.name,
        displayName: persona.displayName,
        description: persona.description,
        icon: persona.icon,
        color: persona.color,
        characteristics: persona.characteristics
      }))
    })

  } catch (error) {
    console.error("Error fetching personas:", error)
    return NextResponse.json(
      { error: "Failed to fetch personas" },
      { status: 500 }
    )
  }
}
