import { NextRequest, NextResponse } from "next/server"
import { Conversation } from "types/chat"

// Mock database - in production, use Supabase
// This would be imported from the main conversations route
let conversations: Conversation[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id
    const userId = "current-user" // In production, get from auth token

    const conversation = conversations.find(
      conv => conv.id === conversationId && conv.user_id === userId
    )

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      conversation
    })

  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id
    const userId = "current-user" // In production, get from auth token
    const body = await request.json()

    const conversationIndex = conversations.findIndex(
      conv => conv.id === conversationId && conv.user_id === userId
    )

    if (conversationIndex === -1) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Update conversation
    conversations[conversationIndex] = {
      ...conversations[conversationIndex],
      ...body,
      updated_at: new Date()
    }

    return NextResponse.json({
      conversation: conversations[conversationIndex]
    })

  } catch (error) {
    console.error("Error updating conversation:", error)
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id
    const userId = "current-user" // In production, get from auth token

    const conversationIndex = conversations.findIndex(
      conv => conv.id === conversationId && conv.user_id === userId
    )

    if (conversationIndex === -1) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Remove conversation
    conversations.splice(conversationIndex, 1)

    return NextResponse.json({
      message: "Conversation deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    )
  }
}
