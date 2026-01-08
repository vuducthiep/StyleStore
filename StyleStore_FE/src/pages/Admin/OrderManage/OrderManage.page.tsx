import React, { useState } from 'react';
import OrderTable, { type AdminOrder } from './OrderTable';
import OrderModal from './OrderModal';

const OrderManage: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const handleViewDetail = (order: AdminOrder) => {
        setSelectedOrderId(order.id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrderId(null);
    };

    //use api confirm order 
    const handleConfirmOrder = async (order: AdminOrder) => {
        console.log('Confirm order:', order);

    };

    return (
        <div className="p-6 w-full">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý đơn hàng</h1>
                    <p className="text-slate-500 text-sm">Xem danh sách và quản lý đơn hàng.</p>
                </div>
                <button
                    onClick={() => setRefreshKey((prev) => prev + 1)}
                    className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                    Tải lại
                </button>
            </div>

            <OrderTable
                refreshKey={refreshKey}
                onViewDetail={handleViewDetail}
                onConfirm={handleConfirmOrder}
            />

            <OrderModal
                isOpen={isModalOpen}
                orderId={selectedOrderId}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default OrderManage;
