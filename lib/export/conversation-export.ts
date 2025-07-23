import type { Conversation, Message } from '../../types/chat'
import type { 
  ConversationExportOptions, 
  ConversationExportResult,
  ConversationMetadata 
} from '../../types/conversation-history'

export class ConversationExporter {
  /**
   * Export conversation to specified format
   */
  async exportConversation(
    conversation: Conversation,
    metadata: ConversationMetadata,
    options: ConversationExportOptions
  ): Promise<ConversationExportResult> {
    try {
      switch (options.format) {
        case 'pdf':
          return await this.exportToPDF(conversation, metadata, options)
        case 'txt':
          return await this.exportToText(conversation, metadata, options)
        case 'json':
          return await this.exportToJSON(conversation, metadata, options)
        case 'markdown':
          return await this.exportToMarkdown(conversation, metadata, options)
        default:
          throw new Error(`Unsupported export format: ${options.format}`)
      }
    } catch (error) {
      return {
        success: false,
        format: options.format,
        error: error instanceof Error ? error.message : 'Unknown export error',
      }
    }
  }

  /**
   * Export to PDF format
   */
  private async exportToPDF(
    conversation: Conversation,
    metadata: ConversationMetadata,
    options: ConversationExportOptions
  ): Promise<ConversationExportResult> {
    // In a real implementation, use jsPDF or similar library
    const content = this.generateTextContent(conversation, metadata, options)
    
    // Mock PDF generation
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const fileName = `${this.sanitizeFileName(conversation.title)}.pdf`
    
    return {
      success: true,
      downloadUrl: url,
      fileName,
      fileSize: blob.size,
      format: 'pdf',
    }
  }

  /**
   * Export to plain text format
   */
  private async exportToText(
    conversation: Conversation,
    metadata: ConversationMetadata,
    options: ConversationExportOptions
  ): Promise<ConversationExportResult> {
    const content = this.generateTextContent(conversation, metadata, options)
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const fileName = `${this.sanitizeFileName(conversation.title)}.txt`
    
    // Trigger download
    this.downloadFile(url, fileName)
    
    return {
      success: true,
      downloadUrl: url,
      fileName,
      fileSize: blob.size,
      format: 'txt',
    }
  }

