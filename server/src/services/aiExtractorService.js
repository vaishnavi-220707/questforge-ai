import { aiProviderManager } from './aiProviderManager.js'
import { extractStructuredFieldsFromText } from './ocrService.js'

/**
 * Extracts structured fields from document text using the Multi-Provider Failover System
 * (Gemini -> Groq -> NVIDIA NeMoTron 3 Ultra), or safely falls back to deterministic rule-based extraction.
 */
export async function extractWithAIOrFallback(extractedText, documentCategory = 'Document') {
  if (!extractedText || extractedText.trim().length === 0) {
    return {
      aiAvailable: false,
      mode: 'Deterministic Demonstration Mode (Empty Input)',
      fields: extractStructuredFieldsFromText(''),
      source: 'DETERMINISTIC_EMPTY'
    }
  }

  return await aiProviderManager.extractDocumentEntities(extractedText, documentCategory)
}
