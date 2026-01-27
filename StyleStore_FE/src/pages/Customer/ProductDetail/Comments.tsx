import React, { useCallback, useEffect, useState } from 'react';
import { buildAuthHeaders, getAuthToken, isAuthTokenMissingError } from '../../../services/auth';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useToast } from '../../../components/ToastProvider';

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

type PageResponse<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
};

export type CommentItem = {
    id: number;
    content: string;
    createdAt: string;
    updatedAt?: string;
    productId: number;
    productName?: string;
    userId: number;
    userFullName?: string;
    userEmail?: string;
};

interface CommentsProps {
    productId: number;
}

const getInitial = (name?: string, email?: string) => {
    const source = name?.trim() || email?.trim() || '?';
    return source.charAt(0).toUpperCase();
};

const Comments: React.FC<CommentsProps> = ({ productId }) => {
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const { pushToast } = useToast();

    // Get current user info from localStorage
    const getCurrentUserName = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.fullName || user.email || 'Bạn';
            } catch {
                return 'Bạn';
            }
        }
        return 'Bạn';
    };

    const fetchComments = useCallback(async (pageParam: number = page) => {
        setIsLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const headers: Record<string, string> = token
                ? { Authorization: `Bearer ${token}` }
                : {};

            const res = await fetch(
                `http://localhost:8080/api/user/comments/product/${productId}?page=${pageParam}&size=${size}`,
                { headers }
            );

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                const message = res.status === 401
                    ? 'Bạn cần đăng nhập để xem bình luận.'
                    : data.message || `Không lấy được comment (code ${res.status}).`;
                setError(message);
                return;
            }

            const data: ApiResponse<PageResponse<CommentItem>> = await res.json();
            if (!data.success || !data.data) {
                setError(data.message || 'Không lấy được comment.');
                return;
            }

            setComments(data.data.content || []);
            setTotalPages(data.data.totalPages || 0);
        } catch (e) {
            console.error('Fetch comments error:', e);
            setError('Không thể kết nối máy chủ.');
        } finally {
            setIsLoading(false);
        }
    }, [page, productId, size]);

    useEffect(() => {
        setPage(0); // reset page khi đổi productId
    }, [productId]);

    useEffect(() => {
        fetchComments(page);
    }, [fetchComments, page]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            setError('Nội dung không được trống.');
            return;
        }
        if (content.trim().length < 5) {
            setError('Nội dung phải từ 5 ký tự trở lên.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const authHeaders = buildAuthHeaders();
            const res = await fetch('http://localhost:8080/api/user/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                },
                body: JSON.stringify({ productId, content: content.trim() }),
            });

            let data: ApiResponse<PageResponse<CommentItem>> | null = null;
            try {
                data = (await res.json()) as ApiResponse<PageResponse<CommentItem>>;
            } catch {
                data = null; // ignore parse error
            }

            if (!res.ok || !data?.success) {
                if (res.status === 401) {
                    setError('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
                } else if (res.status === 403) {
                    setError('Bạn không có quyền bình luận.');
                } else {
                    const message = data?.message || `Gửi comment thất bại (code ${res.status}).`;
                    setError(message);
                }
                return;
            }

            setContent('');
            pushToast('Bình luận đã được đăng thành công!', 'success');
            // reset về trang đầu và tải lại để thấy comment mới
            setPage(0);
            fetchComments(0);
        } catch (e) {
            if (isAuthTokenMissingError(e)) {
                setError('Bạn cần đăng nhập để bình luận.');
                return;
            }
            console.error('Submit comment error:', e);
            setError('Không thể kết nối máy chủ.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrev = () => {
        if (page > 0) setPage((p) => p - 1);
    };

    const handleNext = () => {
        if (page + 1 < totalPages) setPage((p) => p + 1);
    };

    const handleDeleteClick = (commentId: number) => {
        setDeleteId(commentId);
        setConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;

        setDeleting(true);
        try {
            const authHeaders = buildAuthHeaders();
            const res = await fetch(`http://localhost:8080/api/user/comments/${deleteId}`, {
                method: 'DELETE',
                headers: authHeaders,
            });

            let data: ApiResponse<null> | null = null;
            try {
                data = await res.json();
            } catch {
                data = null;
            }

            if (!res.ok || !data?.success) {
                if (res.status === 401) {
                    pushToast('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.', 'error');
                } else if (res.status === 403) {
                    pushToast('Bạn không có quyền xóa bình luận này.', 'error');
                } else {
                    const message = data?.message || `Xóa comment thất bại (code ${res.status}).`;
                    pushToast(message, 'error');
                }
                return;
            }

            pushToast('Xóa bình luận thành công!', 'success');
            setConfirmOpen(false);
            setDeleteId(null);
            // Reload current page
            fetchComments(page);
        } catch (e) {
            if (isAuthTokenMissingError(e)) {
                pushToast('Bạn cần đăng nhập để xóa bình luận.', 'error');
                return;
            }
            console.error('Delete comment error:', e);
            pushToast('Không thể kết nối máy chủ.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setConfirmOpen(false);
        setDeleteId(null);
    };

    return (
        <div className="mt-6 border border-slate-200 rounded-lg bg-white shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Bình luận</h3>
                    <p className="text-sm text-slate-500">Chia sẻ cảm nhận của bạn về sản phẩm.</p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold">
                            {getInitial(getCurrentUserName())}
                        </div>
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                            <textarea
                                className="w-full bg-transparent text-sm text-slate-800 outline-none resize-none"
                                rows={2}
                                placeholder="Viết bình luận của bạn..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={submitting}
                            />
                            <div className="flex items-center justify-between pt-2">
                                {error && <div className="text-sm text-red-600">{error}</div>}
                                <button
                                    type="submit"
                                    disabled={submitting || !content.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Đang gửi...' : 'Đăng'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {isLoading ? (
                    <div className="text-sm text-slate-500">Đang tải bình luận...</div>
                ) : comments.length === 0 ? (
                    <div className="text-sm text-slate-500">Chưa có bình luận.</div>
                ) : (
                    <div className="space-y-3">
                        {comments.map((c) => {
                            const userStr = localStorage.getItem('user');
                            let isOwner = false;
                            if (userStr) {
                                try {
                                    const currentUser = JSON.parse(userStr);
                                    isOwner = currentUser.email === c.userEmail;
                                } catch {
                                    isOwner = false;
                                }
                            }

                            return (
                                <div key={c.id} className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold">
                                        {getInitial(c.userFullName, c.userEmail)}
                                    </div>
                                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-sm font-semibold text-slate-900">{c.userFullName || c.userEmail}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs text-slate-500 whitespace-nowrap">
                                                    {new Date(c.createdAt).toLocaleString('vi-VN')}
                                                </div>
                                                {isOwner && (
                                                    <button
                                                        onClick={() => handleDeleteClick(c.id)}
                                                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                        title="Xóa bình luận"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                            onClick={handlePrev}
                            disabled={page === 0}
                            className="px-3 py-1 text-sm rounded border border-slate-200 text-slate-600 disabled:opacity-50"
                        >
                            Trang trước
                        </button>
                        <span className="text-sm text-slate-600">
                            Trang {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={page + 1 >= totalPages}
                            className="px-3 py-1 text-sm rounded border border-slate-200 text-slate-600 disabled:opacity-50"
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={confirmOpen}
                title="Xóa bình luận"
                message="Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                isLoading={deleting}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </div>
    );
};

export default Comments;
