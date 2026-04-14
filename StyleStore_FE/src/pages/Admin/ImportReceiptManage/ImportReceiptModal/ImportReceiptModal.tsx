import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../../../components/ToastProvider';
import { buildAuthHeaders, isAuthTokenMissingError } from '../../../../services/auth';
import ImportReceiptIItems from './ImportReceiptIItems';
import ImportReceiptInput, {
	type DraftImportReceiptItem,
	type ProductOption,
	type SizeOption,
	type SupplierOption,
} from './ImportReceiptInput';

type ApiResponse<T> = {
	success: boolean;
	message?: string;
	data?: T;
};

type PageData<T> = {
	content: T[];
	totalElements: number;
	totalPages: number;
	number: number;
};

type SupplierDto = {
	id: number;
	name: string;
};

type SizeDto = {
	id: number;
	name: string;
};

type ProductDto = {
	id: number;
	name: string;
	price?: number;
	status?: string;
};

interface ImportReceiptModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSaved?: () => void;
}

const parseCurrentUserId = (): number | null => {
	try {
		const rawUser = localStorage.getItem('user');
		if (!rawUser) {
			return null;
		}

		const parsed = JSON.parse(rawUser) as { id?: number };
		return typeof parsed.id === 'number' ? parsed.id : null;
	} catch {
		return null;
	}
};

