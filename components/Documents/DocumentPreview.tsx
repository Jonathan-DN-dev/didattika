"use client"

import { useState, useEffect } from "react"
import { Document } from "types/documents"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"
import { DocumentProcessor } from "lib/documents/processor"

const previewStyles = cva(
  ["bg-white", "border", "border-gray-200", "rounded-xl", "overflow-hidden"],
  {
    variants: {
      size: {
        sm: ["max-w-md"],
        md: ["max-w-2xl"],
        lg: ["max-w-4xl"],
        full: ["w-full"],
      },
    },
    defaultVariants: {
      size: "lg",
    },
  }
)

interface DocumentPreviewProps extends VariantProps<typeof previewStyles> {
  document: Document
  onClose?: () => void
  onAskQuestion?: (question: string) => void
  className?: string
  showActions?: boolean
  showMetadata?: boolean
}

export function DocumentPreview({
  document,
  onClose,
  onAskQuestion,
  className,
  size,
  showActions = true,
  showMetadata = true
}: DocumentPreviewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'summary' | 'metadata'>('content')
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedContent, setHighlightedContent] = useState('')
  const [questionInput, setQuestionInput] = useState('')

  useEffect(() => {
    if (document.content_text) {
      if (searchTerm) {
        // Simple highlighting
        const regex = new RegExp(`(${searchTerm})`, 'gi')
        const highlighted = document.content_text.replace(
          regex, 
          '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
        )
        setHighlightedContent(highlighted)
      } else {
        setHighlightedContent(document.content_text)
      }
    }
  }, [document.content_text, searchTerm])

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

  const handleAskQuestion = () => {
    if (questionInput.trim() && onAskQuestion) {
      onAskQuestion(questionInput.trim())
      setQuestionInput('')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Testo copiato negli appunti')
    })
  }

  const downloadDocument = () => {
    // In production, this would trigger a download from the server
    console.log('Download documento:', document.id)
  }

  return (
    <div className={twMerge(previewStyles({ size }), className)}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {getFileIcon(document.file_type)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {document.title}
              </h2>
              <p className="text-sm text-gray-600">
                {document.file_type.toUpperCase()} • {formatFileSize(document.file_size)} • {formatDate(document.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showActions && (
              <>
                <button
                  onClick={() => copyToClipboard(document.content_text || '')}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Copia contenuto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={downloadDocument}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Scarica"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Cerca nel documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-didattika-blue focus:border-transparent"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'content'
                ? 'border-didattika-blue text-didattika-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📄 Contenuto
          </button>
          
          {document.summary && (
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'summary'
                  ? 'border-didattika-blue text-didattika-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Riassunto
            </button>
          )}
          
          {showMetadata && (
            <button
              onClick={() => setActiveTab('metadata')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'metadata'
                  ? 'border-didattika-blue text-didattika-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Dettagli
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto max-h-96">
        {activeTab === 'content' && (
          <div className="p-6">
            {document.content_text ? (
              <div 
                className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: highlightedContent }}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📄</div>
                <p>Contenuto non disponibile o in elaborazione</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'summary' && document.summary && (
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">🤖 Riassunto automatico</h3>
              <p className="text-blue-800 leading-relaxed">
                {document.summary}
              </p>
            </div>
            
            {/* Key points extraction */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">📌 Punti chiave</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-didattika-blue rounded-full mt-2 flex-shrink-0"></span>
                  <span>Documento elaborato con successo dall'AI</span>
                </div>
                {document.metadata?.word_count && (
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-didattika-blue rounded-full mt-2 flex-shrink-0"></span>
                    <span>Contenuto: {document.metadata.word_count} parole</span>
                  </div>
                )}
                {document.metadata?.pages && (
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-didattika-blue rounded-full mt-2 flex-shrink-0"></span>
                    <span>Lunghezza: {document.metadata.pages} pagine</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">📋 Informazioni base</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nome file:</span>
                  <p className="text-gray-600">{document.metadata?.original_filename || document.title}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <p className="text-gray-600">{document.file_type.toUpperCase()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Dimensione:</span>
                  <p className="text-gray-600">{formatFileSize(document.file_size)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Caricato:</span>
                  <p className="text-gray-600">{formatDate(document.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Processing Info */}
            {document.metadata && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">⚙️ Elaborazione</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {document.metadata.word_count && (
                    <div>
                      <span className="font-medium text-gray-700">Parole:</span>
                      <p className="text-gray-600">{document.metadata.word_count.toLocaleString()}</p>
                    </div>
                  )}
                  {document.metadata.pages && (
                    <div>
                      <span className="font-medium text-gray-700">Pagine:</span>
                      <p className="text-gray-600">{document.metadata.pages}</p>
                    </div>
                  )}
                  {document.metadata.language && (
                    <div>
                      <span className="font-medium text-gray-700">Lingua:</span>
                      <p className="text-gray-600">{document.metadata.language.toUpperCase()}</p>
                    </div>
                  )}
                  {document.metadata.extraction_method && (
                    <div>
                      <span className="font-medium text-gray-700">Metodo:</span>
                      <p className="text-gray-600">{document.metadata.extraction_method}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">📊 Stato</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Stato elaborazione:</span>
                  <p className="text-gray-600 capitalize">{document.status}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Ultimo aggiornamento:</span>
                  <p className="text-gray-600">{formatDate(document.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Teacher Notes */}
            {document.teacher_notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">👨‍🏫 Note docente</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">{document.teacher_notes}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Questions Section */}
      {onAskQuestion && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-lg">🤖</div>
            <h3 className="font-semibold text-gray-900">Fai una domanda su questo documento</h3>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cosa vuoi sapere su questo documento?"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-didattika-blue focus:border-transparent"
            />
            <button
              onClick={handleAskQuestion}
              disabled={!questionInput.trim()}
              className="px-4 py-2 bg-didattika-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Chiedi
            </button>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            {['Riassumi i punti principali', 'Quali sono i concetti chiave?', 'Spiegami questo argomento'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuestionInput(suggestion)}
                className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
