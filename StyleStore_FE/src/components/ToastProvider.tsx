import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    pushToast: (message: string, type?: ToastType, durationMs?: number) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timeoutRef = useRef<Record<number, number>>({});

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timeoutRef.current[id];
        if (timer) {
            window.clearTimeout(timer);
            delete timeoutRef.current[id];
        }
    }, []);

    const pushToast = useCallback((message: string, type: ToastType = 'info', durationMs = 3200) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, duration: durationMs }]);
        const timer = window.setTimeout(() => removeToast(id), durationMs);
        timeoutRef.current[id] = timer;
    }, [removeToast]);

    const value = useMemo(() => ({ pushToast, removeToast }), [pushToast, removeToast]);

    useEffect(() => () => {
        Object.values(timeoutRef.current).forEach((t) => window.clearTimeout(t));
    }, []);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed top-4 right-4 z-[9999] flex flex-col gap-3">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto w-72 rounded-lg border px-4 py-3 shadow-md text-sm text-slate-900 transition transform animate-[fade-in_0.15s_ease-out]
                            ${toast.type === 'success' ? 'border-green-200 bg-green-50' : ''}
                            ${toast.type === 'error' ? 'border-red-200 bg-red-50' : ''}
                            ${toast.type === 'info' ? 'border-slate-200 bg-white' : ''}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <span className="leading-snug">{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-slate-400 hover:text-slate-600"
                                aria-label="Close toast"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        console.warn('useToast must be used within ToastProvider');
        return {
            pushToast: () => undefined,
            removeToast: () => undefined,
        };
    }
    return ctx;
}

export default ToastProvider;
