import React from 'react';

export interface AdminUser {
    id: number;
    fullName: string;
    email: string;
    phoneNumber?: string;
    role?: string;
    status?: string;
    createdAt?: string;
}

interface UserTableProps {
    users: AdminUser[];
    isLoading: boolean;
    error: string;
    onRetry: () => void;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    onEdit?: (user: AdminUser) => void;
    onDelete?: (user: AdminUser) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, isLoading, error, onRetry, currentPage, totalPages, totalElements, onPageChange, onEdit, onDelete }) => {
    return (
        <div className="w-full flex-1 bg-white shadow rounded-lg overflow-hidden border border-slate-200">
            <div className="p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Danh sách người dùng</h2>
                {error && (
                    <button
                        onClick={onRetry}
                        className="text-sm px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                        Thử lại
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="p-4 text-slate-500">Đang tải...</div>
            ) : error ? (
                <div className="p-4 text-red-600 text-sm">{error}</div>
            ) : users.length === 0 ? (
                <div className="p-4 text-slate-500 text-sm">Chưa có người dùng.</div>
            ) : (
                <div className="overflow-x-auto w-full">
                    <table className="min-w-full w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-2 text-left">ID</th>
                                <th className="px-4 py-2 text-left">Họ tên</th>
                                <th className="px-4 py-2 text-left">Email</th>
                                <th className="px-4 py-2 text-left">SĐT</th>
                                <th className="px-4 py-2 text-left">Role</th>
                                <th className="px-4 py-2 text-left">Trạng thái</th>
                                <th className="px-4 py-2 text-left">Ngày tạo</th>
                                <th className="px-4 py-2 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2">{user.id}</td>
                                    <td className="px-4 py-2 font-medium">{user.fullName}</td>
                                    <td className="px-4 py-2">{user.email}</td>
                                    <td className="px-4 py-2">{user.phoneNumber || '-'}</td>
                                    <td className="px-4 py-2">{user.role || '-'}</td>
                                    <td className="px-4 py-2">
                                        <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">{user.status || '-'}</span>
                                    </td>
                                    <td className="px-4 py-2">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                                    <td className="px-4 py-2 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEdit?.(user)}
                                                className="p-2 rounded border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition"
                                                title="Sửa"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 012.652 2.652l-1.688 1.687m-2.651-2.651L6.478 15.37a4.5 4.5 0 00-1.184 2.216l-.3 1.201a.75.75 0 00.91.91l1.2-.3a4.5 4.5 0 002.217-1.184l9.383-9.383m-2.651-2.651l2.651 2.651" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDelete?.(user)}
                                                className="p-2 rounded border border-slate-200 hover:border-red-500 hover:text-red-600 transition"
                                                title="Xóa"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-700">
                    <span>
                        Trang {currentPage + 1}/{totalPages} • Tổng {totalElements} người dùng
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
                            disabled={currentPage === 0}
                            className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 hover:bg-slate-50"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
                            disabled={currentPage >= totalPages - 1}
                            className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 hover:bg-slate-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTable;