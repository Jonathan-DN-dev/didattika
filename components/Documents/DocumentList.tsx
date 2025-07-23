"use client"

import { useState, useEffect } from "react"
import { Document, DocumentListResponse, TeacherDocumentFilters } from "types/documents"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"
import { DocumentProcessor } from "lib/documents/processor"

const listItemStyles = cva(
  ["bg-white", "border", "border-gray-200", "rounded-lg", "p-4", "hover:shadow-md", "transition-all", "duration-200", "cursor-pointer"],
  {
    variants: {
      selected: {
        true: ["border-didattika-blue", "shadow-md", "bg-blue-50"],
        false: ["hover:border-gray-300"],
      },
      status: {
        completed: ["border-l-4", "border-l-green-500"],
        processing: ["border-l-4", "border-l-yellow-500"],
        failed: ["border-l-4", "border-l-red-500"],
        uploading: ["border-l-4", "border-l-blue-500"],
        deleted: ["opacity-50", "bg-gray-50"],
      },
    },
    defaultVariants: {
      selected: false,
      status: "completed",
    },
  }
)

const statusBadgeStyles = cva(
  ["inline-flex", "items-center", "px-2.5", "py-0.5", "rounded-full", "text-xs", "font-medium"],
  {
    variants: {
      status: {
        completed: ["bg-green-100", "text-green-800"],
        processing: ["bg-yellow-100", "text-yellow-800"],
        failed: ["bg-red-100", "text-red-800"],
        uploading: ["bg-blue-100", "text-blue-800"],
        deleted: ["bg-gray-100", "text-gray-800"],
      },
    },
  }
)

interface DocumentListProps {
  documents?: Document[]
  loading?: boolean
  onDocumentSelect?: (document: Document) => void
  onDocumentDelete?: (documentId: string) => void
  onDocumentPreview?: (document: Document) => void
  selectedDocumentId?: string
  showFilters?: boolean
  className?: string
  viewMode?: 'list' | 'grid'
}

export function DocumentList({
  documents = [],
  loading = false,
  onDocumentSelect,
  onDocumentDelete,
  onDocumentPreview,
  selectedDocumentId,
  showFilters = true,
  className,
  viewMode = 'list'
}: DocumentListProps) {
  const [filters, setFilters] = useState<TeacherDocumentFilters>({})
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAndSortedDocuments = documents
    .filter(doc => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          doc.title.toLowerCase().includes(searchLower) ||
          doc.metadata?.original_filename?.toLowerCase().includes(searchLower) ||
          doc.content_text?.toLowerCase().includes(searchLower) ||
          doc.summary?.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(doc.status)) return false
      }

      // File type filter
      if (filters.file_type && filters.file_type.length > 0) {
        if (!filters.file_type.includes(doc.file_type)) return false
      }

      // Date range filter
      if (filters.date_range) {
        const docDate = new Date(doc.created_at)
        if (docDate < filters.date_range.start || docDate > filters.date_range.end) {
          return false
        }
      }

      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title)
          break
        case 'size':
          comparison = a.file_size - b.file_size
          break
        case 'type':
          comparison = a.file_type.localeCompare(b.file_type)
          break
        case 'date':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const formatFileSize = (bytes: number) => DocumentProcessor.formatFileSize(bytes)

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completato'
      case 'processing': return 'Elaborazione'
      case 'failed': return 'Errore'
      case 'uploading': return 'Caricamento'
      case 'deleted': return 'Eliminato'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className={twMerge("space-y-4", className)}>
        {/* Loading skeleton */}
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              </div>
              <div className="w-20 h-6 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={twMerge("space-y-6", className)}>
      {/* Filters and Search */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cerca documenti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-didattika-blue focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Sort By */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Ordina per:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-didattika-blue focus:border-transparent"
              >
                <option value="date">Data</option>
                <option value="name">Nome</option>
                <option value="size">Dimensione</option>
                <option value="type">Tipo</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            {/* File Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Tipo:</label>
              <select
                value={filters.file_type?.[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  file_type: e.target.value ? [e.target.value] : undefined
                }))}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-didattika-blue focus:border-transparent"
              >
                <option value="">Tutti</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="txt">TXT</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Stato:</label>
              <select
                value={filters.status?.[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  status: e.target.value ? [e.target.value as any] : undefined
                }))}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-didattika-blue focus:border-transparent"
              >
                <option value="">Tutti</option>
                <option value="completed">Completato</option>
                <option value="processing">Elaborazione</option>
                <option value="failed">Errore</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || filters.file_type || filters.status) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilters({})
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Cancella filtri
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredAndSortedDocuments.length} di {documents.length} documenti
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {/* Toggle view mode */}}
            className="p-2 text-gray-400 hover:text-gray-600 rounded"
            title="Cambia visualizzazione"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Document List */}
      {filteredAndSortedDocuments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun documento trovato
          </h3>
          <p className="text-gray-600">
            {searchTerm || Object.keys(filters).length > 0
              ? "Prova a modificare i filtri di ricerca"
              : "Carica il tuo primo documento per iniziare"
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
          {filteredAndSortedDocuments.map((document) => (
            <div
              key={document.id}
              className={twMerge(
                listItemStyles({ 
                  selected: selectedDocumentId === document.id,
                  status: document.status
                })
              )}
              onClick={() => onDocumentSelect?.(document)}
            >
              <div className="flex items-start gap-4">
                {/* File Icon */}
                <div className="text-3xl flex-shrink-0">
                  {getFileIcon(document.file_type)}
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {document.title}
                    </h3>
                    <span className={twMerge(statusBadgeStyles({ status: document.status }))}>
                      {getStatusText(document.status)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-4">
                      <span>{document.file_type.toUpperCase()}</span>
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>{formatDate(document.created_at)}</span>
                    </div>
                    
                    {document.metadata && (
                      <div className="flex items-center gap-4">
                        {document.metadata.word_count && (
                          <span>📊 {document.metadata.word_count} parole</span>
                        )}
                        {document.metadata.pages && (
                          <span>📖 {document.metadata.pages} pagine</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {document.summary && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {document.summary}
                    </p>
                  )}

                  {/* Teacher Notes */}
                  {document.teacher_notes && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                      <span className="font-medium text-yellow-800">Nota docente:</span>
                      <span className="text-yellow-700 ml-1">{document.teacher_notes}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  {onDocumentPreview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDocumentPreview(document)
                      }}
                      className="p-2 text-gray-400 hover:text-didattika-blue rounded transition-colors"
                      title="Anteprima"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  )}

                  {onDocumentDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Sei sicuro di voler eliminare questo documento?')) {
                          onDocumentDelete(document.id)
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 rounded transition-colors"
                      title="Elimina"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
