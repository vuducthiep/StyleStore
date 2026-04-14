import React, { useEffect, useState } from 'react';
import { buildAuthHeaders, isAuthTokenMissingError } from '../../../services/auth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ImportReceiptItem {
	id: number;
	productId: number;
	productName?: string;
	sizeId: number;
	sizeName?: string;
	quantity: number;
	importPrice: number;
	subtotal: number;
}

interface ImportReceiptDetail {
	id: number;
	supplierId: number;
	supplierName?: string;
	createdBy?: number;
	note?: string;
	status?: string;
	totalAmount?: number;
	createdAt?: string;
	updatedAt?: string;
	items?: ImportReceiptItem[];
}

type ApiResponse<T> = {
	success: boolean;
	message?: string;
	data?: T;
};

interface ImportReceiptDetailModalProps {
	isOpen: boolean;
	receiptId: number | null;
	onClose: () => void;
}

const ImportReceiptDetailModal: React.FC<ImportReceiptDetailModalProps> = ({ isOpen, receiptId, onClose }) => {
	const [receipt, setReceipt] = useState<ImportReceiptDetail | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [isExporting, setIsExporting] = useState(false);

	useEffect(() => {
		if (!isOpen || !receiptId) {
			return;
		}

		const fetchReceiptDetail = async () => {
			setIsLoading(true);
			setError('');

			try {
				const authHeaders = buildAuthHeaders();
				const res = await fetch(`http://localhost:8080/api/admin/import-receipts/${receiptId}`, {
					headers: {
						'Content-Type': 'application/json',
						...authHeaders,
					},
				});

				if (!res.ok) {
					const text = await res.text();
					const data = text ? JSON.parse(text) : {};
					setError(data.message || `Lỗi tải chi tiết phiếu nhập (code ${res.status}).`);
					return;
				}

				const data: ApiResponse<ImportReceiptDetail> = await res.json();
				if (!data.success || !data.data) {
					setError(data.message || 'Lỗi tải chi tiết phiếu nhập.');
					return;
				}

				setReceipt(data.data);
			} catch (e) {
				if (isAuthTokenMissingError(e)) {
					setError('Bạn chưa đăng nhập hoặc thiếu token.');
					return;
				}

				console.error('Fetch import receipt detail error:', e);
				setError('Không thể kết nối máy chủ.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchReceiptDetail();
	}, [isOpen, receiptId]);

	if (!isOpen) {
		return null;
	}

	const formatCurrency = (amount?: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
	};

	const formatDateTime = (date?: string) => {
		if (!date) {
			return '-';
		}

		return new Date(date).toLocaleString('vi-VN');
	};

	const getStatusLabel = (status?: string) => {
		switch (status) {
			case 'COMPLETED':
				return 'Hoàn thành';
			case 'PENDING':
				return 'Chờ xử lý';
			case 'CANCELLED':
				return 'Đã hủy';
			default:
				return status || '-';
		}
	};

	const getStatusStyle = (status?: string) => {
		switch (status) {
			case 'COMPLETED':
				return 'bg-emerald-100 text-emerald-700';
			case 'PENDING':
				return 'bg-amber-100 text-amber-700';
			case 'CANCELLED':
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-slate-100 text-slate-700';
		}
	};

	const escapeHtml = (value: string) =>
		value
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#039;');

	const handleExportPdf = async () => {
		if (!receipt || isExporting) {
			return;
		}

		setIsExporting(true);

		const exportRoot = document.createElement('div');
		exportRoot.style.position = 'fixed';
		exportRoot.style.left = '-10000px';
		exportRoot.style.top = '0';
		exportRoot.style.width = '1024px';
		exportRoot.style.background = '#ffffff';
		exportRoot.style.padding = '24px';
		exportRoot.style.boxSizing = 'border-box';
		exportRoot.style.fontFamily = 'Arial, Helvetica, sans-serif';

		const rows = (receipt.items ?? [])
			.map(
				(item) => `
				<tr>
					<td style="padding:8px;border:1px solid #e2e8f0;">
						${escapeHtml(item.productName || '-')}
						<br/><span style="font-size:11px;color:#64748b;">ID: ${item.productId}</span>
					</td>
					<td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">${escapeHtml(item.sizeName || String(item.sizeId))}</td>
					<td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
					<td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${formatCurrency(item.importPrice)}</td>
					<td style="padding:8px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">${formatCurrency(item.subtotal || item.importPrice * item.quantity)}</td>
				</tr>
			`,
			)
			.join('');

		exportRoot.innerHTML = `
			<div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
				<div style="padding:16px 20px;border-bottom:1px solid #e2e8f0;background:#f8fafc;display:flex;justify-content:space-between;align-items:center;">
					<h1 style="margin:0;font-size:22px;color:#0f172a;">Phiếu nhập #${receipt.id}</h1>
					<span style="padding:4px 10px;border-radius:999px;background:#dcfce7;color:#166534;font-weight:600;font-size:12px;">${escapeHtml(getStatusLabel(receipt.status))}</span>
				</div>
				<div style="padding:16px 20px;">
					<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;font-size:14px;color:#334155;">
						<div><b>Mã phiếu:</b> #${receipt.id}</div>
						<div><b>Nhà cung cấp:</b> ${escapeHtml(receipt.supplierName || '-')} (ID: ${receipt.supplierId})</div>
						<div><b>ID người tạo:</b> ${receipt.createdBy ?? '-'}</div>
						<div><b>Ngày tạo:</b> ${escapeHtml(formatDateTime(receipt.createdAt))}</div>
						<div><b>Cập nhật:</b> ${escapeHtml(formatDateTime(receipt.updatedAt))}</div>
						<div><b>Trạng thái:</b> ${escapeHtml(getStatusLabel(receipt.status))}</div>
					</div>
					<div style="margin-bottom:16px;font-size:14px;color:#334155;"><b>Ghi chú:</b> ${escapeHtml(receipt.note || '-')}</div>
					<table style="width:100%;border-collapse:collapse;font-size:13px;color:#0f172a;">
						<thead>
							<tr style="background:#eff6ff;">
								<th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">Sản phẩm</th>
								<th style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Size</th>
								<th style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Số lượng</th>
								<th style="padding:8px;border:1px solid #e2e8f0;text-align:right;">Giá nhập</th>
								<th style="padding:8px;border:1px solid #e2e8f0;text-align:right;">Thành tiền</th>
							</tr>
						</thead>
						<tbody>${rows}</tbody>
					</table>
					<div style="display:flex;justify-content:flex-end;margin-top:16px;font-size:18px;font-weight:700;color:#2563eb;">
						Tổng phiếu nhập: ${formatCurrency(receipt.totalAmount || 0)}
					</div>
				</div>
			</div>
		`;

		document.body.appendChild(exportRoot);

		try {
			const canvas = await html2canvas(exportRoot, {
				scale: 2,
				useCORS: true,
				backgroundColor: '#ffffff',
			});

			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF('p', 'mm', 'a4');
			const pageWidth = 210;
			const pageHeight = 297;
			const imgWidth = pageWidth;
			const imgHeight = (canvas.height * imgWidth) / canvas.width;

			let heightLeft = imgHeight;
			let position = 0;

			pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;

			while (heightLeft > 0) {
				position = heightLeft - imgHeight;
				pdf.addPage();
				pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
			}

			pdf.save(`phieu-nhap-${receipt.id}.pdf`);
		} catch (e) {
			console.error('Export import receipt pdf error:', e);
			setError('Không thể xuất PDF. Vui lòng thử lại.');
		} finally {
			document.body.removeChild(exportRoot);
			setIsExporting(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
				<div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
					<h2 className="text-xl font-bold text-slate-800">Chi tiết phiếu nhập #{receiptId}</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-slate-400 hover:text-slate-600 transition"
						aria-label="Đóng"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="p-6">
					{isLoading ? (
						<div className="text-center py-8 text-slate-500">Đang tải...</div>
					) : error ? (
						<div className="text-center py-8 text-red-600">{error}</div>
					) : receipt ? (
						<>
							<div className="mb-6">
								<h3 className="text-lg font-semibold text-slate-800 mb-4">Thông tin phiếu nhập</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
									<div>
										<p className="text-sm text-slate-500">Mã phiếu</p>
										<p className="font-medium text-slate-800">#{receipt.id}</p>
									</div>
									<div>
										<p className="text-sm text-slate-500">Nhà cung cấp</p>
										<p className="font-medium text-slate-800">{receipt.supplierName || '-'} (ID: {receipt.supplierId})</p>
									</div>
									<div>
										<p className="text-sm text-slate-500">ID người tạo</p>
										<p className="font-medium text-slate-800">{receipt.createdBy ?? '-'}</p>
									</div>
									<div>
										<p className="text-sm text-slate-500">Trạng thái</p>
										<span className={`inline-block px-3 py-1 rounded text-sm ${getStatusStyle(receipt.status)}`}>
											{getStatusLabel(receipt.status)}
										</span>
									</div>
									<div>
										<p className="text-sm text-slate-500">Ngày tạo</p>
										<p className="font-medium text-slate-800">{formatDateTime(receipt.createdAt)}</p>
									</div>
									<div>
										<p className="text-sm text-slate-500">Cập nhật lần cuối</p>
										<p className="font-medium text-slate-800">{formatDateTime(receipt.updatedAt)}</p>
									</div>
									<div className="md:col-span-2">
										<p className="text-sm text-slate-500">Ghi chú</p>
										<p className="font-medium text-slate-800">{receipt.note || '-'}</p>
									</div>
								</div>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-slate-800 mb-4">Danh sách sản phẩm nhập</h3>
								{!receipt.items || receipt.items.length === 0 ? (
									<div className="border border-slate-200 rounded-lg p-4 text-sm text-slate-500">Phiếu nhập chưa có sản phẩm.</div>
								) : (
									<div className="overflow-x-auto border border-slate-200 rounded-lg">
										<table className="min-w-full text-sm">
											<thead className="bg-slate-50 text-slate-600">
												<tr>
													<th className="px-4 py-3 text-left">ID item</th>
													<th className="px-4 py-3 text-left">Sản phẩm</th>
													<th className="px-4 py-3 text-left">Size</th>
													<th className="px-4 py-3 text-center">Số lượng</th>
													<th className="px-4 py-3 text-right">Giá nhập</th>
													<th className="px-4 py-3 text-right">Thành tiền</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100">
												{receipt.items.map((item) => (
													<tr key={item.id} className="hover:bg-slate-50">
														<td className="px-4 py-3">#{item.id}</td>
														<td className="px-4 py-3">
															<p className="font-medium text-slate-800">{item.productName || '-'}</p>
															<p className="text-xs text-slate-500">ID SP: {item.productId}</p>
														</td>
														<td className="px-4 py-3">
															<span className="px-2 py-1 bg-slate-100 rounded text-xs">
																{item.sizeName || '-'}
															</span>
														</td>
														<td className="px-4 py-3 text-center">{item.quantity}</td>
														<td className="px-4 py-3 text-right">{formatCurrency(item.importPrice)}</td>
														<td className="px-4 py-3 text-right font-semibold text-blue-700">{formatCurrency(item.subtotal)}</td>
													</tr>
												))}
											</tbody>
											<tfoot className="bg-slate-50">
												<tr>
													<td colSpan={5} className="px-4 py-3 text-right font-semibold text-slate-700">Tổng phiếu nhập:</td>
													<td className="px-4 py-3 text-right font-bold text-blue-700">{formatCurrency(receipt.totalAmount)}</td>
												</tr>
											</tfoot>
										</table>
									</div>
								)}
							</div>
						</>
					) : null}
				</div>

				<div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
					<button
						type="button"
						onClick={handleExportPdf}
						disabled={isLoading || isExporting || !receipt}
						className="px-6 py-2 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{isExporting ? 'Đang xuất PDF...' : 'Xuất PDF'}
					</button>
					<button
						type="button"
						onClick={onClose}
						className="px-6 py-2 rounded bg-slate-700 text-white font-medium hover:bg-slate-800 transition"
					>
						Đóng
					</button>
				</div>
			</div>
		</div>
	);
};

export default ImportReceiptDetailModal;
