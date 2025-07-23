import { NextRequest, NextResponse } from "next/server"
import { PersonaType, Conversation } from "types/chat"

// Mock database - in production, use Supabase
let conversations: Conversation[] = []

export async function GET(request: NextRequest) {
  try {
    // In production, get user ID from auth token
    const userId = "current-user" // Mock user ID
    
    // Get user's conversations
    const userConversations = conversations
      .filter(conv => conv.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    return NextResponse.json({
      conversations: userConversations,
      total: userConversations.length
    })

  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { persona_type, title } = body as { 
      persona_type: PersonaType
      title?: string 
    }

    if (!persona_type) {
      return NextResponse.json(
        { error: "Persona type is required" },
        { status: 400 }
      )
    }

    // In production, get user ID from auth token
    const userId = "current-user" // Mock user ID

    const newConversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      persona_type,
      title: title || `Conversazione con ${persona_type === "tutor" ? "Tutor" : persona_type === "docente" ? "Docente" : "Coach"}`,
      created_at: new Date(),
      updated_at: new Date(),
      messages: []
    }

    conversations.push(newConversation)

    return NextResponse.json({
      conversation: newConversation
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}
