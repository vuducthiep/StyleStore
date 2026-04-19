import { ArrowRight, RefreshCw, ShoppingBag } from 'lucide-react';
import type { ChatMessage } from '../AIChat.types';
import type { AiRecommendedProduct } from '../../../../services/aiChat';

type AIChatChatPanelProps = {
    messages: ChatMessage[];
    draft: string;
    isLoading: boolean;
    error: string;
    onDraftChange: (value: string) => void;
    onSendMessage: (question: string) => void;
    onClearChat: () => void;
    listRef: React.RefObject<HTMLDivElement | null>;
};

const formatPrice = (price?: number) => {
    if (price === undefined || price === null) {
        return 'Liên hệ';
    }

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

const ProductPreview = ({ messageId, product }: { messageId: string; product: AiRecommendedProduct }) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex gap-3 p-3">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-200">
                    {product.thumbnail ? (
                        <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-500">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                            <p className="mt-1 text-xs text-slate-500">
                                {product.category || 'Không rõ danh mục'}
                                {product.brand ? ` • ${product.brand}` : ''}
                            </p>
                        </div>
                        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                            {formatPrice(product.price)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AIChatChatPanel = ({
    messages,
    draft,
    isLoading,
    error,
    onDraftChange,
    onSendMessage,
    onClearChat,
    listRef,
}: AIChatChatPanelProps) => {
    return (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
            <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Chat với AI</h2>
                        <p className="text-sm text-slate-500">Gõ câu hỏi hoặc chọn một gợi ý sẵn.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClearChat}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-orange-300 hover:text-orange-600"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Xóa đoạn chat
                    </button>
                </div>
            </div>

            <div
                ref={listRef}
                className="max-h-[28rem] space-y-4 overflow-y-auto bg-slate-50/80 px-4 py-5 sm:max-h-[34rem] sm:px-6"
            >
                {messages.map((message) => {
                    const isUser = message.role === 'user';

                    return (
                        <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[92%] rounded-[1.5rem] px-4 py-3 shadow-sm sm:max-w-[85%] ${
                                    isUser ? 'bg-orange-500 text-white' : 'border border-slate-200 bg-white text-slate-800'
                                }`}
                            >
                                <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>

                                {message.products && message.products.length > 0 && (
                                    <div className="mt-4 grid gap-3">
                                        {message.products.map((product) => (
                                            <ProductPreview key={`${message.id}-${product.id ?? product.name}`} messageId={message.id} product={product} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                            AI đang suy nghĩ...
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
                {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <textarea
                        value={draft}
                        onChange={(e) => onDraftChange(e.target.value)}
                        placeholder="Ví dụ: Gợi ý áo nam màu trung tính dưới 500k, dễ phối đồ"
                        rows={2}
                        className="min-h-[56px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSendMessage(draft);
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => onSendMessage(draft)}
                        disabled={!draft.trim() || isLoading}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:h-auto"
                    >
                        <ArrowRight className="h-4 w-4" />
                        Gửi câu hỏi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatChatPanel;
