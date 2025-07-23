"use client"

import { useState, useEffect } from "react"
import { 
  TeacherDocument, 
  TeacherDocumentFilters, 
  TeacherDashboardStats,
  DocumentApprovalAction 
} from "types/teacher-documents"
import { DocumentList } from "components/Documents/DocumentList"
import { DocumentPreview } from "components/Documents/DocumentPreview"
import { TeacherDocumentAnalytics } from "./TeacherDocumentAnalytics"
import { DocumentApprovalPanel } from "./DocumentApprovalPanel"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

const statsCardStyles = cva(
  ["bg-white", "rounded-xl", "p-6", "border", "border-gray-200", "hover:shadow-md", "transition-shadow"],
  {
    variants: {
      status: {
        neutral: ["border-gray-200"],
        warning: ["border-yellow-300", "bg-yellow-50"],
        danger: ["border-red-300", "bg-red-50"],
        success: ["border-green-300", "bg-green-50"],
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  }
)

interface TeacherDocumentDashboardProps {
  className?: string
}

export function TeacherDocumentDashboard({ className }: TeacherDocumentDashboardProps) {
  const [documents, setDocuments] = useState<TeacherDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TeacherDocumentFilters>({})
  const [selectedDocument, setSelectedDocument] = useState<TeacherDocument | null>(null)
  const [showDocumentPreview, setShowDocumentPreview] = useState(false)
  const [showApprovalPanel, setShowApprovalPanel] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<TeacherDashboardStats>({
    students_count: 0,
    total_documents: 0,
    pending_reviews: 0,
    flagged_content: 0,
    this_week_uploads: 0,
    ai_interactions: 0
  })
  const [activeView, setActiveView] = useState<'overview' | 'documents' | 'analytics' | 'approvals'>('overview')

  useEffect(() => {
    loadDashboardData()
  }, [filters])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load dashboard stats
      const statsResponse = await fetch('/api/teacher/dashboard/stats')
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        setDashboardStats(stats)
      }

      // Load documents
      const documentsResponse = await fetch('/api/teacher/documents?' + new URLSearchParams({
        ...filters,
        page: '1',
        limit: '50'
      }))
      
      if (documentsResponse.ok) {
        const data = await documentsResponse.json()
        setDocuments(data.documents)
      }

    } catch (error) {
      console.error('Error loading teacher dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentApproval = async (action: DocumentApprovalAction) => {
    try {
      const response = await fetch(`/api/teacher/documents/${action.document_id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action)
      })

      if (response.ok) {
        // Update document in local state
        setDocuments(prev => prev.map(doc => 
          doc.id === action.document_id 
            ? { ...doc, approval_status: action.action === 'approve' ? 'approved' : action.action === 'flag' ? 'flagged' : 'rejected' }
            : doc
        ))
        
        // Update stats
        setDashboardStats(prev => ({
          ...prev,
          pending_reviews: prev.pending_reviews - 1,
          flagged_content: action.action === 'flag' ? prev.flagged_content + 1 : prev.flagged_content
        }))
      }
    } catch (error) {
      console.error('Error processing document approval:', error)
    }
  }

  const handleDocumentSelect = (document: TeacherDocument) => {
    setSelectedDocument(document)
    setShowDocumentPreview(true)
  }

  const handleBulkAction = async (documentIds: string[], action: string) => {
    try {
      const response = await fetch('/api/teacher/documents/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_ids: documentIds, action })
      })

      if (response.ok) {
        await loadDashboardData() // Reload data
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('it-IT')
  }

  const getStatsTrend = (current: number, previous: number) => {
    if (previous === 0) return null
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0
    }
  }

  return (
    <div className={twMerge("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Documenti</h1>
          <p className="text-gray-600 mt-1">
            Monitora e gestisci i documenti caricati dai tuoi studenti
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnalytics(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </button>
          
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Esporta
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { key: 'overview', label: '📊 Panoramica', count: null },
            { key: 'documents', label: '📁 Documenti', count: dashboardStats.total_documents },
            { key: 'approvals', label: '✅ Approvazioni', count: dashboardStats.pending_reviews },
            { key: 'analytics', label: '📈 Analytics', count: null }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeView === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="bg-gray-100 text-gray-800 text-xs rounded-full px-2 py-1">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={statsCardStyles({ status: "neutral" })}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Studenti Attivi</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.students_count)}</p>
                </div>
                <div className="text-blue-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={statsCardStyles({ status: "neutral" })}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documenti Totali</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.total_documents)}</p>
                </div>
                <div className="text-green-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={statsCardStyles({ status: dashboardStats.pending_reviews > 0 ? "warning" : "neutral" })}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Attesa di Revisione</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.pending_reviews)}</p>
                </div>
                <div className="text-yellow-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={statsCardStyles({ status: dashboardStats.flagged_content > 0 ? "danger" : "neutral" })}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contenuto Segnalato</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.flagged_content)}</p>
                </div>
                <div className="text-red-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Recente</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {dashboardStats.this_week_uploads} nuovi documenti questa settimana
                    </p>
                    <p className="text-xs text-gray-600">Caricati dai tuoi studenti</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {dashboardStats.ai_interactions} interazioni AI
                    </p>
                    <p className="text-xs text-gray-600">Domande poste sui documenti</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveView('approvals')}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="text-yellow-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Rivedi documenti in attesa</p>
                    <p className="text-sm text-gray-600">{dashboardStats.pending_reviews} documenti da approvare</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveView('analytics')}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="text-blue-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Visualizza analytics dettagliati</p>
                    <p className="text-sm text-gray-600">Engagement e utilizzo documenti</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeView === 'documents' && (
        <div>
          <DocumentList
            documents={documents.map(doc => ({
              ...doc,
              // Convert TeacherDocument to Document for compatibility
            }))}
            loading={loading}
            onDocumentSelect={handleDocumentSelect}
            onDocumentPreview={handleDocumentSelect}
            selectedDocumentId={selectedDocument?.id}
            showFilters={true}
            viewMode="list"
          />
        </div>
      )}

      {/* Approvals Tab */}
      {activeView === 'approvals' && (
        <DocumentApprovalPanel
          documents={documents.filter(doc => doc.approval_status === 'pending')}
          onApprovalAction={handleDocumentApproval}
          onBulkAction={handleBulkAction}
        />
      )}

      {/* Analytics Tab */}
      {activeView === 'analytics' && (
        <TeacherDocumentAnalytics />
      )}

      {/* Document Preview Modal */}
      {showDocumentPreview && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <DocumentPreview
              document={selectedDocument}
              onClose={() => setShowDocumentPreview(false)}
              size="full"
              showActions={true}
              showMetadata={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}
