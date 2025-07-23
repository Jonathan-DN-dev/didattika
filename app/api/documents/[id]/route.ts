import { NextRequest, NextResponse } from "next/server"
import { Document } from "types/documents"

// Mock database - in production, use Supabase
// This would be imported from the main documents route
let documents: Document[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const userId = "current-user" // In production, get from auth token

    const document = documents.find(
      doc => doc.id === documentId && doc.user_id === userId
    )

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      document
    })

  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const userId = "current-user" // In production, get from auth token
    const body = await request.json()

    const documentIndex = documents.findIndex(
      doc => doc.id === documentId && doc.user_id === userId
    )

    if (documentIndex === -1) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // Update document
    documents[documentIndex] = {
      ...documents[documentIndex],
      ...body,
      updated_at: new Date()
    }

    return NextResponse.json({
      document: documents[documentIndex],
      message: "Document updated successfully"
    })

  } catch (error) {
    console.error("Error updating document:", error)
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const userId = "current-user" // In production, get from auth token

    const documentIndex = documents.findIndex(
      doc => doc.id === documentId && doc.user_id === userId
    )

    if (documentIndex === -1) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // Soft delete - mark as deleted instead of removing
    documents[documentIndex] = {
      ...documents[documentIndex],
      status: 'deleted',
      updated_at: new Date()
    }

    return NextResponse.json({
      message: "Document deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    )
  }
}
