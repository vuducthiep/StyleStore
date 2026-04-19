import type { AiRecommendedProduct } from '../../../services/aiChat';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
    id: string;
    role: ChatRole;
    content: string;
    products?: AiRecommendedProduct[];
};
