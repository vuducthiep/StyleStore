import React from 'react';

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title = 'Xác nhận',
    message = 'Bạn có chắc muốn thực hiện thao tác này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    isLoading = false,
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-lg border border-slate-200">
                <div className="px-4 py-3 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                </div>
                <div className="px-4 py-4 text-slate-700 text-sm leading-relaxed">
                    {message}
                </div>
                <div className="px-4 py-3 flex justify-end gap-2 border-t border-slate-100 bg-slate-50">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-white disabled:opacity-60"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 rounded bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60"
                    >
                        {isLoading ? 'Đang xử lý...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