  /**
   * Export to JSON format
   */
  private async exportToJSON(
    conversation: Conversation,
    metadata: ConversationMetadata,
    options: ConversationExportOptions
  ): Promise<ConversationExportResult> {
    const exportData = {
      conversation,
      metadata: options.includeMetadata ? metadata : undefined,
      exportOptions: options,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
    
    const content = JSON.stringify(exportData, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const fileName = `${this.sanitizeFileName(conversation.title)}.json`
    
    this.downloadFile(url, fileName)
    
    return {
      success: true,
      downloadUrl: url,
      fileName,
      fileSize: blob.size,
      format: 'json',
    }
  }

  /**
   * Export to Markdown format
   */
  private async exportToMarkdown(
    conversation: Conversation,
    metadata: ConversationMetadata,
    options: ConversationExportOptions
  ): Promise<ConversationExportResult> {
    const content = this.generateMarkdownContent(conversation, metadata, options)
    
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    
    const fileName = `${this.sanitizeFileName(conversation.title)}.md`
    
    this.downloadFile(url, fileName)
    
    return {
      success: true,
      downloadUrl: url,
      fileName,
      fileSize: blob.size,
      format: 'markdown',
    }
  }

  /**
   * Generate text content for export
   */
  private generateTextContent(
    conversation: Conversation,
    metadata: ConversationMetadata,
    options: ConversationExportOptions
  ): string {
    let content = ''
    
    // Header
    content += `CONVERSATION EXPORT\n`
    content += `==================\n\n`
    
    if (options.includeMetadata) {
      content += `Title: ${conversation.title}\n`
      content += `Created: ${conversation.createdAt.toLocaleString()}\n`
      content += `Last Updated: ${conversation.updatedAt.toLocaleString()}\n`
      content += `Message Count: ${metadata.messageCount}\n`
      content += `Persona: ${conversation.persona}\n`
      content += `Topics: ${metadata.topics.join(', ')}\n`
      content += `\n`
    }
    
    // Messages
    content += `CONVERSATION\n`
    content += `============\n\n`
    
    const filteredMessages = this.filterMessages(conversation.messages || [], options)
    
    filteredMessages.forEach((message, index) => {
      const timestamp = options.includeTimestamps 
        ? ` (${message.timestamp?.toLocaleString() || 'Unknown time'})`
        : ''
      
      const role = message.role === 'user' ? 'USER' : 'ASSISTANT'
      if (options.includePersonaInfo && message.role === 'assistant') {
        content += `${role} (${conversation.persona})${timestamp}:\n`
      } else {
        content += `${role}${timestamp}:\n`
      }
      
      content += `${message.content}\n\n`
      
      if (index < filteredMessages.length - 1) {
        content += `---\n\n`
      }
    })
    
    // Footer
    content += `\n\nExported on ${new Date().toLocaleString()}\n`
    
    return content
  }

  /**
   * Generate Markdown content for export
   */
  private generateMarkdownContent(
    conversation: Conversation,
    metadata: ConversationMetadata,
    options: ConversationExportOptions
  ): string {
    let content = ''
    
    // Header
    content += `# ${conversation.title}\n\n`
    
    if (options.includeMetadata) {
      content += `## Conversation Details\n\n`
      content += `- **Created:** ${conversation.createdAt.toLocaleString()}\n`
      content += `- **Last Updated:** ${conversation.updatedAt.toLocaleString()}\n`
      content += `- **Messages:** ${metadata.messageCount}\n`
      content += `- **Persona:** ${conversation.persona}\n`
      content += `- **Topics:** ${metadata.topics.join(', ')}\n\n`
    }
    
    // Messages
    content += `## Conversation\n\n`
    
    const filteredMessages = this.filterMessages(conversation.messages || [], options)
    
    filteredMessages.forEach((message, index) => {
      const timestamp = options.includeTimestamps 
        ? ` *(${message.timestamp?.toLocaleString() || 'Unknown time'})*`
        : ''
      
      if (message.role === 'user') {
        content += `### 👤 User${timestamp}\n\n`
      } else {
        const persona = options.includePersonaInfo ? ` (${conversation.persona})` : ''
        content += `### 🤖 Assistant${persona}${timestamp}\n\n`
      }
      
      content += `${message.content}\n\n`
      
      if (index < filteredMessages.length - 1) {
        content += `---\n\n`
      }
    })
    
    // Footer
    content += `\n---\n\n`
    content += `*Exported on ${new Date().toLocaleString()}*\n`
    
    return content
  }

  /**
   * Filter messages based on export options
   */
  private filterMessages(messages: Message[], options: ConversationExportOptions): Message[] {
    let filtered = [...messages]
    
    // Filter by message type
    if (options.filterBy?.messageType && options.filterBy.messageType.length > 0) {
      filtered = filtered.filter(msg => 
        options.filterBy!.messageType!.includes(msg.role)
      )
    }
    
    // Filter by date range
    if (options.filterBy?.dateRange) {
      const { start, end } = options.filterBy.dateRange
      filtered = filtered.filter(msg => {
        if (!msg.timestamp) return true
        return msg.timestamp >= start && msg.timestamp <= end
      })
    }
    
    // Filter by keywords
    if (options.filterBy?.keywords && options.filterBy.keywords.length > 0) {
      const keywords = options.filterBy.keywords.map(k => k.toLowerCase())
      filtered = filtered.filter(msg =>
        keywords.some(keyword => 
          msg.content.toLowerCase().includes(keyword)
        )
      )
    }
    
    return filtered
  }

  /**
   * Sanitize filename for download
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase()
  }

  /**
   * Trigger file download
   */
  private downloadFile(url: string, fileName: string): void {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  }

  /**
   * Estimate export file size
   */
  estimateFileSize(
    conversation: Conversation,
    options: ConversationExportOptions
  ): number {
    const messages = conversation.messages || []
    const filteredMessages = this.filterMessages(messages, options)
    
    let estimatedSize = 0
    
    // Base metadata size
    if (options.includeMetadata) {
      estimatedSize += 500 // Estimated metadata size in bytes
    }
    
    // Message content size
    filteredMessages.forEach(message => {
      estimatedSize += message.content.length
      estimatedSize += 100 // Estimated formatting overhead per message
    })
    
    // Format-specific overhead
    switch (options.format) {
      case 'pdf':
        estimatedSize *= 1.5 // PDF overhead
        break
      case 'json':
        estimatedSize *= 1.3 // JSON structure overhead
        break
      case 'markdown':
        estimatedSize *= 1.1 // Markdown formatting overhead
        break
      default:
        break
    }
    
    return Math.round(estimatedSize)
  }

  /**
   * Get available export formats
   */
  getAvailableFormats(): Array<{
    format: string
    label: string
    description: string
    extension: string
  }> {
    return [
      {
        format: 'txt',
        label: 'Plain Text',
        description: 'Simple text format, easy to read and edit',
        extension: '.txt',
      },
      {
        format: 'markdown',
        label: 'Markdown',
        description: 'Formatted text with headings and structure',
        extension: '.md',
      },
      {
        format: 'json',
        label: 'JSON',
        description: 'Machine-readable format with full data',
        extension: '.json',
      },
      {
        format: 'pdf',
        label: 'PDF',
        description: 'Professional document format for printing',
        extension: '.pdf',
      },
    ]
  }
}

// Export singleton instance
export const conversationExporter = new ConversationExporter()
