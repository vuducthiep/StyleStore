import React, { useState } from 'react';
import PromotionTable, { type AdminPromotion } from './PromotionTable';
import PromotionModal from './PromotionModal';
import { useToast } from '../../../components/ToastProvider';

const PromotionManage: React.FC = () => {
    const { pushToast } = useToast();
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedPromotion, setSelectedPromotion] = useState<AdminPromotion | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEdit = (promotion: AdminPromotion) => {
        setSelectedPromotion(promotion);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPromotion(null);
    };

    const handleSuccess = (message: string) => {
        setRefreshKey((prev) => prev + 1);
        pushToast(message, 'success');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Quản lý khuyến mãi</h1>
                            <p className="text-slate-600 mt-2">Quản lý toàn bộ chương trình khuyến mãi trong hệ thống</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                        >
                            + Thêm khuyến mãi
                        </button>
                    </div>
                </div>

                <PromotionTable
                    refreshKey={refreshKey}
                    onEdit={handleEdit}
                />

                <PromotionModal
                    isOpen={isModalOpen}
                    promotion={selectedPromotion}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            </div>
        </div>
    );
};

export default PromotionManage;
