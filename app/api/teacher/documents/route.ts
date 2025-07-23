import { NextRequest, NextResponse } from "next/server"
import { 
  TeacherDocument, 
  TeacherDocumentListResponse, 
  TeacherDocumentFilters 
} from "types/teacher-documents"

// Mock database - in production, use Supabase with proper teacher-student relationships
let teacherDocuments: TeacherDocument[] = [
  {
    id: "doc-1",
    user_id: "student-1",
    student_id: "student-1",
    student_name: "Marco Rossi",
    course_id: "course-1",
    course_name: "Matematica Avanzata",
    title: "Appunti di Calcolo Differenziale",
    file_path: "/uploads/student-1/calcolo.pdf",
    file_type: "pdf",
    file_size: 2845760,
    content_text: "Contenuto del documento sui calcoli differenziali...",
    summary: "Appunti completi sul calcolo differenziale con esempi pratici e esercizi risolti.",
    status: "completed",
    approval_status: "pending",
    interaction_count: 24,
    ai_queries_count: 12,
    created_at: new Date('2024-12-26T10:30:00'),
    updated_at: new Date('2024-12-28T15:45:00'),
    metadata: {
      original_filename: "calcolo_differenziale.pdf",
      pages: 45,
      word_count: 12500,
      language: "it",
      extraction_method: "pdf-parse"
    }
  },
  {
    id: "doc-2", 
    user_id: "student-2",
    student_id: "student-2",
    student_name: "Sofia Bianchi",
    course_id: "course-2",
    course_name: "Storia Contemporanea",
    title: "La Prima Guerra Mondiale",
    file_path: "/uploads/student-2/wwi.docx",
    file_type: "docx",
    file_size: 1024000,
    content_text: "Analisi dettagliata degli eventi della Prima Guerra Mondiale...",
    summary: "Ricerca approfondita sulle cause, lo sviluppo e le conseguenze della Prima Guerra Mondiale.",
    status: "completed",
    approval_status: "approved",
    approval_date: new Date('2024-12-27T14:20:00'),
    interaction_count: 18,
    ai_queries_count: 8,
    teacher_feedback: "Ottimo lavoro, molto dettagliato e ben strutturato.",
    created_at: new Date('2024-12-25T16:00:00'),
    updated_at: new Date('2024-12-27T14:20:00'),
    metadata: {
      original_filename: "prima_guerra_mondiale.docx",
      word_count: 8900,
      language: "it",
      extraction_method: "mammoth"
    }
  },
  {
    id: "doc-3",
    user_id: "student-3", 
    student_id: "student-3",
    student_name: "Alessandro Neri",
    course_id: "course-3",
    course_name: "Scienze Naturali",
    title: "Ricerca sui cambiamenti climatici",
    file_path: "/uploads/student-3/climate.txt",
    file_type: "txt",
    file_size: 512000,
    content_text: "Contenuto copiato da Wikipedia sui cambiamenti climatici...",
    summary: "Testo sui cambiamenti climatici con possibili contenuti non originali.",
    status: "completed",
    approval_status: "flagged",
    approval_date: new Date('2024-12-28T09:15:00'),
    interaction_count: 5,
    ai_queries_count: 2,
    teacher_feedback: "Contenuto sospetto, possibile plagio da fonti online.",
    created_at: new Date('2024-12-27T11:45:00'),
    updated_at: new Date('2024-12-28T09:15:00'),
    metadata: {
      original_filename: "cambiamenti_climatici.txt",
      word_count: 3200,
      language: "it",
      extraction_method: "text-reader"
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const teacherId = "current-teacher" // In production, get from auth token

    // Parse filters
    const filters: TeacherDocumentFilters = {}
    
    if (searchParams.get('student_ids')) {
      filters.student_ids = searchParams.get('student_ids')!.split(',')
    }
    
    if (searchParams.get('course_ids')) {
      filters.course_ids = searchParams.get('course_ids')!.split(',')
    }
    
    if (searchParams.get('file_types')) {
      filters.file_types = searchParams.get('file_types')!.split(',')
    }
    
    if (searchParams.get('approval_status')) {
      filters.approval_status = searchParams.get('approval_status')!.split(',') as any[]
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

    // Filter documents based on teacher access rights
    let filteredDocuments = teacherDocuments

    // Apply search filter
    if (filters.search_query) {
      const searchLower = filters.search_query.toLowerCase()
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.title.toLowerCase().includes(searchLower) ||
        doc.student_name.toLowerCase().includes(searchLower) ||
        doc.course_name?.toLowerCase().includes(searchLower) ||
        doc.content_text?.toLowerCase().includes(searchLower)
      )
    }

    // Apply student filter
    if (filters.student_ids) {
      filteredDocuments = filteredDocuments.filter(doc =>
        filters.student_ids!.includes(doc.student_id)
      )
    }

    // Apply course filter
    if (filters.course_ids) {
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.course_id && filters.course_ids!.includes(doc.course_id)
      )
    }

    // Apply file type filter
    if (filters.file_types) {
      filteredDocuments = filteredDocuments.filter(doc =>
        filters.file_types!.includes(doc.file_type)
      )
    }

    // Apply approval status filter
    if (filters.approval_status) {
      filteredDocuments = filteredDocuments.filter(doc =>
        filters.approval_status!.includes(doc.approval_status)
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

    // Sort by creation date (newest first) or by other criteria
    const sortBy = searchParams.get('sort_by') || 'date'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    filteredDocuments.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'student':
          comparison = a.student_name.localeCompare(b.student_name)
          break
        case 'name':
          comparison = a.title.localeCompare(b.title)
          break
        case 'size':
          comparison = a.file_size - b.file_size
          break
        case 'interactions':
          comparison = a.interaction_count - b.interaction_count
          break
        case 'date':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Pagination
    const total = filteredDocuments.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex)

    // Calculate analytics summary
    const analyticsSum = {
      total_students: new Set(filteredDocuments.map(doc => doc.student_id)).size,
      pending_approvals: filteredDocuments.filter(doc => doc.approval_status === 'pending').length,
      flagged_documents: filteredDocuments.filter(doc => doc.approval_status === 'flagged').length,
      recent_uploads: filteredDocuments.filter(doc => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(doc.created_at) >= weekAgo
      }).length
    }

    const response: TeacherDocumentListResponse = {
      documents: paginatedDocuments,
      total,
      page,
      limit,
      filters_applied: filters,
      analytics_summary: analyticsSum
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Error fetching teacher documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}
