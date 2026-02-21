import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import { Headset, Send, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface MessageDto {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    createdAt: string;
    read: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

const SUPPORT_USER_ID = 6;
const API_BASE_URL = 'http://localhost:8080';

const formatTime = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`;
};

const parseCurrentUserId = (): number | null => {
    try {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) {
            return null;
        }

        const user = JSON.parse(userRaw) as { id?: number | string };
        if (user?.id === undefined || user?.id === null) {
            return null;
        }

        const id = Number(user.id);
        return Number.isFinite(id) ? id : null;
    } catch {
        return null;
    }
};

const SupportChatWidget = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [messages, setMessages] = useState<MessageDto[]>([]);
    const [draft, setDraft] = useState('');
    const [error, setError] = useState('');
    const [isIconVisible, setIsIconVisible] = useState(true);
    const [isIconReady, setIsIconReady] = useState(false);
    const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
    const currentUserId = useMemo(() => parseCurrentUserId(), []);
    const messageContainerRef = useRef<HTMLDivElement | null>(null);
    const dragStateRef = useRef({
        dragging: false,
        moved: false,
        startX: 0,
        startY: 0,
        originX: 0,
        originY: 0,
        pointerId: -1,
    });

    const shouldHide = useMemo(() => {
        const path = location.pathname;
        return path.startsWith('/admin') || path === '/login' || path === '/signup' || path === '/oauth2-callback';
    }, [location.pathname]);

    const token = localStorage.getItem('token');

    const clampPosition = useCallback((x: number, y: number) => {
        const iconSize = 64;
        const margin = 8;
        const maxX = Math.max(margin, window.innerWidth - iconSize - margin);
        const maxY = Math.max(margin, window.innerHeight - iconSize - margin);

        return {
            x: Math.min(Math.max(x, margin), maxX),
            y: Math.min(Math.max(y, margin), maxY),
        };
    }, []);

    useEffect(() => {
        const initial = clampPosition(window.innerWidth - 96, window.innerHeight - 112);
        setIconPosition(initial);
        setIsIconReady(true);
    }, [clampPosition]);

    useEffect(() => {
        if (!isIconReady) {
            return;
        }

        const handleResize = () => {
            setIconPosition((prev) => clampPosition(prev.x, prev.y));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isIconReady, clampPosition]);

    const loadConversation = useCallback(async () => {
        if (!token) {
            setError('Vui lòng đăng nhập để chat hỗ trợ.');
            setMessages([]);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/messages/conversation/${SUPPORT_USER_ID}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = (await response.json()) as ApiResponse<MessageDto[]>;
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Không thể tải lịch sử tin nhắn.');
            }

            setMessages(Array.isArray(result.data) ? result.data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể tải lịch sử tin nhắn.');
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (isOpen) {
            loadConversation();
        }
    }, [isOpen, loadConversation]);

    useEffect(() => {
        if (!isOpen || isLoading) {
            return;
        }

        const timer = window.setTimeout(() => {
            if (messageContainerRef.current) {
                messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
            }
        }, 0);

        return () => window.clearTimeout(timer);
    }, [isOpen, isLoading, messages]);

    useEffect(() => {
        if (!isOpen || !token || !currentUserId) {
            return;
        }

        let subscription: StompSubscription | null = null;
        const client = new Client({
            brokerURL: `${API_BASE_URL.replace('http', 'ws')}/ws-native`,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 2000,
            debug: () => undefined,
        });

        client.onConnect = () => {
            subscription = client.subscribe(`/topic/messages/${currentUserId}`, (message: IMessage) => {
                try {
                    const payload = JSON.parse(message.body) as MessageDto;
                    const relatedToSupport =
                        payload.senderId === SUPPORT_USER_ID || payload.receiverId === SUPPORT_USER_ID;

                    if (!relatedToSupport) {
                        return;
                    }

                    setMessages((prev) => {
                        const exists = prev.some((item) => item.id === payload.id);
                        if (exists) {
                            return prev;
                        }
                        return [...prev, payload];
                    });
                } catch {
                    // ignore invalid message payload
                }
            });
        };

        client.activate();

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
            client.deactivate();
        };
    }, [isOpen, token, currentUserId]);

    const handleSendMessage = async () => {
        const content = draft.trim();
        if (!content) {
            return;
        }

        if (!token) {
            setError('Vui lòng đăng nhập để gửi tin nhắn.');
            return;
        }

        setIsSending(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    receiverUserId: SUPPORT_USER_ID,
                    content,
                }),
            });

            const result = (await response.json()) as ApiResponse<MessageDto>;
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Gửi tin nhắn thất bại.');
            }

            setMessages((prev) => {
                const exists = prev.some((item) => item.id === result.data.id);
                if (exists) {
                    return prev;
                }
                return [...prev, result.data];
            });
            setDraft('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gửi tin nhắn thất bại.');
        } finally {
            setIsSending(false);
        }
    };

    if (shouldHide || !isIconVisible) {
        return null;
    }

    const handleIconPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        const state = dragStateRef.current;
        state.dragging = true;
        state.moved = false;
        state.startX = e.clientX;
        state.startY = e.clientY;
        state.originX = iconPosition.x;
        state.originY = iconPosition.y;
        state.pointerId = e.pointerId;

        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleIconPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        const state = dragStateRef.current;
        if (!state.dragging || state.pointerId !== e.pointerId) {
            return;
        }

        const dx = e.clientX - state.startX;
        const dy = e.clientY - state.startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            state.moved = true;
        }

        const next = clampPosition(state.originX + dx, state.originY + dy);
        setIconPosition(next);
    };

    const handleIconPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
        const state = dragStateRef.current;
        if (state.pointerId !== e.pointerId) {
            return;
        }

        e.currentTarget.releasePointerCapture(e.pointerId);
        state.dragging = false;

        if (!state.moved) {
            setIsOpen(true);
        }
    };

    const handleIconPointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
        const state = dragStateRef.current;
        if (state.pointerId !== e.pointerId) {
            return;
        }

        state.dragging = false;
        state.pointerId = -1;
    };

    return (
        <>
            {isIconReady && (
                <div
                    className="fixed z-40"
                    style={{ left: `${iconPosition.x}px`, top: `${iconPosition.y}px` }}
                >
                    <button
                        type="button"
                        onPointerDown={handleIconPointerDown}
                        onPointerMove={handleIconPointerMove}
                        onPointerUp={handleIconPointerUp}
                        onPointerCancel={handleIconPointerCancel}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 touch-none select-none"
                        title="Hỗ trợ khách hàng"
                    >
                        <Headset className="w-6 h-6" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsIconVisible(false)}
                        className="absolute -top-2 -right-2 bg-slate-700 hover:bg-slate-800 text-white rounded-full p-1 shadow"
                        title="Ẩn biểu tượng chat"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setIsOpen(false)}>
                    <div
                        className="w-full max-w-2xl max-h-[80vh] bg-white rounded-xl shadow-xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <h3 className="text-lg font-semibold text-slate-800">Hỗ trợ khách hàng</h3>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded hover:bg-slate-100"
                                aria-label="Đóng"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                            {isLoading && <p className="text-sm text-slate-500">Đang tải lịch sử tin nhắn...</p>}
                            {!isLoading && messages.length === 0 && (
                                <p className="text-sm text-slate-500">Chưa có tin nhắn nào với hỗ trợ.</p>
                            )}

                            {!isLoading &&
                                messages.map((message) => {
                                    const isSupport = message.senderId === SUPPORT_USER_ID;
                                    return (
                                        <div
                                            key={message.id}
                                            className={`max-w-[85%] rounded-lg px-3 py-2 ${isSupport
                                                ? 'bg-slate-200 text-slate-800 mr-auto'
                                                : 'bg-blue-600 text-white ml-auto'
                                                }`}
                                        >
                                            <p className="text-sm break-words">{message.content}</p>
                                            <p
                                                className={`mt-1 text-[11px] ${isSupport ? 'text-slate-500' : 'text-blue-100'
                                                    }`}
                                            >
                                                {formatTime(message.createdAt)}
                                            </p>
                                        </div>
                                    );
                                })}
                        </div>

                        <div className="border-t p-4 space-y-2">
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    placeholder="Nhập tin nhắn cần hỗ trợ..."
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleSendMessage}
                                    disabled={isSending || !draft.trim()}
                                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg px-3 py-2 text-sm"
                                >
                                    <Send className="w-4 h-4" />
                                    Gửi
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SupportChatWidget;
