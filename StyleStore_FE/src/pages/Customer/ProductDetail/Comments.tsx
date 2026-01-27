import React, { useCallback, useEffect, useState } from 'react';
import { buildAuthHeaders, isAuthTokenMissingError } from '../../../services/auth';

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

const Comments: React.FC<CommentsProps> = ({ productId }) => {
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchComments = useCallback(async (pageParam: number = page) => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(
                `http://localhost:8080/api/user/comments/product/${productId}?page=${pageParam}&size=${size}`,
            );

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                const message = data.message || `Không lấy được comment (code ${res.status}).`;
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
        if (!content.trim()) return;
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

            const data = await res.json();
            if (!res.ok || !data.success) {
                const message = data?.message || `Gửi comment thất bại (code ${res.status}).`;
                setError(message);
                return;
            }

            setContent('');
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

    return (
        <div className="mt-6 border border-slate-200 rounded-lg bg-white shadow-sm">
            <div className="p-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">Bình luận</h3>
                <p className="text-sm text-slate-500">Chia sẻ cảm nhận của bạn về sản phẩm.</p>
            </div>

            <div className="p-4 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <textarea
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Nhập bình luận của bạn..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={submitting}
                    />
                    <div className="flex items-center justify-between">
                        {error && <div className="text-sm text-red-600">{error}</div>}
                        <button
                            type="submit"
                            disabled={submitting || !content.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                        </button>
                    </div>
                </form>

                {isLoading ? (
                    <div className="text-sm text-slate-500">Đang tải bình luận...</div>
                ) : comments.length === 0 ? (
                    <div className="text-sm text-slate-500">Chưa có bình luận.</div>
                ) : (
                    <div className="space-y-3">
                        {comments.map((c) => (
                            <div key={c.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-slate-800">{c.userFullName || c.userEmail}</div>
                                    <div className="text-xs text-slate-500">
                                        {new Date(c.createdAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
                            </div>
                        ))}
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
        </div>
    );
};

export default Comments;
