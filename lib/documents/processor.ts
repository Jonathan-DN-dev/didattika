import { PDFParser } from './pdf-parser'
import { DOCXParser } from './docx-parser'
import { TXTParser } from './txt-parser'
import { 
  Document, 
  DocumentMetadata, 
  DocumentContent, 
  DocumentProcessingStatus,
  UploadValidationResult
} from 'types/documents'

export interface ProcessingResult {
  success: boolean
  document?: {
    text: string
    metadata: DocumentMetadata
    chunks: DocumentContent[]
  }
  error?: string
}

export class DocumentProcessor {
  private static readonly SUPPORTED_TYPES = ['pdf', 'docx', 'txt']
  private static readonly MAX_FILE_SIZES = {
    pdf: 10 * 1024 * 1024,   // 10MB
    docx: 10 * 1024 * 1024,  // 10MB
    txt: 5 * 1024 * 1024     // 5MB
  }

  static async processDocument(file: File): Promise<ProcessingResult> {
    try {
      // Validate file first
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        }
      }

      const fileType = this.getFileType(file)
      
      // Process based on file type
      switch (fileType) {
        case 'pdf':
          const pdfResult = await PDFParser.parsePDF(file)
          return {
            success: true,
            document: pdfResult
          }

        case 'docx':
          const docxResult = await DOCXParser.parseDOCX(file)
          return {
            success: true,
            document: docxResult
          }

        case 'txt':
          const txtResult = await TXTParser.parseTXT(file)
          return {
            success: true,
            document: txtResult
          }

        default:
          return {
            success: false,
            error: `Tipo di file non supportato: ${fileType}`
          }
      }
    } catch (error) {
      console.error('Document processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto durante l\'elaborazione'
      }
    }
  }

  static validateFile(file: File): UploadValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check file size
    if (file.size === 0) {
      errors.push('File vuoto o corrotto')
    }

    // Check file type
    const fileType = this.getFileType(file)
    if (!this.SUPPORTED_TYPES.includes(fileType)) {
      errors.push(`Tipo di file non supportato. Formati accettati: ${this.SUPPORTED_TYPES.join(', ').toUpperCase()}`)
    }

    // Check file size limits
    const maxSize = this.MAX_FILE_SIZES[fileType as keyof typeof this.MAX_FILE_SIZES]
    if (maxSize && file.size > maxSize) {
      errors.push(`File troppo grande. Dimensione massima per ${fileType.toUpperCase()}: ${this.formatFileSize(maxSize)}`)
    }

    // Warnings for large files
    if (file.size > 5 * 1024 * 1024) { // 5MB
      warnings.push('File di grandi dimensioni: l\'elaborazione potrebbe richiedere più tempo')
    }

    // Check filename
    if (file.name.length > 100) {
      warnings.push('Nome file molto lungo: verrà troncato')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      file_info: {
        size: file.size,
        type: file.type,
        name: file.name
      }
    }
  }

  static getFileType(file: File): string {
    // Check by file extension first
    const extension = file.name.toLowerCase().split('.').pop()
    
    switch (extension) {
      case 'pdf':
        return 'pdf'
      case 'docx':
        return 'docx'
      case 'txt':
        return 'txt'
      default:
        // Fallback to MIME type
        if (file.type.includes('pdf')) return 'pdf'
        if (file.type.includes('wordprocessingml') || file.type.includes('msword')) return 'docx'
        if (file.type.includes('text')) return 'txt'
        return 'unknown'
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static async generateSummary(text: string): Promise<string> {
    // In production, this would use OpenAI to generate a summary
    // For now, create a simple extractive summary
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const summaryLength = Math.min(3, Math.ceil(sentences.length * 0.1))
    
    // Simple heuristic: take first sentence, longest sentence, and last meaningful sentence
    const summary = []
    
    if (sentences.length > 0) {
      summary.push(sentences[0].trim())
    }
    
    if (sentences.length > 2) {
      // Find longest sentence
      const longestSentence = sentences.reduce((prev, current) => 
        current.length > prev.length ? current : prev
      )
      if (!summary.includes(longestSentence.trim())) {
        summary.push(longestSentence.trim())
      }
    }
    
    if (sentences.length > 1 && summary.length < 3) {
      const lastSentence = sentences[sentences.length - 1].trim()
      if (!summary.includes(lastSentence)) {
        summary.push(lastSentence)
      }
    }
    
    return summary.join('. ') + '.'
  }

  static estimateProcessingTime(file: File): number {
    // Estimate processing time based on file size and type
    const sizeInMB = file.size / (1024 * 1024)
    const fileType = this.getFileType(file)
    
    let baseTime = 0
    switch (fileType) {
      case 'pdf':
        baseTime = 3000 // 3 seconds base
        break
      case 'docx':
        baseTime = 2000 // 2 seconds base
        break
      case 'txt':
        baseTime = 1000 // 1 second base
        break
      default:
        baseTime = 5000 // 5 seconds for unknown
    }
    
    // Add time based on file size (500ms per MB)
    const sizeTime = sizeInMB * 500
    
    return Math.round(baseTime + sizeTime)
  }

  static createProcessingStatus(
    documentId: string, 
    status: 'uploading' | 'processing' | 'completed' | 'failed',
    progress: number = 0,
    message: string = '',
    estimatedCompletion?: Date
  ): DocumentProcessingStatus {
    return {
      document_id: documentId,
      status,
      progress: Math.max(0, Math.min(100, progress)),
      message,
      estimated_completion: estimatedCompletion
    }
  }
}
