import React, { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useToast } from '../../../components/ToastProvider';
import { buildAuthHeaders, isAuthTokenMissingError } from '../../../services/auth';

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

type PageResult<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // current page (0-based)
    size: number;
};

export interface UserOrder {
    id: number;
    userId: number;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    promotionCode?: string | null;
    shippingAddress: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface UserOrderTableProps {
    refreshKey?: number;
    onViewDetail?: (order: UserOrder) => void;
    onCancel?: (order: UserOrder) => void;
}

const User_OrderTable: React.FC<UserOrderTableProps> = ({
    refreshKey = 0,
    onViewDetail,
    onCancel,
}) => {
    const [orders, setOrders] = useState<UserOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        order?: UserOrder;
        action?: 'cancel' | 'confirm-delivery';
        isLoading: boolean;
    }>({ open: false, isLoading: false });

    const { pushToast } = useToast();

    const fetchOrders = useCallback(async (pageParam = page, sizeParam = size) => {
        setIsLoading(true);
        setError('');

        try {
            const authHeaders = buildAuthHeaders();
            const res = await fetch(`http://localhost:8080/api/user/orders?page=${pageParam}&size=${sizeParam}&sortBy=createdAt&sortDir=desc`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
            });

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                const message = data.message || `Bạn chưa đăng nhập hoặc token đã hết hạn, vui lòng đăng nhập lại.`;
                setError(message);
                return;
            }

            const data: ApiResponse<PageResult<UserOrder>> = await res.json();
            if (!data.success) {
                setError(data.message || 'Lỗi tải danh sách đơn hàng.');
                return;
            }

            setOrders(data.data?.content || []);
            setTotalPages(data.data?.totalPages || 0);
            setTotalElements(data.data?.totalElements || 0);
            setPage(data.data?.number || 0);
            setSize(data.data?.size || sizeParam);
        } catch (e) {
            if (isAuthTokenMissingError(e)) {
                setError('Bạn chưa đăng nhập hoặc thiếu token.');
                return;
            }
            console.error('Fetch orders error:', e);
            setError('Không thể kết nối máy chủ.');
        } finally {
            setIsLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        fetchOrders(page, size);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchOrders, refreshKey, page, size]);
    
    // Pagination controls
    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSize(Number(e.target.value));
        setPage(0);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CREATED':
                return 'bg-yellow-100 text-yellow-700';
            case 'DELIVERED':
                return 'bg-green-100 text-green-700';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            case 'SHIPPING':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'CREATED':
                return 'Vừa tạo';
            case 'SHIPPING':
                return 'Đang giao';
            case 'DELIVERED':
                return 'Đã giao';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case 'COD':
                return 'Thanh toán khi nhận';
            case 'MOMO':
                return 'Ví Momo';
            case 'ZALOPAY':
                return 'ZaloPay';
            default:
                return method;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isNewOrder = (createdAt: string) => {
        const createdTime = new Date(createdAt).getTime();

        if (Number.isNaN(createdTime)) {
            return false;
        }

        const elapsed = Date.now() - createdTime;
        return elapsed >= 0 && elapsed < 24 * 60 * 60 * 1000;
    };

    const canCancelOrder = (status: string) => {
        return status === 'CREATED' || status === 'SHIPPING';
    };

    const canConfirmDelivery = (status: string) => {
        return status === 'SHIPPING';
    };

    const openConfirmDialog = (order: UserOrder, action: 'cancel' | 'confirm-delivery') => {
        setConfirmState({ open: true, order, action, isLoading: false });
    };

    const handleConfirm = async () => {
        if (!confirmState.order || !confirmState.action) {
            setConfirmState({ open: false, isLoading: false });
            return;
        }

        setConfirmState((prev) => ({ ...prev, isLoading: true }));

        try {
            const authHeaders = buildAuthHeaders();
            const endpoint = confirmState.action === 'cancel'
                ? 'cancel'
                : 'confirm-delivery';

            const res = await fetch(
                `http://localhost:8080/api/user/orders/${confirmState.order.id}/${endpoint}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...authHeaders,
                    },
                }
            );

            const text = await res.text();
            const data = text ? JSON.parse(text) : {};

            if (!res.ok || !data.success) {
                throw new Error(data.message || `Thao tác thất bại (code ${res.status}).`);
            }

            // Update order status in list
            const newStatus = confirmState.action === 'cancel' ? 'CANCELLED' : 'DELIVERED';
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === confirmState.order!.id
                        ? { ...order, status: newStatus }
                        : order
                )
            );

            const successMessage = confirmState.action === 'cancel'
                ? 'Hủy đơn hàng thành công'
                : 'Xác nhận đã nhận hàng thành công';
            pushToast(successMessage, 'success');

            onCancel?.(confirmState.order);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Thao tác thất bại.';
            pushToast(errorMessage, 'error');
        } finally {
            setConfirmState({ open: false, isLoading: false });
        }
    };

    return (
        <div className="w-full">
            <style>{`
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .order-card {
                    animation: slideInUp 0.5s ease-out;
                }

                .order-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
                }

                @keyframes newBadgePulse {
                    0%,
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.65;
                        transform: scale(1.06);
                    }
                }

                .new-order-badge {
                    animation: newBadgePulse 1s ease-in-out infinite;
                }
            `}</style>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-red-800 font-medium text-sm">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchOrders()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-full"></div>
                                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-600 text-lg font-medium mb-1">Chưa có đơn hàng nào</p>
                    <p className="text-gray-400 text-sm">Hãy bắt đầu mua sắm để có đơn hàng đầu tiên của bạn</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order, index) => (
                        <div
                            key={order.id}
                            className="order-card bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Header của card */}
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                            Đơn hàng <span className="text-purple-600">#{order.id}</span>
                                            {isNewOrder(order.createdAt) && (
                                                <span className="new-order-badge inline-flex items-center rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                                                    Mới
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Body của card */}
                            <div className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    {/* Địa chỉ giao */}
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                                            Địa chỉ giao hàng
                                        </p>
                                        <p className="text-sm text-gray-700 line-clamp-2">
                                            {order.shippingAddress}
                                        </p>
                                    </div>

                                    {/* Phương thức thanh toán */}
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                                            Thanh toán
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <p className="text-sm text-gray-700">
                                                {getPaymentMethodLabel(order.paymentMethod)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Thành tiền */}
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                                            Thành tiền
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatCurrency(order.finalAmount)}
                                        </p>
                                        {order.discountAmount > 0 && (
                                            <p className="text-xs text-green-600 font-medium mt-1">
                                                Giảm {formatCurrency(order.discountAmount)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Promotion code nếu có */}
                                {order.promotionCode && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 font-medium">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                                            </svg>
                                            {order.promotionCode}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Footer với action buttons */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => onViewDetail?.(order)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition inline-flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Chi tiết
                                </button>

                                {canConfirmDelivery(order.status) && (
                                    <button
                                        type="button"
                                        onClick={() => openConfirmDialog(order, 'confirm-delivery')}
                                        className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition inline-flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Đã nhận hàng
                                    </button>
                                )}

                                {canCancelOrder(order.status) && (
                                    <button
                                        type="button"
                                        onClick={() => openConfirmDialog(order, 'cancel')}
                                        className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition inline-flex items-center gap-2 border border-red-200"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Hủy đơn
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {orders.length > 0 && (
                <div className="mt-6 flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 flex-wrap gap-4">
                    <div className="text-sm text-gray-600">
                        Hiển thị <span className="font-semibold text-gray-900">{orders.length}</span> / <span className="font-semibold text-gray-900">{totalElements}</span> đơn hàng
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                disabled={page === 0}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                ← Trước
                            </button>
                            <span className="text-sm text-gray-700 font-medium">
                                Trang <span className="text-purple-600">{totalPages === 0 ? 0 : page + 1}</span> / {totalPages}
                            </span>
                            <button
                                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                disabled={page + 1 >= totalPages}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                Sau →
                            </button>
                        </div>
                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={size}
                            onChange={handleSizeChange}
                        >
                            {[5, 10, 20, 50].map((s) => (
                                <option key={s} value={s}>{s} / trang</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.action === 'cancel' ? 'Hủy đơn hàng' : 'Xác nhận đã nhận hàng'}
                message={
                    confirmState.order
                        ? (confirmState.action === 'cancel'
                            ? `Bạn có chắc muốn hủy đơn hàng #${confirmState.order.id}?`
                            : `Bạn có chắc muốn xác nhận đã nhận được hàng cho đơn hàng #${confirmState.order.id}?`)
                        : 'Bạn có chắc muốn thực hiện thao tác này?'
                }
                confirmText={confirmState.action === 'cancel' ? 'Hủy đơn' : 'Xác nhận'}
                cancelText="Đóng"
                isLoading={confirmState.isLoading}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmState({ open: false, isLoading: false })}
            />
        </div>
    );
};

export default User_OrderTable;
