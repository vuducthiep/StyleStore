import React, { useCallback, useEffect, useState } from 'react';
import { buildAuthHeaders, isAuthTokenMissingError } from '../../../services/auth';

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

type PageResult<T> = {
    content: T[];
    number: number;
    totalPages: number;
    totalElements: number;
};

export interface AdminProduct {
    id: number;
    name: string;
    description?: string;
    gender?: string;
    brand?: string;
    price: number;
    thumbnail?: string;
    status?: string;
    category?: {
        id: number;
        name: string;
    };
    createdAt?: string;
}

interface ProductTableProps {
    refreshKey?: number;
    onEdit?: (product: AdminProduct) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ refreshKey = 0, onEdit }) => {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchProducts = useCallback(async (pageIndex = 0) => {
        setIsLoading(true);
        setError('');

        try {
            const authHeaders = buildAuthHeaders();
            // Fetch products list from backend
            const res = await fetch(`http://localhost:8080/api/admin/products?page=${pageIndex}&size=${size}&sortBy=createdAt&sortDir=desc`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
            });

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                const message = data.message || `Lỗi tải danh sách sản phẩm (code ${res.status}).`;
                setError(message);
                return;
            }

            const data: ApiResponse<PageResult<AdminProduct>> = await res.json();
            if (!data.success) {
                setError(data.message || 'Lỗi tải danh sách sản phẩm.');
                return;
            }

            const pageData = data.data;
            if (!pageData) {
                setError('Dữ liệu trả về không hợp lệ.');
                return;
            }

            setProducts(pageData.content || []);
            setPage(pageData.number ?? pageIndex);
            setTotalPages(pageData.totalPages ?? 0);
            setTotalElements(pageData.totalElements ?? 0);
        } catch (e) {
            if (isAuthTokenMissingError(e)) {
                setError('Bạn chưa đăng nhập hoặc thiếu token.');
                return;
            }
            console.error('Fetch products error:', e);
            setError('Không thể kết nối máy chủ.');
        } finally {
            setIsLoading(false);
        }
    }, [size]);

    useEffect(() => {
        fetchProducts(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchProducts, page, refreshKey]);

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
        fetchProducts(nextPage);
    };

    return (
        <div className="w-full flex-1 bg-white shadow rounded-lg overflow-hidden border border-slate-200">
            <div className="p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Danh sách sản phẩm</h2>
                <div className="flex items-center gap-2">
                    {error && (
                        <button
                            onClick={() => fetchProducts(page)}
                            className="text-sm px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                            Thử lại
                        </button>
                    )}
                    <button
                        onClick={() => fetchProducts(page)}
                        className="text-sm px-3 py-1 rounded border border-slate-200 hover:bg-slate-50"
                    >
                        Tải lại
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="p-4 text-slate-500">Đang tải...</div>
            ) : error ? (
                <div className="p-4 text-red-600 text-sm">{error}</div>
            ) : products.length === 0 ? (
                <div className="p-4 text-slate-500 text-sm">Chưa có sản phẩm.</div>
            ) : (
                <div className="overflow-x-auto w-full">
                    <table className="min-w-full w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-2 text-left">ID</th>
                                <th className="px-4 py-2 text-left">Hình ảnh</th>
                                <th className="px-4 py-2 text-left">Tên sản phẩm</th>
                                <th className="px-4 py-2 text-left">Thương hiệu</th>
                                <th className="px-4 py-2 text-left">Giới tính</th>
                                <th className="px-4 py-2 text-left">Giá</th>
                                <th className="px-4 py-2 text-left">Danh mục</th>
                                <th className="px-4 py-2 text-left">Trạng thái</th>
                                <th className="px-4 py-2 text-left">Ngày tạo</th>
                                <th className="px-4 py-2 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2">{product.id}</td>
                                    <td className="px-4 py-2">
                                        {product.thumbnail ? (
                                            <img
                                                src={product.thumbnail}
                                                alt={product.name}
                                                className="w-12 h-12 object-cover rounded border border-slate-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                                                No img
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 font-medium">{product.name}</td>
                                    <td className="px-4 py-2">{product.brand || '-'}</td>
                                    <td className="px-4 py-2">{product.gender || '-'}</td>
                                    <td className="px-4 py-2">
                                        {product.price.toLocaleString('vi-VN')}₫
                                    </td>
                                    <td className="px-4 py-2">{product.category?.name || '-'}</td>
                                    <td className="px-4 py-2">
                                        <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">{product.status || '-'}</span>
                                    </td>
                                    <td className="px-4 py-2">{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '-'}</td>
                                    <td className="px-4 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() => onEdit?.(product)}
                                            className="p-2 rounded border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition"
                                            title="Sửa"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 012.652 2.652l-1.688 1.687m-2.651-2.651L6.478 15.37a4.5 4.5 0 00-1.184 2.216l-.3 1.201a.75.75 0 00.91.91l1.2-.3a4.5 4.5 0 002.217-1.184l9.383-9.383m-2.651-2.651l2.651 2.651" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-700">
                    <span>
                        Trang {page + 1}/{totalPages} • Tổng {totalElements} sản phẩm
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(page - 1, 0))}
                            disabled={page === 0}
                            className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 hover:bg-slate-50"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => handlePageChange(Math.min(page + 1, totalPages - 1))}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 hover:bg-slate-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductTable;