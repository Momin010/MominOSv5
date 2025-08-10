// MominOS Local AI Service - Fully Offline & Intelligent
// Import the new AI assistant
import { aiAssistant } from './ai-assistant'

class GeminiService {
  async generateResponse(prompt: string): Promise<string> {
    // Use our local AI assistant instead of external API
    return await aiAssistant.generateResponse(prompt)
  }
}

export const geminiService = new GeminiService()
