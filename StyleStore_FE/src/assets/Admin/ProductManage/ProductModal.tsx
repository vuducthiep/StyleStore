import React, { useEffect, useState } from 'react';
import type { AdminProduct } from './ProductTable';
import { useToast } from '../../../components/ToastProvider';
import { buildAuthHeaders, isAuthTokenMissingError } from '../../../services/auth';

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

interface ProductModalProps {
    isOpen: boolean;
    productId: number | null;
    onClose: () => void;
    onSaved?: () => void;
}

interface ProductForm {
    name: string;
    description?: string;
    gender?: string;
    price: number | '';
    thumbnail?: string;
    status?: string;
    category?: {
        id: number;
        name: string;
    };
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, productId, onClose, onSaved }) => {
    const [form, setForm] = useState<ProductForm>({ name: '', description: '', gender: '', price: '', thumbnail: '', status: 'ACTIVE' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const { pushToast } = useToast();

    useEffect(() => {
        if (!isOpen) return;
        if (!productId) {
            // Reset form for creating new product
            setForm({ name: '', description: '', gender: '', price: '', thumbnail: '', status: 'ACTIVE' });
            setError('');
            return;
        }

        const fetchDetail = async () => {
            setIsLoading(true);
            setError('');
            try {
                const authHeaders = buildAuthHeaders();
                const res = await fetch(`http://localhost:8080/api/admin/products/${productId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...authHeaders,
                    },
                });
                if (!res.ok) {
                    const text = await res.text();
                    const data = text ? JSON.parse(text) : {};
                    const message = data.message || `Không tải được thông tin sản phẩm (code ${res.status}).`;
                    setError(message);
                    return;
                }
                const data: ApiResponse<AdminProduct> = await res.json();
                if (!data.success) {
                    setError(data.message || 'Không tải được thông tin sản phẩm.');
                    return;
                }
                const product = data.data;
                if (!product) {
                    setError('Dữ liệu trả về không hợp lệ.');
                    return;
                }
                setForm({
                    name: product.name || '',
                    description: product.description || '',
                    gender: product.gender || '',
                    price: product.price || '',
                    thumbnail: product.thumbnail || '',
                    status: product.status || 'ACTIVE',
                    category: product.category,
                });
            } catch (e) {
                if (isAuthTokenMissingError(e)) {
                    setError('Bạn chưa đăng nhập hoặc thiếu token.');
                    return;
                }
                console.error('Fetch product detail error:', e);
                setError('Không thể kết nối máy chủ.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [isOpen, productId]);

    const handleChange = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!form.name) {
            setError('Tên sản phẩm không được để trống');
            return;
        }
        if (!form.price) {
            setError('Giá sản phẩm không được để trống');
            return;
        }

        setIsSaving(true);
        setError('');
        try {
            const authHeaders = buildAuthHeaders();
            const method = productId ? 'PUT' : 'POST';
            const url = productId ? `http://localhost:8080/api/admin/products/${productId}` : 'http://localhost:8080/api/admin/products';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                const message = data.message || `Lưu thất bại (code ${res.status}).`;
                setError(message);
                return;
            }

            const data: ApiResponse<AdminProduct> = await res.json();
            if (!data.success) {
                setError(data.message || 'Lưu thất bại.');
                return;
            }

            onSaved?.();
            const successMsg = productId ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công';
            pushToast(successMsg, 'success');
            onClose();
        } catch (e) {
            if (isAuthTokenMissingError(e)) {
                setError('Bạn chưa đăng nhập hoặc thiếu token.');
                return;
            }
            console.error('Save product error:', e);
            setError('Không thể kết nối máy chủ.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const isNewProduct = !productId;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg border border-slate-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {isNewProduct ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
                        </h3>
                        {productId && <p className="text-xs text-slate-500">ID: {productId}</p>}
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        ✕
                    </button>
                </div>

                <div className="px-5 py-4 space-y-4">
                    {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</div>}
                    {isLoading ? (
                        <div className="text-sm text-slate-600">Đang tải thông tin sản phẩm...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4">
                                <label className="text-sm text-slate-700">
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        value={form.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Nhập tên sản phẩm"
                                    />
                                </label>
                                <label className="text-sm text-slate-700">
                                    Mô tả
                                    <textarea
                                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        value={form.description || ''}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Nhập mô tả sản phẩm"
                                        rows={3}
                                    />
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="text-sm text-slate-700">
                                        Giới tính
                                        <select
                                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            value={form.gender || ''}
                                            onChange={(e) => handleChange('gender', e.target.value)}
                                        >
                                            <option value="">-- Chọn --</option>
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Unisex">Unisex</option>
                                        </select>
                                    </label>
                                    <label className="text-sm text-slate-700">
                                        Giá <span className="text-red-500">*</span>
                                        <input
                                            type="number"
                                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            value={form.price}
                                            onChange={(e) => handleChange('price', e.target.value ? parseInt(e.target.value) : '')}
                                            placeholder="Nhập giá"
                                        />
                                    </label>
                                </div>
                                <label className="text-sm text-slate-700">
                                    Link ảnh đại diện
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        value={form.thumbnail || ''}
                                        onChange={(e) => handleChange('thumbnail', e.target.value)}
                                        placeholder="Nhập URL ảnh"
                                    />
                                </label>
                                <label className="text-sm text-slate-700">
                                    Trạng thái
                                    <select
                                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        value={form.status || ''}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </label>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-white transition"
                        disabled={isSaving}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                        disabled={isSaving || isLoading}
                    >
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;