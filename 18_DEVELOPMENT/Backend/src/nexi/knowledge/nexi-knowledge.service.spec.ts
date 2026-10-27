import { NexiKnowledgeService } from './nexi-knowledge.service';

describe('NexiKnowledgeService', () => {
  let service: NexiKnowledgeService;

  beforeEach(() => {
    service = new NexiKnowledgeService();
  });

  it('should initialize with verified documents', () => {
    const docs = service.getAllDocuments();
    expect(docs.length).toBeGreaterThanOrEqual(6);
    expect(docs.every((d) => d.id && d.version && d.effectiveDate && d.source)).toBe(true);
  });

  it('should retrieve bus cancellation policy for bus refund query', () => {
    const results = service.retrieveRelevantKnowledge('What is the refund if I cancel my bus ticket 12 hours before?');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].document.supplier).toBe('GSRTC');
    expect(results[0].document.content).toContain('Between 2 and 24 hours prior to departure: 50% refund');
  });

  it('should retrieve hotel cancellation policy for hotel booking query', () => {
    const results = service.retrieveRelevantKnowledge('How do I cancel my hotel room and get refund?');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].document.category).toBe('CANCELLATION_REFUND');
    expect(results.some((r) => r.document.supplier === 'HOTELBEDS')).toBe(true);
  });

  it('should retrieve payment reconciliation policy for deducted money query', () => {
    const results = service.retrieveRelevantKnowledge('Money was deducted from my account but booking is pending');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].document.category).toBe('PAYMENT_RECONCILIATION');
    expect(results[0].document.content).toContain('do not retry payment');
  });

  it('should format grounding passages for LLM with version and source', () => {
    const passages = service.buildGroundingPassages('Somnath temple darshan timings');
    expect(passages).toContain('Document: Verified Gujarat & Pan-India Heritage & Tourism Knowledge');
    expect(passages).toContain('Darshan: 6:00 AM - 10:00 PM');
    expect(passages).toContain('Source:');
  });

  it('should return safe message when query is empty', () => {
    const passages = service.buildGroundingPassages('');
    expect(passages).toContain('No specific pre-indexed policy passage');
  });
});
