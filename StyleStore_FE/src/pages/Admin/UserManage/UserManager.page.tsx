import React, { useState } from 'react';
import UserTable, { type AdminUser } from './UserTable';
import UserModal from './UserModal';

const UserManager: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEditUser = (user: AdminUser) => {
        setEditingUserId(user.id);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingUserId(null);
    };

    const handleModalSaved = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="p-6 w-full">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h1>
                    <p className="text-slate-500 text-sm">Xem danh sách và thông tin người dùng.</p>
                </div>

            </div>

            <UserTable
                refreshKey={refreshKey}
                onEdit={handleEditUser}
            />

            <UserModal
                isOpen={isModalOpen}
                userId={editingUserId}
                onClose={handleModalClose}
                onSaved={handleModalSaved}
            />
        </div>
    );
};

export default UserManager;