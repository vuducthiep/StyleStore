import React, { useEffect, useState } from 'react';
import { buildAuthHeaders } from '../../../services/auth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    const [isExporting, setIsExporting] = useState(false);

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
                    <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">${formatCurrency(item.subtotal)}</td>
                </tr>
                `,
            )
            .join('');

        invoiceRoot.innerHTML = `
            <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <div style="padding:16px 20px;border-bottom:1px solid #e2e8f0;background:#f8fafc;display:flex;justify-content:space-between;align-items:center;">
                    <h1 style="margin:0;font-size:22px;color:#0f172a;">Hóa đơn đơn hàng #${order.id}</h1>
                    <span style="padding:4px 10px;border-radius:999px;background:#dcfce7;color:#166534;font-weight:600;font-size:12px;">${escapeHtml(order.status)}</span>
                </div>
                <div style="padding:16px 20px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;font-size:14px;color:#334155;">
                        <div><b>Khách hàng:</b> ${escapeHtml(order.userName)}</div>
                        <div><b>Số điện thoại:</b> ${escapeHtml(order.phoneNumber)}</div>
                        <div><b>Ngày tạo:</b> ${escapeHtml(formatDateTime(order.createdAt))}</div>
                        <div><b>Thanh toán:</b> ${escapeHtml(order.paymentMethod)}</div>
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
                <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                    {order?.status === 'DELIVERED' && (
                        <button
                            onClick={exportInvoicePdf}
                            disabled={isExporting}
                            className="px-6 py-2 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:bg-emerald-300 transition"
                        >
                            {isExporting ? 'Đang xuất...' : 'Xuất hóa đơn'}
                        </button>
                    )}
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