const ImportReceiptModal: React.FC<ImportReceiptModalProps> = ({ isOpen, onClose, onSaved }) => {
	const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
	const [sizes, setSizes] = useState<SizeOption[]>([]);
	const [products, setProducts] = useState<ProductOption[]>([]);
	const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
	const [note, setNote] = useState('');
	const [items, setItems] = useState<DraftImportReceiptItem[]>([]);
	const [isLoadingOptions, setIsLoadingOptions] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState('');

	const { pushToast } = useToast();

	const grandTotal = useMemo(
		() => items.reduce((sum, item) => sum + item.importPrice * item.quantity, 0),
		[items],
	);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const resetFormState = () => {
			setSelectedSupplierId(null);
			setNote('');
			setItems([]);
			setError('');
		};

		const fetchOptions = async () => {
			setIsLoadingOptions(true);
			setError('');
			resetFormState();

			try {
				const authHeaders = buildAuthHeaders();

				const [supplierRes, sizeRes, productRes] = await Promise.all([
					fetch('http://localhost:8080/api/admin/suppliers?page=0&size=200&sortBy=createdAt&sortDir=desc', {
						headers: {
							'Content-Type': 'application/json',
							...authHeaders,
						},
					}),
					fetch('http://localhost:8080/api/admin/sizes', {
						headers: {
							'Content-Type': 'application/json',
							...authHeaders,
						},
					}),
					fetch('http://localhost:8080/api/admin/products?page=0&size=200&sortBy=createdAt&sortDir=desc', {
						headers: {
							'Content-Type': 'application/json',
							...authHeaders,
						},
					}),
				]);

				if (!supplierRes.ok) {
					const text = await supplierRes.text();
					const payload = text ? JSON.parse(text) : {};
					throw new Error(payload.message || 'Không thể tải danh sách nhà cung cấp.');
				}

				if (!sizeRes.ok) {
					const text = await sizeRes.text();
					const payload = text ? JSON.parse(text) : {};
					throw new Error(payload.message || 'Không thể tải danh sách size.');
				}

				if (!productRes.ok) {
					const text = await productRes.text();
					const payload = text ? JSON.parse(text) : {};
					throw new Error(payload.message || 'Không thể tải danh sách sản phẩm.');
				}

				const supplierPayload: ApiResponse<PageData<SupplierDto>> = await supplierRes.json();
				const sizePayload = await sizeRes.json();
				const productPayload: ApiResponse<PageData<ProductDto>> = await productRes.json();

				const supplierOptions = supplierPayload.data?.content ?? [];
				setSuppliers(
					supplierOptions.map((supplier) => ({
						id: supplier.id,
						name: supplier.name,
					})),
				);

				const normalizedSizes: SizeDto[] = Array.isArray(sizePayload)
					? sizePayload
					: (sizePayload as ApiResponse<SizeDto[]>).data ?? [];

				setSizes(
					normalizedSizes.map((size) => ({
						id: size.id,
						name: size.name,
					})),
				);

				const productOptions = (productPayload.data?.content ?? [])
					.filter((product) => !product.status || product.status === 'ACTIVE')
					.map((product) => ({
						id: product.id,
						name: product.name,
						price: typeof product.price === 'number' ? product.price : 0,
					}));
				setProducts(productOptions);
			} catch (e) {
				if (isAuthTokenMissingError(e)) {
					setError('Bạn chưa đăng nhập hoặc thiếu token.');
					return;
				}

				const message = e instanceof Error ? e.message : 'Không thể tải dữ liệu cho phiếu nhập.';
				setError(message);
			} finally {
				setIsLoadingOptions(false);
			}
		};

		fetchOptions();
	}, [isOpen]);

	const handleConfirmItems = (nextItems: DraftImportReceiptItem[]) => {
		setItems((prev) => {
			const merged = [...prev];

			nextItems.forEach((newItem) => {
				const existingIndex = merged.findIndex(
					(item) => item.productId === newItem.productId && item.sizeId === newItem.sizeId,
				);

				if (existingIndex >= 0) {
					merged[existingIndex] = {
						...merged[existingIndex],
						quantity: merged[existingIndex].quantity + newItem.quantity,
						importPrice: newItem.importPrice,
					};
					return;
				}

				merged.push(newItem);
			});

			return merged;
		});
		setError('');
	};

	const handleRemoveItem = (productId: number, sizeId: number) => {
		setItems((prev) => prev.filter((item) => !(item.productId === productId && item.sizeId === sizeId)));
	};

	const handleSaveReceipt = async () => {
		if (!selectedSupplierId) {
			setError('Vui lòng chọn nhà cung cấp trước khi lưu phiếu nhập.');
			return;
		}

		if (items.length === 0) {
			setError('Phiếu nhập chưa có sản phẩm. Vui lòng thêm sản phẩm trước khi lưu.');
			return;
		}

		const createdBy = parseCurrentUserId();
		if (!createdBy) {
			setError('Không tìm thấy thông tin người dùng hiện tại. Vui lòng đăng nhập lại.');
			return;
		}

		setIsSaving(true);
		setError('');

		try {
			const authHeaders = buildAuthHeaders();
			const response = await fetch('http://localhost:8080/api/admin/import-receipts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...authHeaders,
				},
				body: JSON.stringify({
					supplierId: selectedSupplierId,
					createdBy,
					note,
					status: 'COMPLETED',
					items: items.map((item) => ({
						productId: item.productId,
						sizeId: item.sizeId,
						quantity: item.quantity,
						importPrice: item.importPrice,
					})),
				}),
			});

			if (!response.ok) {
				const text = await response.text();
				const payload = text ? JSON.parse(text) : {};
				throw new Error(payload.message || `Lưu phiếu nhập thất bại (code ${response.status}).`);
			}

			const payload: ApiResponse<unknown> = await response.json();
			if (!payload.success) {
				throw new Error(payload.message || 'Lưu phiếu nhập thất bại.');
			}

			pushToast('Tạo phiếu nhập thành công.', 'success');
			onSaved?.();
			onClose();
		} catch (e) {
			if (isAuthTokenMissingError(e)) {
				setError('Bạn chưa đăng nhập hoặc thiếu token.');
				return;
			}

			setError(e instanceof Error ? e.message : 'Không thể lưu phiếu nhập.');
		} finally {
			setIsSaving(false);
		}
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
				<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
					<div>
						<h3 className="text-lg font-semibold text-slate-900">Tạo phiếu nhập mới</h3>
						<p className="text-xs text-slate-500">Xác nhận sản phẩm để lưu tạm, sau đó bấm Lưu để tạo phiếu nhập.</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-slate-500 transition hover:text-slate-700"
						aria-label="Đóng"
					>
						✕
					</button>
				</div>

				<div className="space-y-5 overflow-y-auto px-5 py-4">
					<ImportReceiptInput
						suppliers={suppliers}
						sizes={sizes}
						products={products}
						selectedSupplierId={selectedSupplierId}
						note={note}
						isLoadingOptions={isLoadingOptions}
						error={error}
						onSupplierChange={setSelectedSupplierId}
						onNoteChange={setNote}
						onConfirmItems={handleConfirmItems}
					/>

					<ImportReceiptIItems items={items} onRemoveItem={handleRemoveItem} />
				</div>

				<div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4">
					<div className="text-sm text-slate-700">
						Tổng giá trị tạm tính: <span className="font-semibold text-blue-700">
							{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}
						</span>
					</div>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={onClose}
							className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
						>
							Đóng
						</button>
						<button
							type="button"
							onClick={handleSaveReceipt}
							disabled={isSaving || isLoadingOptions}
							className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSaving ? 'Đang lưu...' : 'Lưu'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ImportReceiptModal;
