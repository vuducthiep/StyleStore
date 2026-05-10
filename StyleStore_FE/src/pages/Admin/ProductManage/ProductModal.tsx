import React, { useEffect, useState } from 'react';
import type { AdminProduct } from './ProductTable';
import { useToast } from '../../../components/ToastProvider';
import { buildAuthHeaders, isAuthTokenMissingError } from '../../../services/auth';

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

interface Category {
    id: number;
    name: string;
    description?: string;
    status?: string;
}

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
    brand?: string;
    material?: string;
    color?: string;
    price: number | '';
    thumbnail?: string;
    status?: string;
    category?: {
        id: number;
        name: string;
    };
    productSizes?: ProductSizeDto[];
}

type ProductSizeDto = {
    id?: number;
    size: { id: number; name?: string };
    stock: number | '';
};

type SizeOption = { id: number; name: string };

type AdminProductDetail = AdminProduct & { productSizes?: ProductSizeDto[] };

interface ProductImage {
    id?: number;
    imageUrl: string;
    displayOrder: number;
    createdAt?: string;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, productId, onClose, onSaved }) => {
    const [form, setForm] = useState<ProductForm>({ name: '', description: '', gender: '', brand: '', material: '', color: '', price: '', thumbnail: '', status: 'ACTIVE' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [sizes, setSizes] = useState<SizeOption[]>([]);
    const [productDetailSizes, setProductDetailSizes] = useState<ProductSizeDto[] | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [productImages, setProductImages] = useState<ProductImage[]>([]);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newImagePreview, setNewImagePreview] = useState<string>('');
    const [newImageDisplayOrder, setNewImageDisplayOrder] = useState<number>(1);
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const { pushToast } = useToast();

    const mergeSizesWithStocks = (allSizes: SizeOption[], existing: ProductSizeDto[] | null | undefined): ProductSizeDto[] => {
        return allSizes.map((s) => {
            const matched = existing?.find((ps) => ps.size?.id === s.id);
            return {
                id: matched?.id,
                size: { id: s.id, name: s.name },
                stock: matched?.stock ?? 0,
            };
        });
    };

    // Fetch categories and sizes
    useEffect(() => {
        if (!isOpen) return;
        const fetchCategories = async () => {
            try {
                const authHeaders = buildAuthHeaders();
                const res = await fetch('http://localhost:8080/api/admin/categories', {
                    headers: {
                        'Content-Type': 'application/json',
                        ...authHeaders,
                    },
                });
                if (res.ok) {
                    const data: ApiResponse<Category[]> = await res.json();
                    if (data.success && data.data) {
                        setCategories(data.data);
                    }
                }
            } catch (e) {
                console.error('Fetch categories error:', e);
            }
        };

        const fetchSizes = async () => {
            try {
                const authHeaders = buildAuthHeaders();
                const res = await fetch('http://localhost:8080/api/admin/sizes', {
                    headers: {
                        'Content-Type': 'application/json',
                        ...authHeaders,
                    },
                });
                if (res.ok) {
                    const payload = await res.json();
                    if (Array.isArray(payload)) {
                        setSizes(payload);
                    } else {
                        const data: ApiResponse<SizeOption[]> = payload;
                        if (data.success && data.data) {
                            setSizes(data.data);
                        }
                    }
                }
            } catch (e) {
                console.error('Fetch sizes error:', e);
            }
        };

        fetchCategories();
        fetchSizes();
    }, [isOpen]);

    // When creating new product and sizes are loaded, initialize productSizes with empty stock
    useEffect(() => {
        if (isOpen && !productId && sizes.length > 0) {
            setForm((prev) => ({
                ...prev,
                productSizes: sizes.map((s) => ({ size: { id: s.id, name: s.name }, stock: '' })),
            }));
        }
    }, [isOpen, productId, sizes]);

    // Fetch product detail and images
    useEffect(() => {
        if (!isOpen) return;
        if (!productId) {
            // Reset form for creating new product
            setForm({ name: '', description: '', gender: '', brand: '', material: '', color: '', price: '', thumbnail: '', status: 'ACTIVE' });
            setProductDetailSizes(null);
            setImageFile(null);
            setImagePreview('');
            setProductImages([]);
            setNewImageFile(null);
            setNewImagePreview('');
            setError('');
            return;
        }

        const fetchDetail = async () => {
            setIsLoading(true);
            setError('');
            setImageFile(null);
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
                const data: ApiResponse<AdminProductDetail> = await res.json();
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
                    brand: product.brand || '',
                    material: product.material || '',
                    color: product.color || '',
                    price: product.price || '',
                    thumbnail: product.thumbnail || '',
                    status: product.status || 'ACTIVE',
                    category: product.category,
                    productSizes: sizes.length
                        ? mergeSizesWithStocks(sizes, product.productSizes?.map((ps) => ({
                            id: ps.id,
                            size: { id: ps.size.id, name: ps.size.name },
                            stock: ps.stock ?? 0,
                        })))
                        : product.productSizes?.map((ps) => ({
                            id: ps.id,
                            size: { id: ps.size.id, name: ps.size.name },
                            stock: ps.stock ?? 0,
                        })),
                });
                setProductDetailSizes(
                    product.productSizes?.map((ps) => ({
                        id: ps.id,
                        size: { id: ps.size.id, name: ps.size.name },
                        stock: ps.stock ?? 0,
                    })) || null
                );
                setImagePreview(product.thumbnail || '');

                // Fetch product images
                await fetchProductImages(productId);
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

    // Fetch product images
    const fetchProductImages = async (pId: number) => {
        try {
            const authHeaders = buildAuthHeaders();
            const res = await fetch(`http://localhost:8080/api/admin/products/${pId}/images`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
            });
            if (res.ok) {
                const data: ApiResponse<ProductImage[]> = await res.json();
                if (data.success && data.data) {
                    setProductImages(data.data);
                }
            }
        } catch (e) {
            console.error('Fetch product images error:', e);
        }
    };

    // When sizes load for edit, merge to ensure all sizes appear with default 0
    useEffect(() => {
        if (!isOpen || !productId || sizes.length === 0 || !productDetailSizes) return;
        setForm((prev) => ({
            ...prev,
            productSizes: mergeSizesWithStocks(sizes, prev.productSizes || productDetailSizes),
        }));
    }, [isOpen, productId, sizes, productDetailSizes]);

    const handleChange = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(false);
    };

    const handleDropImage = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                setNewImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setError('Vui lòng thả một file ảnh');
            }
        }
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const authHeaders = buildAuthHeaders();
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch('http://localhost:8080/api/admin/upload/image', {
                method: 'POST',
                headers: {
                    ...authHeaders,
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Upload ảnh thất bại');
            }

            const data: ApiResponse<{ url: string }> = await res.json();
            if (data.success && data.data?.url) {
                return data.data.url;
            }
            throw new Error('Không nhận được URL ảnh');
        } catch (e) {
            console.error('Upload image error:', e);
            return null;
        }
    };

    const handleAddProductImage = async () => {
        if (!newImageFile) {
            setError('Vui lòng chọn ảnh để thêm');
            return;
        }
        if (!productId) {
            setError('Vui lòng lưu sản phẩm trước khi thêm ảnh phụ');
            return;
        }

        setIsUploading(true);
        try {
            const uploadedUrl = await uploadImage(newImageFile);
            if (!uploadedUrl) {
                setError('Upload ảnh thất bại');
                setIsUploading(false);
                return;
            }

            const authHeaders = buildAuthHeaders();
            const res = await fetch(`http://localhost:8080/api/admin/products/${productId}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
                body: JSON.stringify({
                    imageUrl: uploadedUrl,
                    displayOrder: newImageDisplayOrder,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                const message = data.message || 'Thêm ảnh thất bại';
                setError(message);
                setIsUploading(false);
                return;
            }

            const data: ApiResponse<ProductImage> = await res.json();
            if (!data.success) {
                setError(data.message || 'Thêm ảnh thất bại');
                setIsUploading(false);
                return;
            }

            pushToast('Thêm ảnh thành công', 'success');
            setNewImageFile(null);
            setNewImagePreview('');
            setNewImageDisplayOrder(1);
            await fetchProductImages(productId);
        } catch (e) {
            console.error('Add product image error:', e);
            setError('Không thể kết nối máy chủ');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteProductImage = async (imageId: number) => {
        if (!confirm('Bạn chắc chắn muốn xóa ảnh này?')) return;
        if (!productId) return;

        try {
            const authHeaders = buildAuthHeaders();
            const res = await fetch(`http://localhost:8080/api/admin/products/${productId}/images/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
            });

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                const message = data.message || 'Xóa ảnh thất bại';
                setError(message);
                return;
            }

            const data: ApiResponse<void> = await res.json();
            if (!data.success) {
                setError(data.message || 'Xóa ảnh thất bại');
                return;
            }

            pushToast('Xóa ảnh thành công', 'success');
            await fetchProductImages(productId);
        } catch (e) {
            console.error('Delete product image error:', e);
            setError('Không thể kết nối máy chủ');
        }
    };

    const handleUpdateImageDisplayOrder = async (imageId: number, newOrder: number) => {
        if (!productId) return;

        try {
            const authHeaders = buildAuthHeaders();
            const res = await fetch(`http://localhost:8080/api/admin/products/${productId}/images/${imageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
                body: JSON.stringify({
                    displayOrder: newOrder,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                const message = data.message || 'Cập nhật thất bại';
                setError(message);
                return;
            }

            await fetchProductImages(productId);
            pushToast('Cập nhật thứ tự ảnh thành công', 'success');
        } catch (e) {
            console.error('Update image display order error:', e);
            setError('Không thể kết nối máy chủ');
        }
    };

    const uploadMainImage = async (): Promise<string | null> => {
        if (!imageFile) return form.thumbnail || null;

        setIsUploading(true);
        try {
            const url = await uploadImage(imageFile);
            if (!url) {
                setError('Upload ảnh thất bại. Vui lòng thử lại.');
            }
            return url;
        } finally {
            setIsUploading(false);
        }
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
        if (!form.category?.id) {
            setError('Vui lòng chọn danh mục');
            return;
        }

        setIsSaving(true);
        setError('');
        try {
            // Upload image if new file selected
            let thumbnailUrl: string | undefined = form.thumbnail;
            if (imageFile) {
                const uploadedUrl = await uploadMainImage();
                if (!uploadedUrl) {
                    setIsSaving(false);
                    return;
                }
                thumbnailUrl = uploadedUrl;
            }

            const authHeaders = buildAuthHeaders();
            const method = productId ? 'PUT' : 'POST';
            const url = productId ? `http://localhost:8080/api/admin/products/${productId}` : 'http://localhost:8080/api/admin/products';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
                body: JSON.stringify({
                    ...form,
                    thumbnail: thumbnailUrl || form.thumbnail,
                    productSizes: form.productSizes?.map((ps) => ({
                        id: ps.id,
                        size: { id: ps.size.id },
                        stock: ps.stock === '' ? 0 : Number(ps.stock),
                    })),
                }),
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
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-lg border border-slate-200">
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
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                        Thương hiệu
                                        <input
                                            type="text"
                                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            value={form.brand || ''}
                                            onChange={(e) => handleChange('brand', e.target.value)}
                                            placeholder="Nhập tên thương hiệu"
                                        />
                                    </label>
                                    <label className="text-sm text-slate-700">
                                        Chất liệu
                                        <input
                                            type="text"
                                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            value={form.material || ''}
                                            onChange={(e) => handleChange('material', e.target.value)}
                                            placeholder="Nhập chất liệu"
                                        />
                                    </label>
                                    <label className="text-sm text-slate-700">
                                        Màu sắc
                                        <input
                                            type="text"
                                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            value={form.color || ''}
                                            onChange={(e) => handleChange('color', e.target.value)}
                                            placeholder="Nhập màu sắc"
                                        />
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
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
                                    Danh mục <span className="text-red-500">*</span>
                                    <select
                                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        value={form.category?.id || ''}
                                        onChange={(e) => {
                                            const selectedCategory = categories.find(c => c.id === parseInt(e.target.value));
                                            handleChange('category', selectedCategory);
                                        }}
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="text-sm text-slate-700">
                                    Hình ảnh sản phẩm
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        onChange={handleImageChange}
                                        disabled={isUploading}
                                    />
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded border border-slate-200"
                                            />
                                        </div>
                                    )}
                                    {isUploading && (
                                        <div className="mt-2 text-xs text-blue-600">Đang upload ảnh...</div>
                                    )}
                                </label>
                                <div className="space-y-3">
                                    <div className="text-sm font-medium text-slate-800">Kích thước & tồn kho</div>
                                    {(form.productSizes || []).map((ps, idx) => (
                                        <div key={idx} className="grid grid-cols-2 gap-3 items-center">
                                            <label className="text-sm text-slate-700 flex flex-col">
                                                <span className="mb-1">Size</span>
                                                <select
                                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    value={ps.size?.id || ''}
                                                    onChange={(e) => {
                                                        const sizeId = parseInt(e.target.value);
                                                        const selected = sizes.find((s) => s.id === sizeId);
                                                        setForm((prev) => {
                                                            const next = [...(prev.productSizes || [])];
                                                            next[idx] = {
                                                                ...next[idx],
                                                                size: selected ? { id: selected.id, name: selected.name } : ps.size,
                                                            } as ProductSizeDto;
                                                            return { ...prev, productSizes: next };
                                                        });
                                                    }}
                                                >
                                                    <option value="">-- Chọn size --</option>
                                                    {sizes.map((s) => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label className="text-sm text-slate-700 flex flex-col">
                                                <span className="mb-1">Tồn kho</span>
                                                <input
                                                    type="number"
                                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    value={ps.stock}
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                                        setForm((prev) => {
                                                            const next = [...(prev.productSizes || [])];
                                                            next[idx] = { ...next[idx], stock: isNaN(val as number) ? '' : val } as ProductSizeDto;
                                                            return { ...prev, productSizes: next };
                                                        });
                                                    }}
                                                    placeholder="0"
                                                    min={0}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                </div>
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

                                {/* Product Images Section */}
                                {productId && (
                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <div className="text-lg font-semibold text-slate-800 mb-4">Hình ảnh phụ</div>

                                        {/* Add new image */}
                                        <div className="bg-slate-50 rounded p-4 mb-4 space-y-3">
                                            <div className="text-sm font-medium text-slate-700">Thêm hình ảnh mới</div>
                                            
                                            {/* Drag and drop area */}
                                            <div
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDropImage}
                                                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition ${
                                                    isDraggingImage
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-slate-300 bg-white hover:border-blue-400'
                                                }`}
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    id="dropzone-file"
                                                    className="hidden"
                                                    onChange={handleNewImageChange}
                                                    disabled={isUploading}
                                                />
                                                <label
                                                    htmlFor="dropzone-file"
                                                    className="cursor-pointer block"
                                                >
                                                    <div className="flex flex-col items-center justify-center">
                                                        <svg
                                                            className="w-8 h-8 text-slate-400 mb-2"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 4v16m8-8H4"
                                                            />
                                                        </svg>
                                                        <p className="text-sm text-slate-600">
                                                            <span className="font-semibold">Kéo thả ảnh</span> hoặc{' '}
                                                            <span className="text-blue-600 font-semibold">chọn file</span>
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF tối đa 10MB</p>
                                                    </div>
                                                </label>
                                            </div>

                                            {newImagePreview && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-slate-600 mb-2">Preview ảnh:</p>
                                                    <img
                                                        src={newImagePreview}
                                                        alt="New Preview"
                                                        className="w-32 h-32 object-cover rounded border border-slate-200 mx-auto"
                                                    />
                                                </div>
                                            )}
                                            <label className="text-sm text-slate-700">
                                                Thứ tự hiển thị
                                                <input
                                                    type="number"
                                                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    value={newImageDisplayOrder}
                                                    onChange={(e) => setNewImageDisplayOrder(parseInt(e.target.value) || 1)}
                                                    min={1}
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleAddProductImage}
                                                disabled={isUploading || !newImageFile}
                                                className="w-full px-3 py-2 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                                            >
                                                {isUploading ? 'Đang upload...' : 'Thêm ảnh'}
                                            </button>
                                        </div>

                                        {/* List existing images */}
                                        {productImages.length > 0 ? (
                                            <div className="space-y-2">
                                                <div className="text-sm font-medium text-slate-700 mb-3">Danh sách ảnh phụ ({productImages.length})</div>
                                                {productImages.map((img) => (
                                                    <div key={img.id} className="flex items-center gap-3 bg-slate-50 rounded p-3 border border-slate-200">
                                                        <img
                                                            src={img.imageUrl}
                                                            alt="Product"
                                                            className="w-16 h-16 object-cover rounded border border-slate-300"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-slate-500">ID: {img.id}</p>
                                                            <div className="text-xs text-slate-600 truncate">{img.imageUrl}</div>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <label className="text-xs text-slate-700">
                                                                    Thứ tự:
                                                                    <input
                                                                        type="number"
                                                                        className="ml-1 w-12 rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                        value={img.displayOrder}
                                                                        onChange={(e) => handleUpdateImageDisplayOrder(img.id || 0, parseInt(e.target.value) || 1)}
                                                                        min={1}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteProductImage(img.id || 0)}
                                                            className="px-3 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200 text-xs font-medium transition"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-slate-500 text-center py-4 bg-slate-50 rounded border border-dashed border-slate-300">
                                                Chưa có ảnh phụ
                                            </div>
                                        )}
                                    </div>
                                )}
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
                        disabled={isSaving || isLoading || isUploading}
                    >
                        {isSaving ? 'Đang lưu...' : isUploading ? 'Đang upload...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;