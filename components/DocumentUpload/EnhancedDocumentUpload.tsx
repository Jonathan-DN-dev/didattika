"use client"

import { useState, useRef, useCallback } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"
import { DocumentProcessor } from "lib/documents/processor"
import { 
  Document, 
  DocumentProcessingStatus, 
  UploadValidationResult 
} from "types/documents"

const uploadZoneStyles = cva(
  ["border-2", "border-dashed", "rounded-xl", "p-8", "text-center", "transition-all", "duration-300", "cursor-pointer", "relative", "overflow-hidden"],
  {
    variants: {
      state: {
        idle: ["border-gray-300", "hover:border-didattika-blue", "hover:bg-blue-50", "hover:shadow-md"],
        dragover: ["border-didattika-blue", "bg-blue-50", "shadow-lg", "scale-105"],
        uploading: ["border-didattika-yellow", "bg-yellow-50"],
        success: ["border-green-500", "bg-green-50"],
        error: ["border-red-500", "bg-red-50"],
      },
    },
    defaultVariants: {
      state: "idle",
    },
  }
)

const progressBarStyles = cva(
  ["absolute", "bottom-0", "left-0", "h-1", "transition-all", "duration-300"],
  {
    variants: {
      status: {
        uploading: ["bg-didattika-yellow"],
        processing: ["bg-didattika-blue"],
        completed: ["bg-green-500"],
        failed: ["bg-red-500"],
      },
    },
  }
)

interface ProcessingDocument extends Document {
  file: File
  processingStatus: DocumentProcessingStatus
  validationResult?: UploadValidationResult
}

interface EnhancedDocumentUploadProps extends VariantProps<typeof uploadZoneStyles> {
  className?: string
  maxFiles?: number
  onFileProcessed?: (document: Document) => void
  onProcessingUpdate?: (status: DocumentProcessingStatus) => void
  allowMultiple?: boolean
}

