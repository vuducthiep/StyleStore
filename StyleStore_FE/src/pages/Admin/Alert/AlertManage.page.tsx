import { useCallback, useEffect, useRef, useState } from 'react';
import { buildAuthHeaders, isAuthTokenMissingError } from '../../../services/auth';

type ApiResponse<T> = {
	success: boolean;
	message?: string;
	data?: T;
};

type PageResult<T> = {
	content: T[];
	number: number;
	totalPages: number;
	totalElements: number;
};

type InventoryAlertResponse = {
	id: number;
	productId?: number | null;
	productName?: string | null;
	userId?: number | null;
	userName?: string | null;
	message: string;
	status: number;
	createdAt?: string | null;
};

const STATUS_OPTIONS = [
	{ value: '', label: 'Tất cả trạng thái' },
	{ value: '0', label: 'Chưa xử lý' },
	{ value: '1', label: 'Đã xử lý' },
];

const formatDateTime = (value?: string | null) => {
	if (!value) {
		return '-';
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`;
};

const AlertManagePage = () => {
	const [alerts, setAlerts] = useState<InventoryAlertResponse[]>([]);
	const [page, setPage] = useState(0);
	const [size] = useState(10);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [statusInput, setStatusInput] = useState('');
	const [appliedStatus, setAppliedStatus] = useState('');
	const lastFetchKeyRef = useRef<string | null>(null);

	const fetchAlerts = useCallback(async (pageIndex = 0, status = appliedStatus) => {
		setIsLoading(true);
		setError('');

		try {
			const authHeaders = buildAuthHeaders();
			const query = new URLSearchParams({
				page: String(pageIndex),
				size: String(size),
				sortBy: 'createdAt',
				sortDir: 'desc',
			});

			const endpoint = status.trim()
				? `http://localhost:8080/api/admin/inventory-alerts/filter/status?${query.toString()}&status=${encodeURIComponent(status.trim())}`
				: `http://localhost:8080/api/admin/inventory-alerts?${query.toString()}`;

			const response = await fetch(endpoint, {
				headers: {
					'Content-Type': 'application/json',
					...authHeaders,
				},
			});

			if (!response.ok) {
				const text = await response.text();
				const payload = text ? JSON.parse(text) : {};
				throw new Error(payload.message || `Lỗi tải danh sách cảnh báo (code ${response.status}).`);
			}

			const payload: ApiResponse<PageResult<InventoryAlertResponse>> = await response.json();
			if (!payload.success || !payload.data) {
				throw new Error(payload.message || 'Dữ liệu cảnh báo không hợp lệ.');
			}

			setAlerts(payload.data.content || []);
			setTotalPages(payload.data.totalPages || 0);
			setTotalElements(payload.data.totalElements || 0);
		} catch (e) {
			if (isAuthTokenMissingError(e)) {
				setError('Bạn chưa đăng nhập hoặc thiếu token.');
				return;
			}

			setError(e instanceof Error ? e.message : 'Không thể tải danh sách cảnh báo.');
		} finally {
			setIsLoading(false);
		}
	}, [appliedStatus, size]);

	useEffect(() => {
		const fetchKey = `${page}-${appliedStatus}`;
		if (lastFetchKeyRef.current === fetchKey) {
			return;
		}

		lastFetchKeyRef.current = fetchKey;
		fetchAlerts(page, appliedStatus);
	}, [appliedStatus, fetchAlerts, page]);

	const handleApplyFilter = () => {
		setError('');
		setAppliedStatus(statusInput);
		setPage(0);
	};

	const handleClearFilter = () => {
		setStatusInput('');
		setAppliedStatus('');
		setPage(0);
	};

	const getStatusBadge = (status: number) => {
		if (status === 1) {
			return 'bg-emerald-100 text-emerald-700';
		}

		return 'bg-amber-100 text-amber-700';
	};

	const [processingId, setProcessingId] = useState<number | null>(null);

	const handleMarkProcessed = async (id: number) => {
		setProcessingId(id);
		setError('');

		try {
			const authHeaders = buildAuthHeaders();
			const response = await fetch(`http://localhost:8080/api/admin/inventory-alerts/${id}/processed`, {
				headers: {
					'Content-Type': 'application/json',
					...authHeaders,
				},
				method: 'PUT',
			});

			if (!response.ok) {
				const text = await response.text();
				const payload = text ? JSON.parse(text) : {};
				throw new Error(payload.message || `Lỗi cập nhật trạng thái (code ${response.status}).`);
			}

			const payload: ApiResponse<InventoryAlertResponse> = await response.json();
			if (!payload.success || !payload.data) {
				throw new Error(payload.message || 'Dữ liệu trả về không hợp lệ.');
			}

			setAlerts((prev) => prev.map((a) => (a.id === id ? payload.data! : a)));
		} catch (e) {
			if (isAuthTokenMissingError(e)) {
				setError('Bạn chưa đăng nhập hoặc thiếu token.');
				return;
			}

			setError(e instanceof Error ? e.message : 'Không thể cập nhật trạng thái.');
		} finally {
			setProcessingId(null);
		}
	};

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
				<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div>
						<h1 className="text-2xl font-bold text-slate-900">Cảnh báo tồn kho</h1>
						<p className="mt-1 text-sm text-slate-500">Theo dõi các sản phẩm gần hết hàng hoặc đã hết hàng do khách mua.</p>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
						<label className="text-sm text-slate-700">
							Trạng thái
							<select
								value={statusInput}
								onChange={(event) => setStatusInput(event.target.value)}
								className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-52"
							>
								{STATUS_OPTIONS.map((option) => (
									<option key={option.value || 'all'} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</label>

						<div className="flex gap-2">
							<button
								type="button"
								onClick={handleApplyFilter}
								className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
							>
								Lọc
							</button>
							<button
								type="button"
								onClick={handleClearFilter}
								className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
							>
								Xóa lọc
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-slate-200 bg-white shadow-sm">
				<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
					<p className="text-sm text-slate-600">
						Tổng <span className="font-semibold text-slate-900">{totalElements}</span> cảnh báo
					</p>
					<p className="text-sm text-slate-500">
						{appliedStatus === '' ? 'Đang xem tất cả trạng thái' : `Đang lọc: ${STATUS_OPTIONS.find((item) => item.value === appliedStatus)?.label || appliedStatus}`}
					</p>
				</div>

				{isLoading ? (
					<div className="px-5 py-10 text-center text-sm text-slate-500">Đang tải...</div>
				) : error ? (
					<div className="px-5 py-10 text-center text-sm text-red-600">{error}</div>
				) : alerts.length === 0 ? (
					<div className="px-5 py-10 text-center text-sm text-slate-500">Chưa có cảnh báo tồn kho nào.</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead className="bg-slate-50 text-slate-600">
								<tr>
									<th className="px-4 py-3 text-center">ID</th>
									<th className="px-4 py-3 text-center w-80">Sản phẩm</th>
									<th className="px-4 py-3 text-center">Người mua</th>
									<th className="px-4 py-3 text-center">Nội dung cảnh báo</th>
									<th className="px-4 py-3 text-center">Thời gian</th>
									<th className="px-4 py-3 text-center">Trạng thái</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 text-slate-700">
								{alerts.map((alert) => (
									<tr key={alert.id} className="hover:bg-slate-50">
										<td className="px-4 py-3 font-medium text-slate-900 text-center">#{alert.id}</td>
										<td className="px-4 py-3 w-40 text-center">
											<p className="font-medium text-slate-900 break-words whitespace-normal">{alert.productName || '-'}</p>
											<p className="text-xs text-slate-500">ID: {alert.productId ?? '-'}</p>
										</td>
										<td className="px-4 py-3 text-center">
											<p className="font-medium text-slate-900">{alert.userName || 'Hệ thống'}</p>
											<p className="text-xs text-slate-500">ID: {alert.userId ?? '-'}</p>
										</td>
										<td className="px-4 py-3 w-64 text-center">
											<p className="max-w-[260px] break-words text-slate-800 whitespace-normal">{alert.message}</p>
										</td>
										<td className="px-4 py-3 text-slate-600 text-center">{formatDateTime(alert.createdAt)}</td>
										<td className="px-4 py-3 text-center">
											<div className="flex items-center gap-2">
												<span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(alert.status)}`}>
													{alert.status === 1 ? 'Đã xử lý' : 'Chưa xử lý'}
												</span>
												{alert.status !== 1 && (
													<button
														type="button"
														onClick={() => handleMarkProcessed(alert.id)}
														disabled={processingId === alert.id}
														className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
													>
														Xử lý
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{!isLoading && !error && totalPages > 1 && (
					<div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-700">
						<span>Trang {page + 1}/{totalPages}</span>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setPage(Math.max(page - 1, 0))}
								disabled={page === 0}
								className="rounded border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Trước
							</button>
							<button
								type="button"
								onClick={() => setPage(Math.min(page + 1, totalPages - 1))}
								disabled={page >= totalPages - 1}
								className="rounded border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Sau
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default AlertManagePage;
