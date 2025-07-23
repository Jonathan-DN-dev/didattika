import { DocumentContent, DocumentMetadata } from "types/documents"

// In production, you would install and use mammoth or docx
// npm install mammoth @types/mammoth

export interface DOCXParseResult {
  text: string
  metadata: DocumentMetadata
  chunks: DocumentContent[]
}

export class DOCXParser {
  private static readonly MAX_CHUNK_SIZE = 4000
  private static readonly CHUNK_OVERLAP = 200

  static async parseDOCX(file: File): Promise<DOCXParseResult> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const text = await this.extractTextFromDOCX(arrayBuffer)
      
      const metadata: DocumentMetadata = {
        original_filename: file.name,
        word_count: this.countWords(text),
        language: 'it',
        extraction_method: 'mammoth',
        processing_time: Date.now()
      }

      const chunks = this.chunkText(text, file.name)

      return {
        text,
        metadata,
        chunks
      }
    } catch (error) {
      console.error('DOCX parsing error:', error)
      throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private static async extractTextFromDOCX(buffer: ArrayBuffer): Promise<string> {
    // Simulate DOCX text extraction
    // In production, this would use mammoth:
    /*
    const mammoth = require('mammoth')
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
    return result.value
    */
    
    // Mock implementation for development
    const text = `
    DOCUMENTO WORD SIMULATO
    
    Questo è un esempio di contenuto estratto da un documento Microsoft Word.
    Il sistema supporta l'estrazione di testo da file DOCX utilizzando
    librerie specializzate come Mammoth.js.
    
    CAPITOLO 1: PANORAMICA
    I documenti Word contengono spesso formattazione complessa che viene
    convertita in testo semplice per l'elaborazione da parte dell'AI.
    
    CAPITOLO 2: FUNZIONALITÀ
    - Estrazione di testo completo
    - Preservazione della struttura dei paragrafi
    - Gestione di tabelle e liste
    - Supporto per caratteri speciali
    
    CAPITOLO 3: INTEGRAZIONE AI
    Il testo estratto viene utilizzato dall'AI per:
    • Rispondere a domande specifiche sul contenuto
    • Fornire riassunti e spiegazioni
    • Creare materiale didattico correlato
    • Supportare l'apprendimento personalizzato
    
    APPENDICE
    L'AI può anche identificare concetti chiave e suggerire
    approfondimenti basati sul contenuto del documento.
    `
    
    return text.trim()
  }

  private static chunkText(text: string, filename: string): DocumentContent[] {
    const chunks: DocumentContent[] = []
    const paragraphs = text.split(/\n\s*\n/) // Split by empty lines (paragraphs)
    let currentChunk = ''
    let chunkIndex = 0

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim()
      if (!trimmedParagraph) continue

      const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + trimmedParagraph

      if (potentialChunk.length > this.MAX_CHUNK_SIZE && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          id: `chunk-${chunkIndex}`,
          document_id: '',
          content_type: 'chunk',
          content: currentChunk,
          chunk_index: chunkIndex,
          metadata: {
            confidence_score: 1.0
          }
        })

        // Start new chunk
        currentChunk = trimmedParagraph
        chunkIndex++
      } else {
        currentChunk = potentialChunk
      }
    }

    // Add final chunk if any content remains
    if (currentChunk.trim()) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        document_id: '',
        content_type: 'chunk',
        content: currentChunk,
        chunk_index: chunkIndex,
        metadata: {
          confidence_score: 1.0
        }
      })
    }

    return chunks
  }

  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  static validateDOCX(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.docx')) {
      errors.push('File deve essere in formato DOCX')
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      errors.push('File troppo grande. Dimensione massima: 10MB')
    }

    if (file.size === 0) {
      errors.push('File vuoto o corrotto')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
