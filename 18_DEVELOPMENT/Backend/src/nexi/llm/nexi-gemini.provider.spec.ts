import { NexiGeminiProvider } from './nexi-gemini.provider';

describe('NexiGeminiProvider Unit Tests', () => {
  let provider: NexiGeminiProvider;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'mock_valid_gemini_key_for_testing';
    process.env.GEMINI_MODEL = 'gemini-1.5-flash';
    provider = new NexiGeminiProvider();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should be defined and initialize with default model', () => {
    expect(provider).toBeDefined();
    expect(provider.getModelName()).toBe('gemini-1.5-flash');
  });

  it('should fall back gracefully when API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const noKeyProvider = new NexiGeminiProvider();
    const result = await noKeyProvider.generateCustomerSupportReply({
      userMessage: 'What is the baggage limit?',
    });

    expect(result.success).toBe(false);
    expect(result.provider).toBe('DETERMINISTIC_FALLBACK');
  });

  it('should call Gemini endpoint with structured prompt and return response', async () => {
    const mockJson = {
      candidates: [
        {
          content: {
            parts: [{ text: 'GSRTC allows up to 20 kg of luggage free per passenger.' }],
          },
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockJson),
    } as any);

    const result = await provider.generateCustomerSupportReply({
      userMessage: 'How much luggage can I carry on GSRTC?',
      userLanguage: 'en',
      groundingContext: 'Bus luggage allowance: 20kg free.',
    });

    expect(result.success).toBe(true);
    expect(result.text).toContain('20 kg');
    expect(result.provider).toBe('GEMINI_LIVE');
    expect(result.grounded).toBe(true);
  });

  it('should handle timeout or fetch network error with fallback', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('ETIMEDOUT'));

    const result = await provider.generateCustomerSupportReply({
      userMessage: 'Will I get a refund?',
    });

    expect(result.success).toBe(false);
    expect(result.provider).toBe('DETERMINISTIC_FALLBACK');
  });

  it('should enforce sliding-window rate limit after 20 rapid calls', async () => {
    const dummyClient = 'test-rate-limit-client';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        candidates: [{ content: { parts: [{ text: 'Answer' }] } }],
      }),
    } as any);

    // Call 20 times
    for (let i = 0; i < 20; i++) {
      await provider.generateCustomerSupportReply({ userMessage: 'test' }, dummyClient);
    }

    // 21st call should trigger rate limiting
    const result = await provider.generateCustomerSupportReply({ userMessage: 'test' }, dummyClient);
    expect(result.provider).toBe('DETERMINISTIC_FALLBACK');
    expect(result.text).toContain('too quickly');
  });
});
