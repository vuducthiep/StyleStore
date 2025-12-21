import React, { useEffect, useState, useCallback } from 'react';
import UserTable, { type AdminUser } from './UserTable';
import UserModal from './UserModal';

const UserManager: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);

    const fetchUsers = useCallback(async (pageIndex = 0) => {
        setIsLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Bạn chưa đăng nhập hoặc thiếu token.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/users?page=${pageIndex}&size=${size}&sortBy=createdAt&sortDir=desc`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                const message = data.message || `Lỗi tải danh sách user (code ${res.status}).`;
                setError(message);
                return;
            }

            const data = await res.json();
            const content: AdminUser[] = data.content || [];
            setUsers(content);
            setPage(data.number ?? pageIndex);
            setTotalPages(data.totalPages ?? 0);
            setTotalElements(data.totalElements ?? 0);
        } catch (e) {
            console.error('Fetch users error:', e);
            setError('Không thể kết nối máy chủ.');
        } finally {
            setIsLoading(false);
        }
    }, [size]);

    useEffect(() => {
        fetchUsers(page);
    }, [fetchUsers, page]);

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
        fetchUsers(nextPage);
    };

    const handleEditUser = (user: AdminUser) => {
        setEditingUserId(user.id);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingUserId(null);
    };

    return (
        <div className="p-6 w-full">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h1>
                    <p className="text-slate-500 text-sm">Xem danh sách và thông tin người dùng.</p>
                </div>
                <button
                    onClick={() => fetchUsers(page)}
                    className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                    Tải lại
                </button>
            </div>

            <UserTable
                users={users}
                isLoading={isLoading}
                error={error}
                onRetry={() => fetchUsers(page)}
                currentPage={page}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={handlePageChange}
                onEdit={handleEditUser}
            />

            <UserModal
                isOpen={isModalOpen}
                userId={editingUserId}
                onClose={handleModalClose}
                onSaved={() => fetchUsers(page)}
            />
        </div>
    );
};

export default UserManager;