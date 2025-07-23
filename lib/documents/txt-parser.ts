import { DocumentContent, DocumentMetadata } from "types/documents"

export interface TXTParseResult {
  text: string
  metadata: DocumentMetadata
  chunks: DocumentContent[]
}

export class TXTParser {
  private static readonly MAX_CHUNK_SIZE = 4000
  private static readonly CHUNK_OVERLAP = 200

  static async parseTXT(file: File): Promise<TXTParseResult> {
    try {
      const text = await this.extractTextFromTXT(file)
      
      const metadata: DocumentMetadata = {
        original_filename: file.name,
        word_count: this.countWords(text),
        language: this.detectLanguage(text),
        encoding: 'UTF-8',
        extraction_method: 'text-reader',
        processing_time: Date.now()
      }

      const chunks = this.chunkText(text, file.name)

      return {
        text,
        metadata,
        chunks
      }
    } catch (error) {
      console.error('TXT parsing error:', error)
      throw new Error(`Failed to parse TXT: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private static async extractTextFromTXT(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const text = event.target?.result as string
        resolve(text)
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read text file'))
      }
      
      reader.readAsText(file, 'UTF-8')
    })
  }

  private static chunkText(text: string, filename: string): DocumentContent[] {
    const chunks: DocumentContent[] = []
    const lines = text.split('\n')
    let currentChunk = ''
    let chunkIndex = 0

    for (const line of lines) {
      const potentialChunk = currentChunk + (currentChunk ? '\n' : '') + line

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

        // Start new chunk with overlap
        const overlapLines = currentChunk.split('\n').slice(-Math.floor(this.CHUNK_OVERLAP / 50))
        currentChunk = overlapLines.join('\n') + '\n' + line
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

  private static detectLanguage(text: string): string {
    // Simple language detection based on common Italian words
    const italianWords = ['il', 'la', 'di', 'che', 'e', 'per', 'con', 'del', 'una', 'sono']
    const words = text.toLowerCase().split(/\s+/).slice(0, 100) // Check first 100 words
    
    const italianCount = words.filter(word => italianWords.includes(word)).length
    
    return italianCount > words.length * 0.1 ? 'it' : 'unknown'
  }

  static validateTXT(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!file.type.includes('text') && !file.name.toLowerCase().endsWith('.txt')) {
      errors.push('File deve essere in formato TXT')
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for text files
      errors.push('File troppo grande. Dimensione massima: 5MB')
    }

    if (file.size === 0) {
      errors.push('File vuoto')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
