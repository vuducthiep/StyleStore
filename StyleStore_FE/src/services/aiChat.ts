export interface AiChatRequest {
    question: string;
    top_k?: number;
    gender?: string;
    category?: string;
    brand?: string;
    max_price?: number;
}

export interface AiRecommendedProduct {
    id?: number;
    name: string;
    price?: number;
    category?: string;
    brand?: string;
    thumbnail?: string;
    score?: number;
}

export interface AiChatResponse {
    answer: string;
    product_ids: number[];
    products: AiRecommendedProduct[];
    source_count: number;
}

export interface AiProductDetailResponse {
    success: boolean;
    message: string;
    data: {
        id: number;
        name: string;
        price: number;
        thumbnail?: string;
        category?: {
            name?: string;
        };
        brand?: string;
    };
}

const DEFAULT_AI_BASE_URL = 'http://localhost:8001';

const getAiBaseUrl = (): string => {
    return import.meta.env.VITE_AI_SERVICE_URL || DEFAULT_AI_BASE_URL;
};

export const askProductAi = async (payload: AiChatRequest): Promise<AiChatResponse> => {
    const response = await fetch(`${getAiBaseUrl()}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let message = 'Không thể kết nối tới AI service.';
        try {
            const data = (await response.json()) as { detail?: string; message?: string };
            message = data.detail || data.message || message;
        } catch {
            // ignore parse errors and keep default message
        }
        throw new Error(message);
    }

    const data = (await response.json()) as Partial<AiChatResponse>;

    return {
        answer: data.answer || '',
        product_ids: Array.isArray(data.product_ids) ? data.product_ids : [],
        products: Array.isArray(data.products) ? data.products : [],
        source_count: typeof data.source_count === 'number' ? data.source_count : 0,
    };
};

export const fetchAiProductById = async (productId: number): Promise<AiRecommendedProduct | null> => {
    try {
        const response = await fetch(`http://localhost:8080/api/user/products/${productId}`);

        if (!response.ok) {
            return null;
        }

        const payload = (await response.json()) as AiProductDetailResponse;
        const product = payload.data;

        return {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category?.name,
            brand: product.brand,
            thumbnail: product.thumbnail,
        };
    } catch {
        return null;
    }
};
