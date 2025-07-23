import { 
  Tag, 
  TagCategory, 
  TagGenerationRequest, 
  TagGenerationResult,
  TagExplanation,
  TagExplanationRequest
} from "types/tags"

// Academic subject mappings for better tag categorization
const SUBJECT_MAPPINGS = {
  mathematics: ['algebra', 'geometry', 'calculus', 'statistics', 'trigonometry'],
  science: ['physics', 'chemistry', 'biology', 'astronomy', 'geology'],
  history: ['ancient', 'medieval', 'renaissance', 'modern', 'contemporary'],
  literature: ['poetry', 'prose', 'drama', 'criticism', 'analysis'],
  geography: ['physical', 'human', 'economic', 'political', 'environmental'],
  philosophy: ['ethics', 'logic', 'metaphysics', 'epistemology', 'aesthetics']
}

// Italian academic terminology for better recognition
const ITALIAN_ACADEMIC_TERMS = {
  concepts: ['concetto', 'principio', 'teoria', 'legge', 'regola', 'formula'],
  skills: ['abilità', 'competenza', 'metodo', 'tecnica', 'procedura', 'strategia'],
  topics: ['argomento', 'tema', 'capitolo', 'sezione', 'unità', 'modulo'],
  applications: ['applicazione', 'esempio', 'caso', 'esercizio', 'problema', 'pratica']
}

export class ContentAnalysisService {
  private static readonly MIN_CONFIDENCE = 0.6
  private static readonly MAX_TAGS_PER_DOCUMENT = 20

