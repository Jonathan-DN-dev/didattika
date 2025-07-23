import { NextRequest, NextResponse } from "next/server"
import { Document, DocumentListResponse, TeacherDocumentFilters } from "types/documents"

// Mock database - in production, use Supabase
let documents: Document[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('user_id') || 'current-user' // In production, get from auth

    // Apply filters
    const filters: TeacherDocumentFilters = {}
    
    if (searchParams.get('file_type')) {
      filters.file_type = searchParams.get('file_type')!.split(',')
    }
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!.split(',') as any[]
    }
    
    if (searchParams.get('search_query')) {
      filters.search_query = searchParams.get('search_query')!
    }

    if (searchParams.get('date_start') && searchParams.get('date_end')) {
      filters.date_range = {
        start: new Date(searchParams.get('date_start')!),
        end: new Date(searchParams.get('date_end')!)
      }
    }

    // Filter documents
    let filteredDocuments = documents.filter(doc => doc.user_id === userId)

    // Apply search filter
    if (filters.search_query) {
      const searchLower = filters.search_query.toLowerCase()
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.title.toLowerCase().includes(searchLower) ||
        doc.content_text?.toLowerCase().includes(searchLower) ||
        doc.summary?.toLowerCase().includes(searchLower)
      )
    }

    // Apply file type filter
    if (filters.file_type) {
      filteredDocuments = filteredDocuments.filter(doc =>
        filters.file_type!.includes(doc.file_type)
      )
    }

    // Apply status filter
    if (filters.status) {
      filteredDocuments = filteredDocuments.filter(doc =>
        filters.status!.includes(doc.status)
      )
    }

    // Apply date range filter
    if (filters.date_range) {
      filteredDocuments = filteredDocuments.filter(doc => {
        const docDate = new Date(doc.created_at)
        return docDate >= filters.date_range!.start && docDate <= filters.date_range!.end
      })
    }

    // Sort by creation date (newest first)
    filteredDocuments.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Pagination
    const total = filteredDocuments.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex)

    const response: DocumentListResponse = {
      documents: paginatedDocuments,
      total,
      page,
      limit,
      filters_applied: filters
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      file_type, 
      file_size, 
      content_text, 
      summary, 
      metadata 
    } = body

    // Validate required fields
    if (!title || !file_type || !file_size) {
      return NextResponse.json(
        { error: "Missing required fields: title, file_type, file_size" },
        { status: 400 }
      )
    }

    // In production, get user ID from auth token
    const userId = "current-user"

    const newDocument: Document = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      title,
      file_path: `/uploads/${userId}/${Date.now()}-${title}`, // Mock file path
      file_type,
      file_size,
      content_text,
      summary,
      metadata,
      status: content_text ? 'completed' : 'processing',
      created_at: new Date(),
      updated_at: new Date()
    }

    documents.push(newDocument)

    return NextResponse.json({
      document: newDocument,
      message: "Document created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    )
  }
}
