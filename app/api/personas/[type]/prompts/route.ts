import { NextRequest, NextResponse } from "next/server"
import { getPersonaPrompt, getPersonaConfig } from "lib/ai/persona-configs"
import { PersonaType } from "types/chat"

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const personaType = params.type as PersonaType
    
    // Validate persona type
    if (!["tutor", "docente", "coach"].includes(personaType)) {
      return NextResponse.json(
        { error: "Invalid persona type" },
        { status: 400 }
      )
    }

    const config = getPersonaConfig(personaType)
    const prompt = getPersonaPrompt(personaType)
    
    return NextResponse.json({
      persona: personaType,
      displayName: config.displayName,
      prompt: prompt,
      characteristics: config.characteristics
    })

  } catch (error) {
    console.error("Error fetching persona prompt:", error)
    return NextResponse.json(
      { error: "Failed to fetch persona prompt" },
      { status: 500 }
    )
  }
}
