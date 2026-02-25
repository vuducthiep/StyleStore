import { useEffect, useMemo, useState } from "react";
import { TicketPercent } from "lucide-react";
import { useToast } from "../../../components/ToastProvider";

export interface Promotion {
    id: number;
    code: string;
    name: string;
    description: string;
    discountPercent: number;
    maxDiscountAmount: number;
    minOrderAmount: number;
    startAt: string;
    endAt: string;
    isActive: boolean;
}

interface PromotionApiResponse {
    success: boolean;
    message: string;
    data: Promotion[];
}

interface PromotionSelectorProps {
    orderTotal: number;
    selectedPromotionId: number | null;
    onPromotionChange: (promotion: Promotion | null) => void;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);
};

export default function PromotionSelector({
    orderTotal,
    selectedPromotionId,
    onPromotionChange,
}: PromotionSelectorProps) {
    const { pushToast } = useToast();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:8080/api/user/promotions/available", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách khuyến mãi");
                }

                const result: PromotionApiResponse = await response.json();
                setPromotions(result.data || []);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Có lỗi khi tải khuyến mãi");
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    const selectedPromotion = useMemo(
        () => promotions.find((promotion) => promotion.id === selectedPromotionId) || null,
        [promotions, selectedPromotionId]
    );

    useEffect(() => {
        if (!selectedPromotion) return;

        if (orderTotal < selectedPromotion.minOrderAmount) {
            pushToast(
                `Khuyến mãi ${selectedPromotion.code} yêu cầu đơn tối thiểu ${formatPrice(selectedPromotion.minOrderAmount)}`,
                "error"
            );
            onPromotionChange(null);
        }
    }, [orderTotal, selectedPromotion, onPromotionChange, pushToast]);

    const handleSelectPromotion = (promotionId: string) => {
        if (!promotionId) {
            onPromotionChange(null);
            return;
        }

        const promotion = promotions.find((item) => item.id === Number(promotionId));
        if (!promotion) {
            onPromotionChange(null);
            return;
        }

        if (orderTotal < promotion.minOrderAmount) {
            pushToast(
                `Đơn hàng chưa đạt tối thiểu ${formatPrice(promotion.minOrderAmount)} để áp dụng ${promotion.code}`,
                "error"
            );
            return;
        }

        onPromotionChange(promotion);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <TicketPercent size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Khuyến mãi</h3>
            </div>

            {loading ? (
                <p className="text-sm text-gray-600">Đang tải khuyến mãi...</p>
            ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
            ) : promotions.length === 0 ? (
                <p className="text-sm text-gray-600">Hiện chưa có khuyến mãi khả dụng.</p>
            ) : (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Chọn khuyến mãi
                    </label>
                    <select
                        value={selectedPromotionId?.toString() || ""}
                        onChange={(e) => handleSelectPromotion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="">Không áp dụng khuyến mãi</option>
                        {promotions.map((promotion) => (
                            <option key={promotion.id} value={promotion.id}>
                                {promotion.code} - {promotion.name}
                            </option>
                        ))}
                    </select>

                    {selectedPromotion ? (
                        <div className="mt-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-gray-900">
                                    {selectedPromotion.code} - {selectedPromotion.name}
                                </p>
                                <p className="text-sm font-semibold text-blue-600">
                                    -{selectedPromotion.discountPercent}%
                                </p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{selectedPromotion.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Đơn tối thiểu: {formatPrice(selectedPromotion.minOrderAmount)} · Giảm tối đa: {formatPrice(selectedPromotion.maxDiscountAmount)}
                            </p>
                        </div>
                    ) : (
                        <div className="mt-3 space-y-1">
                            {promotions.map((promotion) => {
                                const isEligible = orderTotal >= promotion.minOrderAmount;
                                return (
                                    <p
                                        key={promotion.id}
                                        className={`text-xs ${isEligible ? "text-gray-500" : "text-red-500"}`}
                                    >
                                        {promotion.code}: Tối thiểu {formatPrice(promotion.minOrderAmount)}
                                    </p>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}