export function EnhancedDocumentUpload({ 
  className,
  maxFiles = 10,
  onFileProcessed,
  onProcessingUpdate,
  allowMultiple = true
}: EnhancedDocumentUploadProps) {
  const [uploadState, setUploadState] = useState<"idle" | "dragover" | "uploading" | "success" | "error">("idle")
  const [processingDocuments, setProcessingDocuments] = useState<ProcessingDocument[]>([])
  const [dragCounter, setDragCounter] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback((files: FileList): { valid: File[]; invalid: Array<{ file: File; errors: string[] }> } => {
    const valid: File[] = []
    const invalid: Array<{ file: File; errors: string[] }> = []

    Array.from(files).forEach(file => {
      const validation = DocumentProcessor.validateFile(file)
      
      if (validation.valid) {
        valid.push(file)
      } else {
        invalid.push({ file, errors: validation.errors })
      }
    })

    return { valid, invalid }
  }, [])

  const processDocument = useCallback(async (file: File): Promise<void> => {
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Create initial processing document
    const processingDoc: ProcessingDocument = {
      id: documentId,
      user_id: 'current-user', // In production, get from auth context
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      file_path: '', // Will be set after upload
      file_type: DocumentProcessor.getFileType(file) as 'pdf' | 'txt' | 'docx',
      file_size: file.size,
      status: 'uploading',
      created_at: new Date(),
      updated_at: new Date(),
      file,
      processingStatus: DocumentProcessor.createProcessingStatus(
        documentId,
        'uploading',
        0,
        'Preparazione upload...'
      )
    }

    setProcessingDocuments(prev => [...prev, processingDoc])

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const status = DocumentProcessor.createProcessingStatus(
          documentId,
          'uploading',
          progress,
          `Upload in corso... ${progress}%`
        )
        
        updateDocumentStatus(documentId, status)
        onProcessingUpdate?.(status)
      }

      // Start processing
      const processingStatus = DocumentProcessor.createProcessingStatus(
        documentId,
        'processing',
        0,
        'Estrazione contenuto in corso...'
      )
      
      updateDocumentStatus(documentId, processingStatus)
      onProcessingUpdate?.(processingStatus)

      // Process the document
      const result = await DocumentProcessor.processDocument(file)
      
      if (result.success && result.document) {
        // Generate summary
        const summary = await DocumentProcessor.generateSummary(result.document.text)
        
        // Complete processing
        const completedStatus = DocumentProcessor.createProcessingStatus(
          documentId,
          'completed',
          100,
          'Documento elaborato con successo!'
        )

        const completedDoc: Document = {
          ...processingDoc,
          status: 'completed',
          content_text: result.document.text,
          summary,
          metadata: result.document.metadata,
          updated_at: new Date()
        }

        // Update state
        setProcessingDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, ...completedDoc, processingStatus: completedStatus }
              : doc
          )
        )

        updateDocumentStatus(documentId, completedStatus)
        onProcessingUpdate?.(completedStatus)
        onFileProcessed?.(completedDoc)

        // In production, save to database via API
        // await fetch('/api/documents', { method: 'POST', body: JSON.stringify(completedDoc) })

      } else {
        throw new Error(result.error || 'Processing failed')
      }

    } catch (error) {
      console.error('Document processing error:', error)
      
      const errorStatus = DocumentProcessor.createProcessingStatus(
        documentId,
        'failed',
        0,
        `Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
      )

      setProcessingDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'failed', processingStatus: errorStatus }
            : doc
        )
      )

      updateDocumentStatus(documentId, errorStatus)
      onProcessingUpdate?.(errorStatus)
    }
  }, [onFileProcessed, onProcessingUpdate])

  const updateDocumentStatus = useCallback((documentId: string, status: DocumentProcessingStatus) => {
    setProcessingDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, processingStatus: status }
          : doc
      )
    )
  }, [])

  const handleFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return

    // Check max files limit
    if (processingDocuments.length + files.length > maxFiles) {
      alert(`Puoi caricare massimo ${maxFiles} file. Attualmente ne hai ${processingDocuments.length}.`)
      return
    }

    const { valid, invalid } = validateFiles(files)

    // Show validation errors
    if (invalid.length > 0) {
      const errorMessages = invalid.map(({ file, errors }) => 
        `${file.name}: ${errors.join(', ')}`
      ).join('\n')
      
      alert(`Alcuni file non sono validi:\n\n${errorMessages}`)
    }

    // Process valid files
    if (valid.length > 0) {
      setUploadState("uploading")
      
      try {
        // Process files sequentially to avoid overwhelming the system
        for (const file of valid) {
          await processDocument(file)
        }
        
        setUploadState("success")
        setTimeout(() => setUploadState("idle"), 2000)
        
      } catch (error) {
        setUploadState("error")
        setTimeout(() => setUploadState("idle"), 3000)
      }
    }
  }, [processingDocuments.length, maxFiles, validateFiles, processDocument])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(0)
    setUploadState("idle")
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(prev => prev + 1)
    setUploadState("dragover")
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(prev => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setUploadState("idle")
      }
      return newCounter
    })
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFiles(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [handleFiles])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const removeDocument = useCallback((documentId: string) => {
    setProcessingDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }, [])

  const retryProcessing = useCallback(async (documentId: string) => {
    const doc = processingDocuments.find(d => d.id === documentId)
    if (doc) {
      await processDocument(doc.file)
    }
  }, [processingDocuments, processDocument])

  const getStateIcon = () => {
    switch (uploadState) {
      case "uploading":
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-didattika-yellow border-t-transparent mx-auto"></div>
        )
      case "success":
        return (
          <svg className="w-12 h-12 text-green-500 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "error":
        return (
          <svg className="w-12 h-12 text-red-500 mx-auto animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case "dragover":
        return (
          <svg className="w-12 h-12 text-didattika-blue mx-auto animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l3 3m0 0l3-3m-3 3V9" />
          </svg>
        )
      default:
        return (
          <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )
    }
  }

  const getStateText = () => {
    switch (uploadState) {
      case "uploading":
        return "Caricamento e elaborazione in corso..."
      case "success":
        return "Documenti elaborati con successo!"
      case "error":
        return "Errore durante l'elaborazione. Riprova."
      case "dragover":
        return "Rilascia i documenti qui"
      default:
        return allowMultiple 
          ? "Trascina i tuoi documenti qui o clicca per selezionarli"
          : "Trascina il tuo documento qui o clicca per selezionarlo"
    }
  }

  const formatFileSize = (bytes: number) => DocumentProcessor.formatFileSize(bytes)

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className={twMerge(uploadZoneStyles({ state: uploadState }), className)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {getStateIcon()}
        
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {getStateText()}
        </h3>
        
        <p className="text-sm text-gray-600 mt-2">
          Formati supportati: PDF, TXT, DOCX
        </p>
        
        <p className="text-xs text-gray-500 mt-1">
          Dimensione massima: 10MB per file • Massimo {maxFiles} file
        </p>

        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            📄 PDF
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            📝 TXT
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            📘 DOCX
          </span>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept=".pdf,.txt,.docx,.doc"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Processing Documents List */}
      {processingDocuments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Documenti ({processingDocuments.length}/{maxFiles})
            </h3>
            {processingDocuments.some(doc => doc.status === 'completed') && (
              <button className="text-sm text-didattika-blue hover:text-blue-700 font-medium">
                Gestisci tutti
              </button>
            )}
          </div>
          
          <div className="grid gap-4">
            {processingDocuments.map((doc) => (
              <div 
                key={doc.id} 
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">
                        {doc.file_type === 'pdf' ? '📄' : 
                         doc.file_type === 'docx' ? '📘' : '📝'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(doc.file_size)} • {doc.file_type.toUpperCase()}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        doc.status === 'completed' ? 'bg-green-500' :
                        doc.status === 'processing' || doc.status === 'uploading' ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} />
                    </div>

                    {/* Progress Bar */}
                    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                      <div 
                        className={twMerge(
                          progressBarStyles({ 
                            status: doc.status === 'uploading' ? 'uploading' :
                                   doc.status === 'processing' ? 'processing' :
                                   doc.status === 'completed' ? 'completed' : 'failed'
                          })
                        )}
                        style={{ width: `${doc.processingStatus.progress}%` }}
                      />
                    </div>

                    {/* Status Message */}
                    <p className="text-xs text-gray-600 mb-2">
                      {doc.processingStatus.message}
                    </p>

                    {/* Summary (if available) */}
                    {doc.summary && (
                      <div className="bg-blue-50 rounded-lg p-3 mt-3">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          📋 Riassunto automatico:
                        </p>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          {doc.summary}
                        </p>
                      </div>
                    )}

                    {/* Metadata (if available) */}
                    {doc.metadata && (
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                        {doc.metadata.word_count && (
                          <span>📊 {doc.metadata.word_count} parole</span>
                        )}
                        {doc.metadata.pages && (
                          <span>📖 {doc.metadata.pages} pagine</span>
                        )}
                        {doc.metadata.language && (
                          <span>🌐 {doc.metadata.language.toUpperCase()}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {doc.status === 'failed' && (
                      <button
                        onClick={() => retryProcessing(doc.id)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Riprova elaborazione"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Rimuovi documento"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Integration Note */}
      {processingDocuments.some(doc => doc.status === 'completed') && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🤖</div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                I tuoi documenti sono pronti!
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Ora puoi fare domande specifiche sui contenuti caricati usando l'AI chat. 
                L'assistente utilizzerà i tuoi documenti per fornire risposte contestuali e personalizzate.
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Inizia a chattare con l'AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
