"use client"

import { useState, useEffect } from "react"
import { TeacherDocumentAnalytics as AnalyticsData } from "types/teacher-documents"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

const chartCardStyles = cva(
  ["bg-white", "rounded-xl", "p-6", "border", "border-gray-200", "hover:shadow-md", "transition-shadow"]
)

interface TeacherDocumentAnalyticsProps {
  className?: string
}

export function TeacherDocumentAnalytics({ className }: TeacherDocumentAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    loadAnalytics()
  }, [selectedTimeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Mock analytics data - in production, fetch from API
      const mockAnalytics: AnalyticsData = {
        total_documents: 245,
        documents_by_status: {
          completed: 198,
          processing: 12,
          failed: 8,
          uploading: 3
        },
        documents_by_approval: {
          approved: 156,
          pending: 42,
          flagged: 15,
          rejected: 8
        },
        most_active_students: [
          {
            student_id: "1",
            student_name: "Marco Rossi",
            document_count: 18,
            last_upload: new Date('2024-12-28'),
            total_interactions: 87
          },
          {
            student_id: "2", 
            student_name: "Sofia Bianchi",
            document_count: 15,
            last_upload: new Date('2024-12-27'),
            total_interactions: 72
          },
          {
            student_id: "3",
            student_name: "Luca Verde",
            document_count: 12,
            last_upload: new Date('2024-12-26'),
            total_interactions: 58
          }
        ],
        file_type_distribution: {
          pdf: 134,
          docx: 78,
          txt: 33
        },
        upload_trends: [
          { date: '2024-12-22', count: 8, student_uploads: 8 },
          { date: '2024-12-23', count: 12, student_uploads: 12 },
          { date: '2024-12-24', count: 6, student_uploads: 6 },
          { date: '2024-12-25', count: 3, student_uploads: 3 },
          { date: '2024-12-26', count: 15, student_uploads: 15 },
          { date: '2024-12-27', count: 18, student_uploads: 18 },
          { date: '2024-12-28', count: 22, student_uploads: 22 }
        ],
        engagement_metrics: {
          average_queries_per_document: 3.4,
          most_queried_documents: [
            {
              document_id: "doc1",
              document_title: "Appunti di Matematica",
              student_name: "Marco Rossi",
              query_count: 24
            },
            {
              document_id: "doc2",
              document_title: "Storia del Rinascimento",
              student_name: "Sofia Bianchi", 
              query_count: 19
            }
          ],
          total_ai_interactions: 832
        },
        flagged_content: [
          {
            document_id: "doc3",
            document_title: "Ricerca online copiata",
            student_name: "Alessandro Neri",
            flag_reason: "Possibile plagio",
            flag_date: new Date('2024-12-27')
          }
        ]
      }

      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('it-IT')
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0'
  }

  if (loading) {
    return (
      <div className={twMerge("space-y-6", className)}>
        {/* Loading skeleton */}
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Errore nel caricamento analytics
        </h3>
        <p className="text-gray-600">
          Riprova più tardi o contatta il supporto tecnico
        </p>
      </div>
    )
  }

  return (
    <div className={twMerge("space-y-6", className)}>
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Analytics Documenti</h2>
        
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {[
            { key: 'week', label: 'Settimana' },
            { key: 'month', label: 'Mese' },
            { key: 'quarter', label: 'Trimestre' },
            { key: 'year', label: 'Anno' }
          ].map((range) => (
            <button
              key={range.key}
              onClick={() => setSelectedTimeRange(range.key as any)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedTimeRange === range.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={chartCardStyles()}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documenti Totali</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.total_documents)}</p>
            </div>
            <div className="text-blue-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={chartCardStyles()}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Interazioni AI</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.engagement_metrics.total_ai_interactions)}</p>
            </div>
            <div className="text-green-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={chartCardStyles()}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Media Domande/Doc</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.engagement_metrics.average_queries_per_document}</p>
            </div>
            <div className="text-purple-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={chartCardStyles()}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contenuto Segnalato</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.flagged_content.length}</p>
            </div>
            <div className="text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Trends */}
        <div className={chartCardStyles()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Caricamenti</h3>
          <div className="space-y-3">
            {analytics.upload_trends.slice(-7).map((trend, index) => (
              <div key={trend.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{formatDate(trend.date)}</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="bg-blue-500 h-2 rounded"
                    style={{ width: `${Math.max(4, (trend.count / 25) * 100)}px` }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {trend.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* File Type Distribution */}
        <div className={chartCardStyles()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuzione Tipi File</h3>
          <div className="space-y-4">
            {Object.entries(analytics.file_type_distribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {type === 'pdf' ? '📄' : type === 'docx' ? '📘' : '📝'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {type.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${getPercentage(count, analytics.total_documents)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count} ({getPercentage(count, analytics.total_documents)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Activity and Document Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Students */}
        <div className={chartCardStyles()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Studenti Più Attivi</h3>
          <div className="space-y-3">
            {analytics.most_active_students.map((student, index) => (
              <div key={student.student_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {student.student_name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {student.document_count} documenti • {student.total_interactions} interazioni
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(student.last_upload)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Queried Documents */}
        <div className={chartCardStyles()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documenti Più Utilizzati</h3>
          <div className="space-y-3">
            {analytics.engagement_metrics.most_queried_documents.map((doc, index) => (
              <div key={doc.document_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.document_title}
                  </p>
                  <p className="text-xs text-gray-600">
                    di {doc.student_name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {doc.query_count}
                  </div>
                  <div className="text-xs text-gray-500">
                    domande
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Status */}
        <div className={chartCardStyles()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stato Documenti</h3>
          <div className="space-y-3">
            {Object.entries(analytics.documents_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'completed' ? 'bg-green-500' :
                    status === 'processing' ? 'bg-yellow-500' :
                    status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-sm text-gray-900 capitalize">
                    {status === 'completed' ? 'Completati' :
                     status === 'processing' ? 'In elaborazione' :
                     status === 'failed' ? 'Falliti' : 'In caricamento'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {count} ({getPercentage(count, analytics.total_documents)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Approval Status */}
        <div className={chartCardStyles()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stato Approvazioni</h3>
          <div className="space-y-3">
            {Object.entries(analytics.documents_by_approval).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'approved' ? 'bg-green-500' :
                    status === 'pending' ? 'bg-yellow-500' :
                    status === 'flagged' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm text-gray-900 capitalize">
                    {status === 'approved' ? 'Approvati' :
                     status === 'pending' ? 'In attesa' :
                     status === 'flagged' ? 'Segnalati' : 'Rifiutati'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {count} ({getPercentage(count, analytics.total_documents)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged Content Alert */}
      {analytics.flagged_content.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-red-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-900">
              Contenuto Segnalato ({analytics.flagged_content.length})
            </h3>
          </div>
          
          <div className="space-y-3">
            {analytics.flagged_content.map((item) => (
              <div key={item.document_id} className="bg-white border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">{item.document_title}</p>
                    <p className="text-sm text-red-700">
                      Studente: {item.student_name} • Motivo: {item.flag_reason}
                    </p>
                  </div>
                  <div className="text-xs text-red-600">
                    {formatDate(item.flag_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
