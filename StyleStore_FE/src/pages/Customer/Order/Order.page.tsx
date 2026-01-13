import React, { useState } from 'react';
import User_OrderTable, { type UserOrder } from './User_OrderTable';
import User_OrderModal from './User_OrderModal';
import Header from "../../../components/Header";

const OrderPage: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const handleViewDetail = (order: UserOrder) => {
        setSelectedOrderId(order.id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrderId(null);
    };

    const handleCancelSuccess = () => {
        // Refresh the table after cancel
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div>
            <Header />
            <div className="p-6 w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Đơn hàng của tôi</h1>
                            <p className="text-slate-500 text-sm mt-1">Xem danh sách và quản lý đơn hàng của bạn</p>
                        </div>
                        <button
                            onClick={() => setRefreshKey((prev) => prev + 1)}
                            className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-sm"
                        >
                            Tải lại
                        </button>
                    </div>

                    <User_OrderTable
                        refreshKey={refreshKey}
                        onViewDetail={handleViewDetail}
                        onCancel={handleCancelSuccess}
                    />

                    <User_OrderModal
                        isOpen={isModalOpen}
                        orderId={selectedOrderId}
                        onClose={handleCloseModal}
                    />
                </div>
            </div>
        </div>
    );
};

export default OrderPage;
