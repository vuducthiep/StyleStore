import React, { useCallback, useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { buildAuthHeaders } from '../../../services/auth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

export interface OrderItems {
    id: number;
    productId: number;
    productName: string;
    productImage?: string;
    sizeId: number;
    sizeName: string;
    quantity: number;
    price: number;
    subtotal?: number;
}

export interface OrderDetail {
    id: number;
    userId: number;
    userName?: string;
    phoneNumber?: string;
    totalAmount: number;
    shippingAddress: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    orderItems: OrderItems[];
}

interface UserOrderModalProps {
    isOpen: boolean;
    orderId: number | null;
    onClose: () => void;
}

const User_OrderModal: React.FC<UserOrderModalProps> = ({
    isOpen,
    orderId,
    onClose,
}) => {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const fetchOrderDetail = useCallback(async () => {
        if (!orderId) return;

        setIsLoading(true);
        setError('');

        try {
            const authHeaders = buildAuthHeaders();
            const res = await fetch(`http://localhost:8080/api/user/orders/${orderId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
            });

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                setError(data.message || 'Lỗi tải chi tiết đơn hàng.');
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
    }, [orderId]);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetail();
        } else {
            setOrder(null);
            setError('');
        }
    }, [isOpen, orderId, fetchOrderDetail]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CREATED':
                return 'bg-yellow-100 text-yellow-800';
            case 'SHIPPING':
                return 'bg-blue-100 text-blue-800';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-slate-100 text-slate-800';
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
                return 'Thanh toán khi nhận hàng';
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const escapeHtml = (value: string) =>
        value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');

    const exportInvoicePdf = async () => {
        if (!order) return;
        setIsExporting(true);

        const invoiceRoot = document.createElement('div');
        invoiceRoot.style.position = 'fixed';
        invoiceRoot.style.left = '-10000px';
        invoiceRoot.style.top = '0';
        invoiceRoot.style.width = '1024px';
        invoiceRoot.style.background = '#ffffff';
        invoiceRoot.style.padding = '24px';
        invoiceRoot.style.boxSizing = 'border-box';
        invoiceRoot.style.fontFamily = 'Arial, Helvetica, sans-serif';

        const rows = order.orderItems
            .map(
                (item) => `
                <tr>
                    <td style="padding:8px;border:1px solid #e2e8f0;">${escapeHtml(item.productName)}</td>
                    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">${escapeHtml(item.sizeName)}</td>
                    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
                    <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${formatCurrency(item.price)}</td>
                    <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">${formatCurrency(item.subtotal || item.price * item.quantity)}</td>
                </tr>
                `,
            )
            .join('');

        invoiceRoot.innerHTML = `
            <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <div style="padding:16px 20px;border-bottom:1px solid #e2e8f0;background:#f8fafc;display:flex;justify-content:space-between;align-items:center;">
                    <h1 style="margin:0;font-size:22px;color:#0f172a;">Hóa đơn đơn hàng #${order.id}</h1>
                    <span style="padding:4px 10px;border-radius:999px;background:#dcfce7;color:#166534;font-weight:600;font-size:12px;">${escapeHtml(getStatusLabel(order.status))}</span>
                </div>
                <div style="padding:16px 20px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;font-size:14px;color:#334155;">
                        <div><b>Khách hàng:</b> ${escapeHtml(order.userName || 'Khách hàng')}</div>
                        <div><b>Số điện thoại:</b> ${escapeHtml(order.phoneNumber || 'N/A')}</div>
                        <div><b>Ngày đặt:</b> ${escapeHtml(formatDate(order.createdAt))}</div>
                        <div><b>Thanh toán:</b> ${escapeHtml(getPaymentMethodLabel(order.paymentMethod))}</div>
                    </div>
                    <div style="margin-bottom:16px;font-size:14px;color:#334155;"><b>Địa chỉ giao hàng:</b> ${escapeHtml(order.shippingAddress)}</div>
                    <table style="width:100%;border-collapse:collapse;font-size:13px;color:#0f172a;">
                        <thead>
                            <tr style="background:#eff6ff;">
                                <th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">Sản phẩm</th>
                                <th style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Size</th>
                                <th style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Số lượng</th>
                                <th style="padding:8px;border:1px solid #e2e8f0;text-align:right;">Đơn giá</th>
                                <th style="padding:8px;border:1px solid #e2e8f0;text-align:right;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <div style="display:flex;justify-content:flex-end;margin-top:16px;font-size:18px;font-weight:700;color:#2563eb;">Tổng tiền: ${formatCurrency(order.totalAmount)}</div>
                </div>
            </div>
        `;

        document.body.appendChild(invoiceRoot);

        try {
            const canvas = await html2canvas(invoiceRoot, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`hoa-don-${order.id}.pdf`);
        } finally {
            document.body.removeChild(invoiceRoot);
            setIsExporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Chi tiết đơn hàng</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition"
                        title="Đóng"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="py-12 text-center">
                            <div className="inline-flex items-center gap-2">
                                <div className="animate-spin rounded-full h-6 w-6 border border-slate-300 border-t-blue-600"></div>
                                <span className="text-slate-600">Đang tải chi tiết đơn hàng...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="py-8 flex flex-col items-center gap-3">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <p className="text-red-600 font-medium">{error}</p>
                            <button
                                onClick={fetchOrderDetail}
                                className="mt-2 px-4 py-2 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : order ? (
                        <div className="space-y-6">
                            {/* Order Info */}
                            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900">
                                        Đơn hàng #{order.id}
                                    </h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 font-medium">Ngày đặt hàng</p>
                                        <p className="text-slate-900">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-medium">Phương thức thanh toán</p>
                                        <p className="text-slate-900">
                                            {getPaymentMethodLabel(order.paymentMethod)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-2">Địa chỉ giao hàng</h3>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-slate-700">{order.shippingAddress}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-3">Sản phẩm đã đặt</h3>
                                <div className="space-y-3">
                                    {order.orderItems && order.orderItems.length > 0 ? (
                                        order.orderItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900">
                                                        {item.productName}
                                                    </p>

                                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                                        <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                                                        <span>Size: {item.sizeName}</span>
                                                        <span>×</span>
                                                        <span>Số lượng: {item.quantity}</span>
                                                        <span>×</span>
                                                        <span>{formatCurrency(item.price)}</span>
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-slate-900 text-lg ml-4">
                                                    {formatCurrency(item.subtotal || (item.price * item.quantity))}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-sm">Không có sản phẩm</p>
                                    )}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t border-slate-200 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-slate-900">Tổng tiền</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                    {order?.status === 'DELIVERED' && (
                        <button
                            onClick={exportInvoicePdf}
                            disabled={isExporting}
                            className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 transition"
                        >
                            {isExporting ? 'Đang xuất...' : 'Xuất hóa đơn'}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default User_OrderModal;
