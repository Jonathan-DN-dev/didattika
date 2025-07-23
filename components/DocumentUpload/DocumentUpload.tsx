"use client"

import { useState, useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

const uploadStyles = cva(
  ["border-2", "border-dashed", "rounded-lg", "p-6", "text-center", "transition-colors", "cursor-pointer"],
  {
    variants: {
      state: {
        idle: ["border-gray-300", "hover:border-didattika-blue", "hover:bg-blue-50"],
        dragover: ["border-didattika-blue", "bg-blue-50"],
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

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadDate: Date
  status: "processing" | "ready" | "error"
  summary?: string
}

interface DocumentUploadProps extends VariantProps<typeof uploadStyles> {
  className?: string
  onFileProcessed?: (file: UploadedFile) => void
}

export function DocumentUpload({ className, onFileProcessed }: DocumentUploadProps) {
  const [uploadState, setUploadState] = useState<"idle" | "dragover" | "uploading" | "success" | "error">("idle")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragCounter, setDragCounter] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = [
    "application/pdf",
    "text/plain", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword"
  ]

  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: "Formato file non supportato. Usa PDF, TXT o DOCX." 
      }
    }
    
    if (file.size > maxFileSize) {
      return { 
        valid: false, 
        error: "File troppo grande. Dimensione massima: 10MB." 
      }
    }
    
    return { valid: true }
  }

  const processFile = async (file: File): Promise<UploadedFile> => {
    setUploadState("uploading")
    
    const uploadedFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      status: "processing"
    }

    setUploadedFiles(prev => [...prev, uploadedFile])

    try {
      // Simulate file processing API call
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
      
      // Simulate AI content analysis
      const mockSummaries = [
        "Questo documento contiene materiale didattico su matematica avanzata, con focus su calcolo differenziale e integrali.",
        "Documento di storia contemporanea che tratta la Prima Guerra Mondiale e le sue conseguenze socio-politiche.",
        "Materiale di scienze naturali che spiega il ciclo dell'acqua e i fenomeni meteorologici.",
        "Appunti di letteratura italiana con analisi di opere del Novecento e tecniche narrative.",
        "Documento di geografia fisica che descrive la formazione delle montagne e i processi geologici."
      ]

      const processedFile: UploadedFile = {
        ...uploadedFile,
        status: "ready",
        summary: mockSummaries[Math.floor(Math.random() * mockSummaries.length)]
      }

      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? processedFile : f)
      )

      setUploadState("success")
      onFileProcessed?.(processedFile)

      // Reset state after 2 seconds
      setTimeout(() => setUploadState("idle"), 2000)

      return processedFile

    } catch (error) {
      const errorFile: UploadedFile = {
        ...uploadedFile,
        status: "error"
      }

      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? errorFile : f)
      )

      setUploadState("error")
      setTimeout(() => setUploadState("idle"), 3000)

      throw error
    }
  }

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files)
    
    for (const file of fileArray) {
      const validation = validateFile(file)
      
      if (!validation.valid) {
        alert(validation.error)
        continue
      }

      try {
        await processFile(file)
      } catch (error) {
        console.error("Error processing file:", error)
        alert("Errore durante l'elaborazione del file. Riprova.")
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(0)
    setUploadState("idle")
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(prev => prev + 1)
    setUploadState("dragover")
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(prev => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setUploadState("idle")
      }
      return newCounter
    })
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFiles(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const getStateIcon = () => {
    switch (uploadState) {
      case "uploading":
        return (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-didattika-yellow mx-auto"></div>
        )
      case "success":
        return (
          <svg className="w-8 h-8 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "error":
        return (
          <svg className="w-8 h-8 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )
    }
  }

  const getStateText = () => {
    switch (uploadState) {
      case "uploading":
        return "Caricamento e analisi in corso..."
      case "success":
        return "File caricato e analizzato con successo!"
      case "error":
        return "Errore durante il caricamento. Riprova."
      case "dragover":
        return "Rilascia i file qui"
      default:
        return "Trascina i tuoi documenti qui o clicca per selezionarli"
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={twMerge(uploadStyles({ state: uploadState }), className)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {getStateIcon()}
        <p className="mt-2 text-sm text-gray-600 font-medium">
          {getStateText()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF, TXT, DOCX (max 10MB)
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.docx,.doc"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">File caricati</h3>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-2 h-2 rounded-full ${
                  file.status === "ready" ? "bg-green-500" :
                  file.status === "processing" ? "bg-yellow-500" : "bg-red-500"
                }`} />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString("it-IT")}
                  </p>
                  {file.summary && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{file.summary}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {file.status === "processing" && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-didattika-blue"></div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
