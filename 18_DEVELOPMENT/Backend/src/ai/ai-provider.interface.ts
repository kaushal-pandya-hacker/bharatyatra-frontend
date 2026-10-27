export interface AIProviderInterface {
  generateText(prompt: string, options?: any): Promise<string>;
  generateStructuredOutput<T = any>(prompt: string, schema?: any, options?: any): Promise<T>;
  classifyIntent(text: string): Promise<string>;
  generateTrip(input: any): Promise<any>;
  modifyTrip(currentTrip: any, modificationInstruction: string): Promise<any>;
  summarizeConversation(messages: any[]): Promise<string>;
}
