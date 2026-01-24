import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { buildAuthHeaders } from '../../../services/auth';
import type { AdminCategory } from './CategoryTable';

interface CategoryModalProps {
    isOpen: boolean;
    category: AdminCategory | null;
    onClose: () => void;
    onSuccess: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, category, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'ACTIVE',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                description: category.description || '',
                status: category.status || 'ACTIVE',
            });
        } else {
            setFormData({
                name: '',
                description: '',
                status: 'ACTIVE',
            });
        }
        setError('');
    }, [category, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const authHeaders = buildAuthHeaders();
            const url = category
                ? `http://localhost:8080/api/admin/categories/${category.id}`
                : `http://localhost:8080/api/admin/categories`;

            const method = category ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                throw new Error(data.message || `Lỗi ${category ? 'cập nhật' : 'tạo'} danh mục.`);
            }

            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || `Lỗi ${category ? 'cập nhật' : 'tạo'} danh mục.`);
            }

            onSuccess();
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                        type="button"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tên danh mục <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập tên danh mục"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập mô tả danh mục"
                            rows={4}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Trạng thái <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </select>
                    </div>

                    {/* Actions */}
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
                            {isSubmitting ? 'Đang lưu...' : category ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
