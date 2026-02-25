import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { buildAuthHeaders } from '../../../services/auth';
import type { AdminPromotion } from './PromotionTable';

interface PromotionModalProps {
    isOpen: boolean;
    promotion: AdminPromotion | null;
    onClose: () => void;
    onSuccess: (message: string) => void;
}

interface PromotionFormData {
    code: string;
    name: string;
    description: string;
    discountPercent: string;
    maxDiscountAmount: string;
    minOrderAmount: string;
    startAt: string;
    endAt: string;
    isActive: boolean;
}

const toLocalDateTimeInput = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toPayloadDateTime = (value: string) => {
    return value.length === 16 ? `${value}:00` : value;
};

const defaultFormData: PromotionFormData = {
    code: '',
    name: '',
    description: '',
    discountPercent: '',
    maxDiscountAmount: '',
    minOrderAmount: '0',
    startAt: '',
    endAt: '',
    isActive: true,
};

const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, promotion, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<PromotionFormData>(defaultFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (promotion) {
            setFormData({
                code: promotion.code || '',
                name: promotion.name || '',
                description: promotion.description || '',
                discountPercent: promotion.discountPercent?.toString() || '',
                maxDiscountAmount: promotion.maxDiscountAmount?.toString() || '',
                minOrderAmount: promotion.minOrderAmount?.toString() || '0',
                startAt: toLocalDateTimeInput(promotion.startAt),
                endAt: toLocalDateTimeInput(promotion.endAt),
                isActive: promotion.isActive,
            });
        } else {
            setFormData(defaultFormData);
        }
        setError('');
    }, [promotion, isOpen]);

    const validateForm = () => {
        const discountPercent = Number(formData.discountPercent);
        const maxDiscountAmount = Number(formData.maxDiscountAmount);
        const minOrderAmount = Number(formData.minOrderAmount);

        if (!formData.code.trim()) {
            return 'Mã khuyến mãi không được để trống';
        }
        if (!formData.name.trim()) {
            return 'Tên khuyến mãi không được để trống';
        }
        if (!(discountPercent > 0 && discountPercent <= 100)) {
            return 'Phần trăm giảm phải lớn hơn 0 và không vượt quá 100';
        }
        if (!(maxDiscountAmount > 0)) {
            return 'Giảm tối đa phải lớn hơn 0';
        }
        if (minOrderAmount < 0) {
            return 'Đơn tối thiểu không được nhỏ hơn 0';
        }
        if (!formData.startAt || !formData.endAt) {
            return 'Thời gian bắt đầu và kết thúc là bắt buộc';
        }
        if (new Date(formData.endAt) <= new Date(formData.startAt)) {
            return 'Thời gian kết thúc phải sau thời gian bắt đầu';
        }

        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            const authHeaders = buildAuthHeaders();
            const url = promotion
                ? `http://localhost:8080/api/admin/promotions/${promotion.id}`
                : 'http://localhost:8080/api/admin/promotions';
            const method = promotion ? 'PUT' : 'POST';

            const payload = {
                code: formData.code.trim().toUpperCase(),
                name: formData.name.trim(),
                description: formData.description.trim(),
                discountPercent: Number(formData.discountPercent),
                maxDiscountAmount: Number(formData.maxDiscountAmount),
                minOrderAmount: Number(formData.minOrderAmount),
                startAt: toPayloadDateTime(formData.startAt),
                endAt: toPayloadDateTime(formData.endAt),
                isActive: formData.isActive,
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
                body: JSON.stringify(payload),
            });

            const text = await res.text();
            const data = text ? JSON.parse(text) : {};

            if (!res.ok || !data.success) {
                throw new Error(data.message || `Lỗi ${promotion ? 'cập nhật' : 'tạo'} khuyến mãi.`);
            }

            onSuccess(promotion ? 'Cập nhật khuyến mãi thành công' : 'Tạo khuyến mãi thành công');
            onClose();
        } catch (err: unknown) {
            setError((err as Error)?.message || 'Có lỗi xảy ra.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {promotion ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                        type="button"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Mã khuyến mãi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="VD: SPRING15"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Tên khuyến mãi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập tên khuyến mãi"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Giảm giá (%) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0.01"
                                max="100"
                                step="0.01"
                                required
                                value={formData.discountPercent}
                                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Giảm tối đa (VND) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                required
                                value={formData.maxDiscountAmount}
                                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Đơn tối thiểu (VND) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={formData.minOrderAmount}
                                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Trạng thái <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'ACTIVE' })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.startAt}
                                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Kết thúc <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.endAt}
                                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Nhập mô tả khuyến mãi"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang lưu...' : promotion ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PromotionModal;
