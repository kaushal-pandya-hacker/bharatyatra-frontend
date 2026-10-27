// BHARAT YATRA — NEXI GEMINI LLM PROVIDER ADAPTER
// Server-side integration with Google Gemini REST API with timeouts, rate limits, and fallback

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface GeminiChatOptions {
  userMessage: string;
  userLanguage?: 'gu' | 'hi' | 'en';
  groundingContext?: string;
  userContextSnippet?: string;
  conversationHistory?: Array<{ role: 'USER' | 'ASSISTANT'; content: string }>;
}

export interface GeminiChatResult {
  success: boolean;
  text: string;
  intent: string;
  suggestedActions?: Array<{ type: string; label?: string; payload?: any }>;
  grounded: boolean;
  provider: 'GEMINI_LIVE' | 'DETERMINISTIC_FALLBACK';
}

@Injectable()
export class NexiGeminiProvider {
  private readonly logger = new Logger(NexiGeminiProvider.name);
  private systemPrompt: string = '';
  private readonly apiKey: string | undefined;
  private readonly modelName: string;
  private readonly timeoutMs: number;
  private readonly maxTokens: number;
  private readonly recentCallTimestamps: Map<string, number[]> = new Map();

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.timeoutMs = parseInt(process.env.AI_TIMEOUT_MS || '7000', 10);
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS || '600', 10);

    this.loadSystemInstructions();
  }

  /**
   * Loads approved system instructions from 07_AI/System_Instructions or fallback
   */
  private loadSystemInstructions(): void {
    const candidatePaths = [
      path.resolve(process.cwd(), '07_AI/System_Instructions/NEXI_CUSTOMER_SUPPORT_AI.md'),
      path.resolve(process.cwd(), '../../07_AI/System_Instructions/NEXI_CUSTOMER_SUPPORT_AI.md'),
      path.resolve(__dirname, '../../../../../07_AI/System_Instructions/NEXI_CUSTOMER_SUPPORT_AI.md'),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          this.systemPrompt = fs.readFileSync(p, 'utf-8');
          this.logger.log(`[NexiGeminiProvider] Loaded official system instructions from: ${p}`);
          return;
        } catch (e: any) {
          this.logger.warn(`Failed reading system instructions at ${p}: ${e.message}`);
        }
      }
    }

    // Default built-in prompt compliant with Section 1-12 charter
    this.systemPrompt =
      'You are NEXI, official AI customer-support assistant for BharatYatra travel platform.\n' +
      'Support languages: Gujarati, Hindi, English. Provide polite, concise, verified answers.\n' +
      'Rules: Never invent booking IDs, prices, refund amounts or completion dates.\n' +
      'Never ask for or accept OTPs, CVVs or passwords. Never process payments directly.\n' +
      'If verified knowledge does not contain the answer, state the limitation honestly and offer human escalation.';
  }

  /**
   * Rate limiting: Allow max 20 requests per minute per user/session
   */
  private isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.recentCallTimestamps.get(identifier) || [];
    const validTimestamps = timestamps.filter((t) => now - t < 60000);

    if (validTimestamps.length >= 20) {
      return true;
    }

    validTimestamps.push(now);
    this.recentCallTimestamps.set(identifier, validTimestamps);
    return false;
  }

  /**
   * Generate customer support response with verified grounding
   */
  async generateCustomerSupportReply(
    options: GeminiChatOptions,
    clientIdentifier = 'guest',
  ): Promise<GeminiChatResult> {
    const { userMessage, userLanguage = 'en', groundingContext, userContextSnippet, conversationHistory } = options;

    // 1. Input bounding
    const boundedMessage = userMessage.slice(0, 1000).trim();

    // 2. Check rate limit
    if (this.isRateLimited(clientIdentifier)) {
      this.logger.warn(`Rate limit exceeded for client: ${clientIdentifier}`);
      return {
        success: false,
        text:
          userLanguage === 'gu'
            ? 'તમે ખૂબ ઝડપથી મેસેજ મોકલી રહ્યા છો. મહેરબાની કરીને થોડી ક્ષણો પછી ફરી પ્રયાસ કરો.'
            : userLanguage === 'hi'
            ? 'आप बहुत तेज़ी से संदेश भेज रहे हैं। कृपया कुछ क्षण प्रतीक्षा करें और पुनः प्रयास करें।'
            : 'You are sending messages too quickly. Please wait a moment and try again.',
        intent: 'GENERAL_SUPPORT',
        grounded: false,
        provider: 'DETERMINISTIC_FALLBACK',
      };
    }

    // 3. Check API key readiness
    if (!this.apiKey || this.apiKey.includes('your_gemini_api_key')) {
      return {
        success: false,
        text: '',
        intent: 'QUESTION',
        grounded: false,
        provider: 'DETERMINISTIC_FALLBACK',
      };
    }

    // 4. Construct prompt bounded with system instructions and verified knowledge
    const contents: any[] = [];

    // History (capped at last 6 messages / 3 turns)
    if (conversationHistory && conversationHistory.length > 0) {
      const recent = conversationHistory.slice(-6);
      for (const h of recent) {
        contents.push({
          role: h.role === 'USER' ? 'user' : 'model',
          parts: [{ text: h.content.slice(0, 500) }],
        });
      }
    }

    const currentTurnPrompt =
      `[SYSTEM INSTRUCTIONS & VERIFIED CHARTER]\n${this.systemPrompt}\n\n` +
      `[AUTHORIZED USER CONTEXT (Internal Data)]\n${userContextSnippet || 'Anonymous guest session'}\n\n` +
      `[VERIFIED OFFICIAL KNOWLEDGE PASSAGES (Grounding Source)]\n${groundingContext || 'No specific document matched.'}\n\n` +
      `[USER QUERY (Language: ${userLanguage})]\n${boundedMessage}\n\n` +
      `[DIRECTIVE]\n` +
      `Respond in ${userLanguage === 'gu' ? 'Gujarati' : userLanguage === 'hi' ? 'Hindi' : 'English'}. ` +
      `Ground your answer strictly on the verified knowledge passages above. ` +
      `If information is missing, admit uncertainty politely and recommend the official next step or human escalation. ` +
      `Never claim you processed a payment, modified a ticket, or approved a refund without verified backend confirmation.`;

    contents.push({
      role: 'user',
      parts: [{ text: currentTurnPrompt }],
    });

    // 5. Invoke Gemini REST API with timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.2, // Low temperature for high factual accuracy
            maxOutputTokens: this.maxTokens,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        this.logger.warn(`Gemini API returned status ${res.status}: ${res.statusText}`);
        return {
          success: false,
          text: '',
          intent: 'QUESTION',
          grounded: false,
          provider: 'DETERMINISTIC_FALLBACK',
        };
      }

      const data = await res.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!generatedText) {
        return {
          success: false,
          text: '',
          intent: 'QUESTION',
          grounded: false,
          provider: 'DETERMINISTIC_FALLBACK',
        };
      }

      return {
        success: true,
        text: generatedText,
        intent: 'QUESTION',
        grounded: true,
        provider: 'GEMINI_LIVE',
      };
    } catch (err: any) {
      clearTimeout(timer);
      this.logger.warn(`Gemini provider invocation error: ${err.message}`);
      return {
        success: false,
        text: '',
        intent: 'QUESTION',
        grounded: false,
        provider: 'DETERMINISTIC_FALLBACK',
      };
    }
  }

  getModelName(): string {
    return this.modelName;
  }
}