  /**
   * Analyze document content and generate relevant tags
   */
  static async generateTags(request: TagGenerationRequest): Promise<TagGenerationResult> {
    try {
      const startTime = Date.now()
      
      // Detect language if not provided
      const detectedLanguage = request.language || this.detectLanguage(request.content)
      
      // Detect subject area if not provided  
      const detectedSubject = request.subject_area || this.detectSubjectArea(request.content)
      
      // In production, this would use OpenAI for advanced NLP analysis
      /*
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      
      const systemPrompt = `Analizza il contenuto accademico fornito e genera tag educativi rilevanti.
      
      ISTRUZIONI:
      - Estrai concetti chiave, abilità, argomenti e parole chiave importanti
      - Classifica ogni tag in una di queste categorie: concept, skill, topic, keyword, method, theory, application, person, date, location
      - Fornisci un punteggio di confidenza (0-1) per ogni tag
      - Indica il livello di difficoltà: beginner, intermediate, advanced
      - Includi spiegazioni brevi per ogni tag
      - Limita a massimo ${request.max_tags || 15} tag
      - Lingua del contenuto: ${detectedLanguage}
      - Area disciplinare: ${detectedSubject}
      
      FORMATO OUTPUT JSON:
      {
        "tags": [
          {
            "name": "nome_tag",
            "display_name": "Nome Visualizzato",
            "description": "Breve descrizione",
            "category": "concept",
            "confidence": 0.85,
            "difficulty_level": "intermediate",
            "position_references": [123, 456],
            "context_snippet": "contesto dove appare"
          }
        ]
      }`
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: request.content }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
      
      const aiResult = JSON.parse(completion.choices[0]?.message?.content || '{"tags": []}')
      */
      
      // Mock implementation for development
      const mockTags = this.generateMockTags(request.content, detectedSubject, detectedLanguage)
      
      const result: TagGenerationResult = {
        document_id: request.document_id,
        generated_tags: mockTags,
        processing_time: Date.now() - startTime,
        language_detected: detectedLanguage,
        subject_area_detected: detectedSubject
      }
      
      return result
      
    } catch (error) {
      console.error('Error generating tags:', error)
      throw new Error(`Failed to generate tags: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate AI explanation for a specific tag
   */
  static async generateTagExplanation(request: TagExplanationRequest): Promise<TagExplanation> {
    try {
      // In production, this would use OpenAI to generate comprehensive explanations
      /*
      const systemPrompt = `Fornisci una spiegazione educativa completa per il tag/concetto richiesto.
      
      LIVELLO UTENTE: ${request.user_level || 'intermediate'}
      CONTESTO: ${request.context || 'generale'}
      OBIETTIVO: ${request.learning_objective || 'comprensione generale'}
      
      INCLUDI:
      - Definizione chiara e concisa
      - Spiegazione dettagliata adatta al livello
      - 3-5 esempi pratici
      - Punti chiave da ricordare
      - Prerequisiti necessari
      - Concetti correlati
      - Suggerimenti per lo studio
      - Letture di approfondimento
      `
      */
      
      // Mock implementation
      return this.generateMockExplanation(request)
      
    } catch (error) {
      console.error('Error generating tag explanation:', error)
      throw new Error('Failed to generate tag explanation')
    }
  }

  /**
   * Detect the primary language of the content
   */
  private static detectLanguage(content: string): string {
    // Simple language detection based on common Italian words
    const italianWords = [
      'il', 'la', 'di', 'che', 'e', 'per', 'con', 'del', 'una', 'sono',
      'della', 'le', 'da', 'un', 'dei', 'delle', 'nel', 'sulla', 'dalla'
    ]
    
    const words = content.toLowerCase().split(/\s+/).slice(0, 100)
    const italianCount = words.filter(word => italianWords.includes(word)).length
    
    return italianCount > words.length * 0.15 ? 'it' : 'en'
  }

  /**
   * Detect the academic subject area of the content
   */
  private static detectSubjectArea(content: string): string {
    const contentLower = content.toLowerCase()
    
    // Italian subject keywords
    const subjectKeywords = {
      matematica: ['algebra', 'geometria', 'calcolo', 'equazione', 'formula', 'teorema', 'funzione'],
      fisica: ['energia', 'forza', 'movimento', 'velocità', 'accelerazione', 'massa', 'gravitazione'],
      chimica: ['molecola', 'atomo', 'reazione', 'elemento', 'composto', 'ossidazione', 'legame'],
      biologia: ['cellula', 'organismo', 'evoluzione', 'genetica', 'fotosintesi', 'dna', 'specie'],
      storia: ['guerra', 'regno', 'impero', 'rivoluzione', 'secolo', 'battaglia', 'civiltà'],
      letteratura: ['romanzo', 'poesia', 'autore', 'personaggio', 'racconto', 'opera', 'critica'],
      geografia: ['continente', 'clima', 'popolazione', 'territorio', 'confine', 'capitale', 'regione'],
      filosofia: ['etica', 'logica', 'metafisica', 'pensiero', 'ragione', 'verità', 'esistenza']
    }
    
    let maxMatches = 0
    let detectedSubject = 'generale'
    
    for (const [subject, keywords] of Object.entries(subjectKeywords)) {
      const matches = keywords.filter(keyword => contentLower.includes(keyword)).length
      if (matches > maxMatches) {
        maxMatches = matches
        detectedSubject = subject
      }
    }
    
    return detectedSubject
  }

  /**
   * Generate mock tags for development/demo purposes
   */
  private static generateMockTags(content: string, subject: string, language: string) {
    const contentWords = content.toLowerCase().split(/\s+/)
    const mockTags = []
    
    // Generate concept tags based on subject
    if (subject === 'matematica') {
      mockTags.push(
        {
          tag: {
            name: 'algebra',
            display_name: 'Algebra',
            description: 'Ramo della matematica che studia le operazioni con simboli e variabili',
            category: 'concept' as TagCategory,
            confidence_score: 0.89,
            frequency: 12,
            difficulty_level: 'intermediate' as const,
            subject_area: subject,
            language,
            color: '#3B82F6',
            icon: '🔢'
          },
          relevance_score: 0.89,
          position_references: [150, 450, 890],
          context_snippet: 'L\'algebra è fondamentale per...',
          confidence: 0.89
        },
        {
          tag: {
            name: 'equazioni',
            display_name: 'Equazioni',
            description: 'Uguaglianze matematiche contenenti una o più variabili da determinare',
            category: 'skill' as TagCategory,
            confidence_score: 0.85,
            frequency: 8,
            difficulty_level: 'intermediate' as const,
            subject_area: subject,
            language,
            color: '#10B981',
            icon: '⚖️'
          },
          relevance_score: 0.85,
          position_references: [234, 567],
          context_snippet: 'Le equazioni lineari permettono di...',
          confidence: 0.85
        }
      )
    } else if (subject === 'storia') {
      mockTags.push(
        {
          tag: {
            name: 'rinascimento',
            display_name: 'Rinascimento',
            description: 'Periodo di rinnovamento culturale e artistico in Europa (XIV-XVI secolo)',
            category: 'topic' as TagCategory,
            confidence_score: 0.92,
            frequency: 15,
            difficulty_level: 'intermediate' as const,
            subject_area: subject,
            language,
            color: '#F59E0B',
            icon: '🎨'
          },
          relevance_score: 0.92,
          position_references: [89, 234, 456, 789],
          context_snippet: 'Il Rinascimento segna una svolta...',
          confidence: 0.92
        },
        {
          tag: {
            name: 'leonardo-da-vinci',
            display_name: 'Leonardo da Vinci',
            description: 'Artista, inventore e genio universale del Rinascimento italiano',
            category: 'person' as TagCategory,
            confidence_score: 0.87,
            frequency: 6,
            difficulty_level: 'beginner' as const,
            subject_area: subject,
            language,
            color: '#8B5CF6',
            icon: '👤'
          },
          relevance_score: 0.87,
          position_references: [345, 678],
          context_snippet: 'Leonardo da Vinci rappresenta...',
          confidence: 0.87
        }
      )
    } else {
      // General academic tags
      mockTags.push(
        {
          tag: {
            name: 'analisi',
            display_name: 'Analisi',
            description: 'Processo di esame dettagliato di un argomento o fenomeno',
            category: 'skill' as TagCategory,
            confidence_score: 0.75,
            frequency: 10,
            difficulty_level: 'intermediate' as const,
            subject_area: subject,
            language,
            color: '#6366F1',
            icon: '🔍'
          },
          relevance_score: 0.75,
          position_references: [123, 456],
          context_snippet: 'L\'analisi del problema rivela...',
          confidence: 0.75
        },
        {
          tag: {
            name: 'metodologia',
            display_name: 'Metodologia',
            description: 'Insieme sistematico di metodi e principi per condurre ricerca o studio',
            category: 'method' as TagCategory,
            confidence_score: 0.68,
            frequency: 5,
            difficulty_level: 'advanced' as const,
            subject_area: subject,
            language,
            color: '#EC4899',
            icon: '📋'
          },
          relevance_score: 0.68,
          position_references: [789],
          context_snippet: 'La metodologia seguita prevede...',
          confidence: 0.68
        }
      )
    }
    
    return mockTags
  }

  /**
   * Generate mock explanation for development
   */
  private static generateMockExplanation(request: TagExplanationRequest): TagExplanation {
    return {
      tag_id: request.tag_id,
      definition: "Definizione chiara e concisa del concetto basata sul livello dell'utente.",
      detailed_explanation: "Spiegazione dettagliata che approfondisce il concetto, fornendo contesto e collegamenti con altri argomenti correlati. Questa spiegazione è adattata al livello specificato dall'utente.",
      examples: [
        "Esempio pratico numero 1 che illustra l'applicazione del concetto",
        "Esempio pratico numero 2 con un caso d'uso diverso",
        "Esempio pratico numero 3 che mostra variazioni del concetto"
      ],
      key_points: [
        "Punto chiave 1: aspetto fondamentale da ricordare",
        "Punto chiave 2: caratteristica distintiva importante",
        "Punto chiave 3: applicazione pratica essenziale",
        "Punto chiave 4: collegamento con altri concetti"
      ],
      prerequisites: [],
      related_concepts: [],
      study_tips: [
        "Suggerimento 1: Come approcciare lo studio di questo concetto",
        "Suggerimento 2: Tecniche di memorizzazione efficaci",
        "Suggerimento 3: Esercizi pratici consigliati",
        "Suggerimento 4: Risorse aggiuntive per l'approfondimento"
      ],
      further_reading: [
        {
          title: "Approfondimento teorico",
          description: "Lettura avanzata per comprendere meglio gli aspetti teorici"
        },
        {
          title: "Applicazioni pratiche",
          description: "Esempi reali di utilizzo del concetto"
        },
        {
          title: "Ricerca contemporanea",
          description: "Sviluppi recenti e ricerca attuale sull'argomento"
        }
      ],
      difficulty_explanation: `Questo concetto è classificato come ${request.user_level || 'intermediate'} perché richiede una comprensione di base dei principi fondamentali e la capacità di applicare il ragionamento logico in contesti specifici.`
    }
  }

  /**
   * Extract position references where keywords appear in content
   */
  static extractPositionReferences(content: string, keyword: string): number[] {
    const positions: number[] = []
    const keywordLower = keyword.toLowerCase()
    const contentLower = content.toLowerCase()
    
    let position = contentLower.indexOf(keywordLower)
    while (position !== -1) {
      positions.push(position)
      position = contentLower.indexOf(keywordLower, position + 1)
    }
    
    return positions
  }

  /**
   * Generate color for tag based on category
   */
  static getTagColor(category: TagCategory): string {
    const colors = {
      concept: '#3B82F6',     // Blue
      skill: '#10B981',       // Green  
      topic: '#F59E0B',       // Yellow
      keyword: '#6366F1',     // Indigo
      method: '#EC4899',      // Pink
      theory: '#8B5CF6',      // Purple
      application: '#EF4444', // Red
      person: '#8B5CF6',      // Purple
      date: '#6B7280',        // Gray
      location: '#059669'     // Emerald
    }
    
    return colors[category] || '#6B7280'
  }

  /**
   * Generate icon for tag based on category
   */
  static getTagIcon(category: TagCategory): string {
    const icons = {
      concept: '💡',
      skill: '🎯',
      topic: '📚',
      keyword: '🔑',
      method: '🛠️',
      theory: '🧠',
      application: '⚡',
      person: '👤',
      date: '📅',
      location: '📍'
    }
    
    return icons[category] || '🏷️'
  }
}
