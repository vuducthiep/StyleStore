import React, { useEffect, useState } from 'react';
import { buildAuthHeaders } from '../../../services/auth';

interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    sizeId: number;
    sizeName: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface OrderDetail {
    id: number;
    userId: number;
    userName: string;
    phoneNumber: string;
    totalAmount: number;
    shippingAddress: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    orderItems: OrderItem[];
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

interface OrderModalProps {
    isOpen: boolean;
    orderId: number | null;
    onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, orderId, onClose }) => {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetail(orderId);
        }
    }, [isOpen, orderId]);

    const fetchOrderDetail = async (id: number) => {
        setIsLoading(true);
        setError('');

        try {
            const authHeaders = buildAuthHeaders();
            const res = await fetch(`http://localhost:8080/api/admin/orders/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
            });

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                setError(data.message || `Lỗi tải chi tiết đơn hàng (code ${res.status}).`);
                return;
            }

            const data: ApiResponse<OrderDetail> = await res.json();
            if (!data.success || !data.data) {
                setError(data.message || 'Lỗi tải chi tiết đơn hàng.');
                return;
            }

            setOrder(data.data);
        } catch (e) {
            console.error('Fetch order detail error:', e);
            setError('Không thể kết nối máy chủ.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CREATED':
                return 'bg-yellow-100 text-yellow-700';
            case 'DELIVERED':
                return 'bg-green-100 text-green-700';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Chi tiết đơn hàng #{orderId}</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-500">Đang tải...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600">{error}</div>
                    ) : order ? (
                        <>
                            {/* Order Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Thông tin đơn hàng</h3>
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-sm text-slate-500">Mã đơn hàng</p>
                                        <p className="font-medium text-slate-800">#{order.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Mã khách hàng</p>
                                        <p className="font-medium text-slate-800">#{order.userId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Tên khách hàng</p>
                                        <p className="font-medium text-slate-800">{order.userName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Số điện thoại</p>
                                        <p className="font-medium text-slate-800">{order.phoneNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Tổng tiền</p>
                                        <p className="font-semibold text-blue-600 text-lg">{formatCurrency(order.totalAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Phương thức thanh toán</p>
                                        <p className="font-medium text-slate-800">{order.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Trạng thái</p>
                                        <span className={`inline-block px-3 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Địa chỉ giao hàng</p>
                                        <p className="font-medium text-slate-800">{order.shippingAddress}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Ngày tạo</p>
                                        <p className="font-medium text-slate-800">{formatDateTime(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Ngày cập nhật</p>
                                        <p className="font-medium text-slate-800">{formatDateTime(order.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Table */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Sản phẩm đặt hàng</h3>
                                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-slate-50 text-slate-600">
                                            <tr>
                                                <th className="px-4 py-3 text-left">ID</th>
                                                <th className="px-4 py-3 text-left">Mã SP</th>
                                                <th className="px-4 py-3 text-left">Tên sản phẩm</th>
                                                <th className="px-4 py-3 text-left">Hình ảnh</th>
                                                <th className="px-4 py-3 text-left">Size</th>
                                                <th className="px-4 py-3 text-center">Số lượng</th>
                                                <th className="px-4 py-3 text-right">Đơn giá</th>
                                                <th className="px-4 py-3 text-right">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {order.orderItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3">{item.id}</td>
                                                    <td className="px-4 py-3">#{item.productId}</td>
                                                    <td className="px-4 py-3 font-medium">{item.productName}</td>
                                                    <td className="px-4 py-3">
                                                        <img 
                                                            src={item.productImage} 
                                                            alt={item.productName}
                                                            className="w-12 h-12 object-cover rounded"
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://via.placeholder.com/48';
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                                                            {item.sizeName}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                                                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                                                        {formatCurrency(item.subtotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50">
                                            <tr>
                                                <td colSpan={7} className="px-4 py-3 text-right font-semibold text-slate-700">
                                                    Tổng cộng:
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg">
                                                    {formatCurrency(order.totalAmount)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded bg-slate-600 text-white font-medium hover:bg-slate-700 transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderModal;
