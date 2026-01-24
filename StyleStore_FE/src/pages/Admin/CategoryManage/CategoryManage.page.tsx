import React, { useState } from 'react';
import CategoryTable from './CategoryTable';
import CategoryModal from './CategoryModal';
import type { AdminCategory } from './CategoryTable';

const CategoryManage: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEdit = (category: AdminCategory) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
    };

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Quản lý danh mục</h1>
                            <p className="text-slate-600 mt-2">Quản lý các danh mục sản phẩm trong hệ thống</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className='px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition'
                        >
                            + Thêm danh mục
                        </button>
                    </div>
                </div>

                {/* Category Table */}
                <CategoryTable
                    refreshKey={refreshKey}
                    onEdit={handleEdit}
                />

                {/* Category Modal */}
                <CategoryModal
                    isOpen={isModalOpen}
                    category={selectedCategory}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            </div>
        </div>
    );
};

export default CategoryManage;
