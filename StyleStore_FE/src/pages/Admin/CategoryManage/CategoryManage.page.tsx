import React, { useState } from 'react';
import CategoryTable from './CategoryTable';
import type { AdminCategory } from './CategoryTable';
const CategoryManage: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(null);

    const handleEdit = (category: AdminCategory) => {
        setSelectedCategory(category);
        // TODO: Open modal or navigate to edit form
        console.log('Edit category:', category);
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý danh mục</h1>
                    <p className="text-slate-600 mt-2">Quản lý các danh mục sản phẩm trong hệ thống</p>
                </div>

                {/* Category Table */}
                <CategoryTable
                    refreshKey={refreshKey}
                    onEdit={handleEdit}
                />
            </div>
        </div>
    );
};

export default CategoryManage;
