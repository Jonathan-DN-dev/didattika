import { Document, DocumentAnalytics } from "./documents"

export interface TeacherDocument extends Document {
  student_name: string
  student_id: string
  course_id?: string
  course_name?: string
  last_viewed_by_teacher?: Date
  teacher_feedback?: string
  approval_status: 'pending' | 'approved' | 'flagged' | 'rejected'
  approval_date?: Date
  interaction_count: number
  ai_queries_count: number
}

export interface StudentTeacherRelation {
  id: string
  student_id: string
  teacher_id: string
  course_id?: string
  course_name?: string
  enrollment_date: Date
  status: 'active' | 'inactive' | 'pending'
  student_name: string
  student_email: string
}

export interface TeacherDocumentFilters {
  student_ids?: string[]
  course_ids?: string[]
  file_types?: string[]
  approval_status?: ('pending' | 'approved' | 'flagged' | 'rejected')[]
  status?: ('uploading' | 'processing' | 'completed' | 'failed' | 'deleted')[]
  date_range?: {
    start: Date
    end: Date
  }
  search_query?: string
  sort_by?: 'date' | 'student' | 'name' | 'size' | 'interactions'
  sort_order?: 'asc' | 'desc'
}

export interface TeacherDocumentAnalytics {
  total_documents: number
  documents_by_status: Record<string, number>
  documents_by_approval: Record<string, number>
  most_active_students: Array<{
    student_id: string
    student_name: string
    document_count: number
    last_upload: Date
    total_interactions: number
  }>
  file_type_distribution: Record<string, number>
  upload_trends: Array<{
    date: string
    count: number
    student_uploads: number
  }>
  engagement_metrics: {
    average_queries_per_document: number
    most_queried_documents: Array<{
      document_id: string
      document_title: string
      student_name: string
      query_count: number
    }>
    total_ai_interactions: number
  }
  flagged_content: Array<{
    document_id: string
    document_title: string
    student_name: string
    flag_reason: string
    flag_date: Date
  }>
}

export interface DocumentApprovalAction {
  document_id: string
  action: 'approve' | 'flag' | 'reject'
  reason?: string
  feedback?: string
}

export interface BulkDocumentAction {
  document_ids: string[]
  action: 'approve' | 'flag' | 'reject' | 'delete'
  reason?: string
  feedback?: string
}

export interface TeacherDocumentListResponse {
  documents: TeacherDocument[]
  total: number
  page: number
  limit: number
  filters_applied: TeacherDocumentFilters
  analytics_summary: {
    total_students: number
    pending_approvals: number
    flagged_documents: number
    recent_uploads: number
  }
}

export interface DocumentInteraction {
  id: string
  document_id: string
  student_id: string
  teacher_id?: string
  interaction_type: 'view' | 'query' | 'download' | 'share' | 'approve' | 'flag'
  timestamp: Date
  duration?: number
  metadata?: {
    query_text?: string
    response_length?: number
    satisfaction_rating?: number
    flag_reason?: string
  }
}

export interface TeacherDashboardStats {
  students_count: number
  total_documents: number
  pending_reviews: number
  flagged_content: number
  this_week_uploads: number
  ai_interactions: number
  most_active_course?: {
    id: string
    name: string
    student_count: number
    document_count: number
  }
}

export interface Course {
  id: string
  name: string
  description?: string
  teacher_id: string
  created_at: Date
  updated_at: Date
  student_count: number
  document_count: number
  status: 'active' | 'archived' | 'draft'
}

export interface DocumentExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  include_content: boolean
  include_analytics: boolean
  date_range?: {
    start: Date
    end: Date
  }
  filters?: TeacherDocumentFilters
}
