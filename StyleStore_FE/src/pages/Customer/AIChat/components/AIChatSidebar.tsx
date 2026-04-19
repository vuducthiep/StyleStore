import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AiRecommendedProduct } from '../../../../services/aiChat';

type AIChatSidebarProps = {
    products: AiRecommendedProduct[];
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

const getMatchLabel = (score?: number) => {
    if (score === undefined || score === null || Number.isNaN(score)) {
        return null;
    }

    if (score <= 0) {
        return 'Đề xuất phù hợp';
    }

    const normalizedScore = score > 1 ? score / 100 : score;
    const percent = Math.max(1, Math.min(100, Math.round(normalizedScore * 100)));

    if (percent >= 80) {
        return `${percent}% khớp`;
    }

    if (percent >= 50) {
        return `${percent}% khớp`;
    }

    if (percent >= 20) {
        return `${percent}% tham khảo`;
    }

    return 'Đề xuất phù hợp';
};

const AIChatSidebar = ({ products }: AIChatSidebarProps) => {
    return (
        <aside className="space-y-6 lg:sticky lg:top-6">
            <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
                <h3 className="text-lg font-bold text-emerald-950">Sản phẩm vừa được AI gợi ý</h3>
                <p className="mt-1 text-sm text-emerald-800/80">Hiển thị 1 nhóm gợi ý gần nhất từ kết quả RAG.</p>

                <div className="mt-5 space-y-3">
                    {products.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-4 text-sm text-emerald-900/70">
                            Chưa có gợi ý nào. Hãy gửi một câu hỏi để nhận đề xuất sản phẩm.
                        </div>
                    )}

                    {products.map((product) => (
                        <div key={product.id ?? product.name} className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm sm:flex-row sm:items-center">
                            <div className="h-14 w-14 overflow-hidden rounded-xl bg-emerald-100">
                                {product.thumbnail ? (
                                    <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-emerald-700">
                                        <ShoppingBag className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                                        <p className="mt-1 text-xs text-slate-500">{product.category || 'Không rõ danh mục'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-700">{formatPrice(product.price)}</p>
                                        {getMatchLabel(product.score) && <p className="text-[11px] text-slate-500">{getMatchLabel(product.score)}</p>}
                                    </div>
                                </div>

                                <div className="mt-3 flex justify-end">
                                    {product.id ? (
                                        <Link
                                            to={`/product/${product.id}`}
                                            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400"
                                        >
                                            Xem chi tiết
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-lg font-bold text-slate-900">Mẹo hỏi AI hiệu quả</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <li>• Nêu rõ giới tính, kiểu trang phục và ngân sách.</li>
                    <li>• Thêm màu sắc, chất liệu, hoặc dịp sử dụng nếu có.</li>
                    <li>• Hỏi theo cách tự nhiên như đang nói với tư vấn viên.</li>
                </ul>
            </div>
        </aside>
    );
};

export default AIChatSidebar;
