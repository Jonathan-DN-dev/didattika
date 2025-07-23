"use client"

import { useState } from "react"
import { TeacherDocument, DocumentApprovalAction } from "types/teacher-documents"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

const approvalCardStyles = cva(
  ["bg-white", "border", "rounded-xl", "p-4", "transition-all", "duration-200"],
  {
    variants: {
      selected: {
        true: ["border-blue-500", "bg-blue-50", "shadow-md"],
        false: ["border-gray-200", "hover:border-gray-300", "hover:shadow-sm"],
      },
      status: {
        pending: ["border-l-4", "border-l-yellow-500"],
        flagged: ["border-l-4", "border-l-red-500"],
        approved: ["border-l-4", "border-l-green-500"],
        rejected: ["border-l-4", "border-l-gray-500"],
      },
    },
    defaultVariants: {
      selected: false,
      status: "pending",
    },
  }
)

interface DocumentApprovalPanelProps {
  documents: TeacherDocument[]
  onApprovalAction: (action: DocumentApprovalAction) => void
  onBulkAction: (documentIds: string[], action: string) => void
  className?: string
}

export function DocumentApprovalPanel({
  documents,
  onApprovalAction,
  onBulkAction,
  className
}: DocumentApprovalPanelProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'flagged'>('pending')

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true
    if (filter === 'pending') return doc.approval_status === 'pending'
    if (filter === 'flagged') return doc.approval_status === 'flagged'
    return true
  })

  const handleDocumentSelect = (documentId: string) => {
    const newSelected = new Set(selectedDocuments)
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId)
    } else {
      newSelected.add(documentId)
    }
    setSelectedDocuments(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const handleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.id)))
      setShowBulkActions(true)
    }
  }

  const handleApprovalAction = (documentId: string, action: 'approve' | 'flag' | 'reject', reason?: string) => {
    const actionData: DocumentApprovalAction = {
      document_id: documentId,
      action,
      reason,
      feedback: feedbackText || undefined
    }
    
    onApprovalAction(actionData)
    setFeedbackText("")
    setActiveDocumentId(null)
    
    // Remove from selection if it was selected
    const newSelected = new Set(selectedDocuments)
    newSelected.delete(documentId)
    setSelectedDocuments(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const handleBulkApproval = (action: string) => {
    onBulkAction(Array.from(selectedDocuments), action)
    setSelectedDocuments(new Set())
    setShowBulkActions(false)
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return '📄'
      case 'docx': return '📘'
      case 'txt': return '📝'
      default: return '📎'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'approved': return 'text-green-700 bg-green-100'
      case 'flagged': return 'text-red-700 bg-red-100'
      case 'rejected': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  if (filteredDocuments.length === 0) {
    return (
      <div className={twMerge("text-center py-12", className)}>
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Tutto a posto!
        </h3>
        <p className="text-gray-600">
          {filter === 'pending' ? 
            "Non ci sono documenti in attesa di approvazione." :
            "Nessun documento trovato per il filtro selezionato."
          }
        </p>
      </div>
    )
  }

  return (
    <div className={twMerge("space-y-6", className)}>
      {/* Header with filters and bulk actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Approvazione Documenti
          </h2>
          
          {/* Filter buttons */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {[
              { key: 'pending', label: 'In attesa', count: documents.filter(d => d.approval_status === 'pending').length },
              { key: 'flagged', label: 'Segnalati', count: documents.filter(d => d.approval_status === 'flagged').length },
              { key: 'all', label: 'Tutti', count: documents.length }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>

        {/* Bulk selection */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {selectedDocuments.size === filteredDocuments.length ? 'Deseleziona tutto' : 'Seleziona tutto'}
          </button>
          
          {selectedDocuments.size > 0 && (
            <span className="text-sm text-gray-600">
              {selectedDocuments.size} selezionati
            </span>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              {selectedDocuments.size} documenti selezionati
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkApproval('approve')}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approva tutti
              </button>
              
              <button
                onClick={() => handleBulkApproval('flag')}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                Segnala tutti
              </button>
              
              <button
                onClick={() => {
                  setSelectedDocuments(new Set())
                  setShowBulkActions(false)
                }}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.map((document) => (
          <div
            key={document.id}
            className={twMerge(
              approvalCardStyles({ 
                selected: selectedDocuments.has(document.id),
                status: document.approval_status
              })
            )}
          >
            <div className="flex items-start gap-4">
              {/* Selection checkbox */}
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={selectedDocuments.has(document.id)}
                  onChange={() => handleDocumentSelect(document.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              {/* File icon */}
              <div className="text-2xl flex-shrink-0">
                {getFileIcon(document.file_type)}
              </div>

              {/* Document info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {document.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.approval_status)}`}>
                    {document.approval_status === 'pending' ? 'In attesa' :
                     document.approval_status === 'approved' ? 'Approvato' :
                     document.approval_status === 'flagged' ? 'Segnalato' : 'Rifiutato'}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-4">
                    <span>👤 {document.student_name}</span>
                    <span>📅 {formatDate(document.created_at)}</span>
                    <span>📊 {document.file_size} bytes</span>
                    <span>🔄 {document.interaction_count} interazioni</span>
                  </div>
                  
                  {document.course_name && (
                    <div>📚 Corso: {document.course_name}</div>
                  )}
                </div>

                {/* Document summary */}
                {document.summary && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                    {document.summary}
                  </p>
                )}

                {/* Teacher feedback */}
                {document.teacher_feedback && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <span className="font-medium text-blue-800">Nota:</span>
                    <span className="text-blue-700 ml-1">{document.teacher_feedback}</span>
                  </div>
                )}

                {/* Feedback input for active document */}
                {activeDocumentId === document.id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Aggiungi un commento o feedback (opzionale)..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {activeDocumentId === document.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprovalAction(document.id, 'approve')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approva
                    </button>
                    
                    <button
                      onClick={() => handleApprovalAction(document.id, 'flag', 'Contenuto da rivedere')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                      Segnala
                    </button>
                    
                    <button
                      onClick={() => handleApprovalAction(document.id, 'reject', 'Contenuto non appropriato')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Rifiuta
                    </button>
                    
                    <button
                      onClick={() => setActiveDocumentId(null)}
                      className="px-2 py-1.5 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annulla
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveDocumentId(document.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Rivedi
                    </button>
                    
                    <button
                      onClick={() => {/* Open preview */}}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                      title="Anteprima"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
