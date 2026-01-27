import React, { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useToast } from '../../../components/ToastProvider';
import { buildAuthHeaders, isAuthTokenMissingError } from '../../../services/auth';

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

export interface UserOrder {
    id: number;
    userId: number;
    totalAmount: number;
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
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        order?: UserOrder;
        action?: 'cancel' | 'confirm-delivery';
        isLoading: boolean;
    }>({ open: false, isLoading: false });

    const { pushToast } = useToast();

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const authHeaders = buildAuthHeaders();
            const res = await fetch('http://localhost:8080/api/user/orders', {
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

            const data: ApiResponse<UserOrder[]> = await res.json();
            if (!data.success) {
                setError(data.message || 'Lỗi tải danh sách đơn hàng.');
                return;
            }

            setOrders(data.data || []);
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
    }, []);

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchOrders, refreshKey]);

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
                return 'bg-slate-100 text-slate-700';
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
        <div className="w-full bg-white shadow rounded-lg overflow-hidden border border-slate-200">
            <div className="p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Danh sách đơn hàng</h2>
                <div className="flex items-center gap-2">
                    {error && (
                        <button
                            onClick={() => fetchOrders()}
                            className="text-sm px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                            Thử lại
                        </button>
                    )}
                    {/* <button
                        onClick={() => fetchOrders()}
                        className="text-sm px-3 py-1 rounded border border-slate-200 hover:bg-slate-50"
                    >
                        Tải lại
                    </button> */}
                </div>
            </div>

            {isLoading ? (
                <div className="p-4 text-slate-500">Đang tải danh sách đơn hàng...</div>
            ) : error ? (
                <div className="p-4 text-red-600 text-sm">{error}</div>
            ) : orders.length === 0 ? (
                <div className="p-4 text-slate-500 text-sm">Chưa có đơn hàng.</div>
            ) : (
                <div className="overflow-x-auto w-full">
                    <table className="min-w-full w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-2 text-left">ID</th>
                                <th className="px-4 py-2 text-left">Ngày đặt</th>
                                <th className="px-4 py-2 text-right">Tổng tiền</th>
                                <th className="px-4 py-2 text-left">Địa chỉ giao</th>
                                <th className="px-4 py-2 text-left">Thanh toán</th>
                                <th className="px-4 py-2 text-left">Trạng thái</th>
                                <th className="px-4 py-2 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 font-medium">#{order.id}</td>
                                    <td className="px-4 py-2 text-xs">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-4 py-2 text-right font-semibold">
                                        {formatCurrency(order.totalAmount)}
                                    </td>
                                    <td className="px-4 py-2 max-w-xs truncate text-xs" title={order.shippingAddress}>
                                        {order.shippingAddress}
                                    </td>
                                    <td className="px-4 py-2 text-xs">
                                        {getPaymentMethodLabel(order.paymentMethod)}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium inline-block ${getStatusColor(
                                                order.status
                                            )}`}
                                        >
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onViewDetail?.(order)}
                                                className="p-2 rounded border border-slate-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                                title="Xem chi tiết"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openConfirmDialog(order, 'confirm-delivery')}
                                                disabled={!canConfirmDelivery(order.status)}
                                                className={`p-2 rounded border transition ${canConfirmDelivery(order.status)
                                                    ? 'border-slate-200 hover:border-green-500 hover:text-green-600 hover:bg-green-50 cursor-pointer'
                                                    : 'border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                                                    }`}
                                                title={
                                                    canConfirmDelivery(order.status)
                                                        ? 'Xác nhận đã nhận hàng'
                                                        : 'Không thể xác nhận'
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openConfirmDialog(order, 'cancel')}
                                                disabled={!canCancelOrder(order.status)}
                                                className={`p-2 rounded border transition ${canCancelOrder(order.status)
                                                    ? 'border-slate-200 hover:border-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                                                    : 'border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                                                    }`}
                                                title={
                                                    canCancelOrder(order.status)
                                                        ? 'Hủy đơn hàng'
                                                        : 'Không thể hủy đơn hàng này'
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
