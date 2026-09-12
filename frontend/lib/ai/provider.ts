export type KnowledgeBaseEntry = {
  question: string;
  keywords: string[];
  answer: string;
};

export interface AiProvider {
  getReply(message: string, knowledgeBase: KnowledgeBaseEntry[]): Promise<{ reply: string | null }>;
}
