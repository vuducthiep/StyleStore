import React, { useState } from 'react';
import ProductTable, { type AdminProduct } from './ProductTable';
import ProductModal from './ProductModal';
import BestSellingByCategory from './BestSellingByCategory';

const ProductManager: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAddProduct = () => {
        setEditingProductId(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product: AdminProduct) => {
        setEditingProductId(product.id);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingProductId(null);
    };

    const handleModalSaved = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="p-6 w-full">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý sản phẩm</h1>
                    <p className="text-slate-500 text-sm">Xem danh sách và thông tin sản phẩm.</p>
                </div>
                <div className="flex gap-2">

                    <button
                        onClick={handleAddProduct}
                        className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    >
                        + Thêm sản phẩm
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <BestSellingByCategory />
            </div>

            <ProductTable
                refreshKey={refreshKey}
                onEdit={handleEditProduct}
            />

            <ProductModal
                isOpen={isModalOpen}
                productId={editingProductId}
                onClose={handleModalClose}
                onSaved={handleModalSaved}
            />
        </div>
    );
};

export default ProductManager;