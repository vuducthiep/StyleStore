import React, { useState } from 'react';
import { buildAuthHeaders, isAuthTokenMissingError } from '../../../../services/auth';

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

export type SupplierOption = {
	id: number;
	name: string;
};

export type SizeOption = {
	id: number;
	name: string;
};

export type ProductOption = {
	id: number;
	name: string;
	price?: number;
};

type ProductSearchResult = {
	id: number;
	name: string;
	price?: number;
	brand?: string;
	category?: {
		id: number;
		name: string;
	};
	status?: string;
};

export type DraftImportReceiptItem = {
	productId: number;
	productName: string;
	sizeId: number;
	sizeName: string;
	quantity: number;
	importPrice: number;
};

interface ImportReceiptInputProps {
	suppliers: SupplierOption[];
	sizes: SizeOption[];
	selectedSupplierId: number | null;
	note: string;
	isLoadingOptions: boolean;
	error?: string;
	onSupplierChange: (supplierId: number | null) => void;
	onNoteChange: (note: string) => void;
	onConfirmItems: (items: DraftImportReceiptItem[]) => void;
}

const ImportReceiptInput: React.FC<ImportReceiptInputProps> = ({
	suppliers,
	sizes,
	selectedSupplierId,
	note,
	isLoadingOptions,
	error,
	onSupplierChange,
	onNoteChange,
	onConfirmItems,
}) => {
	const [searchInput, setSearchInput] = useState('');
	const [searchKeyword, setSearchKeyword] = useState('');
	const [productResults, setProductResults] = useState<ProductSearchResult[]>([]);
	const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
	const [isSearchingProducts, setIsSearchingProducts] = useState(false);
	const [importPriceInput, setImportPriceInput] = useState('');
	const [quantitiesBySize, setQuantitiesBySize] = useState<Record<number, string>>({});
	const [localError, setLocalError] = useState('');

	const fetchProducts = async (keywordParam: string) => {
		setIsSearchingProducts(true);
		setLocalError('');

		try {
			const authHeaders = buildAuthHeaders();
			const keyword = keywordParam.trim();
			const queryParams = new URLSearchParams({
				page: '0',
				size: '20',
				sortBy: 'createdAt',
				sortDir: 'desc',
			});

			if (keyword) {
				queryParams.set('keyword', keyword);
			}

			const endpoint = keyword
				? `http://localhost:8080/api/admin/products/search?${queryParams.toString()}`
				: `http://localhost:8080/api/admin/products?${queryParams.toString()}`;

			const res = await fetch(endpoint, {
				headers: {
					'Content-Type': 'application/json',
					...authHeaders,
				},
			});

			if (!res.ok) {
				const text = await res.text();
				const payload = text ? JSON.parse(text) : {};
				throw new Error(payload.message || `Không thể tìm sản phẩm (code ${res.status}).`);
			}

			const payload: ApiResponse<PageResult<ProductSearchResult>> = await res.json();
			if (!payload.success || !payload.data) {
				throw new Error(payload.message || 'Dữ liệu tìm kiếm sản phẩm không hợp lệ.');
			}

			const nextResults = (payload.data.content || []).filter((product) => !product.status || product.status === 'ACTIVE');
			setProductResults(nextResults);
			setSearchKeyword(keyword);
		} catch (e) {
			if (isAuthTokenMissingError(e)) {
				setLocalError('Bạn chưa đăng nhập hoặc thiếu token.');
				return;
			}

			setLocalError(e instanceof Error ? e.message : 'Không thể tìm sản phẩm.');
		} finally {
			setIsSearchingProducts(false);
		}
	};

	const handleQuantityChange = (sizeId: number, value: string) => {
		if (value === '' || /^\d+$/.test(value)) {
			setQuantitiesBySize((prev) => ({ ...prev, [sizeId]: value }));
			setLocalError('');
		}
	};

	const handleSearchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const keyword = searchInput.trim();

		if (!keyword) {
			setProductResults([]);
			setSelectedProduct(null);
			setImportPriceInput('');
			setQuantitiesBySize({});
			setSearchKeyword('');
			setLocalError('Vui lòng nhập từ khóa để tìm sản phẩm.');
			return;
		}

		await fetchProducts(keyword);
	};

	const handlePickProduct = (product: ProductSearchResult) => {
		setSelectedProduct(product);
		setImportPriceInput(typeof product.price === 'number' ? String(product.price) : '');
		const next: Record<number, string> = {};
		sizes.forEach((size) => {
			next[size.id] = '';
		});
		setQuantitiesBySize(next);
		setLocalError('');
	};

	const handleConfirmDraftItems = () => {
		if (!selectedProduct) {
			setLocalError('Vui lòng tìm và chọn sản phẩm.');
			return;
		}

		const normalizedImportPrice = Number(importPriceInput);
		if (!Number.isFinite(normalizedImportPrice) || normalizedImportPrice < 0) {
			setLocalError('Giá nhập không hợp lệ.');
			return;
		}

		const nextItems: DraftImportReceiptItem[] = sizes
			.map((size) => {
				const quantity = Number(quantitiesBySize[size.id] || 0);
				if (!Number.isFinite(quantity) || quantity <= 0) {
					return null;
				}

				return {
					productId: selectedProduct.id,
					productName: selectedProduct.name,
					sizeId: size.id,
					sizeName: size.name,
					quantity,
					importPrice: normalizedImportPrice,
				};
			})
			.filter((item): item is DraftImportReceiptItem => item !== null);

		if (nextItems.length === 0) {
			setLocalError('Vui lòng nhập số lượng > 0 cho ít nhất một size.');
			return;
		}

		onConfirmItems(nextItems);
		setLocalError('');
		setSelectedProduct(null);
		setSearchInput('');
		setSearchKeyword('');
		setProductResults([]);
		setImportPriceInput('');
		setQuantitiesBySize({});
	};

	return (
		<div className="space-y-4">
			{(error || localError) && (
				<div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					{localError || error}
				</div>
			)}

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<label className="text-sm text-slate-700">
					Nhà cung cấp <span className="text-red-500">*</span>
					<select
						value={selectedSupplierId ?? ''}
						onChange={(event) => {
							const rawValue = event.target.value;
							onSupplierChange(rawValue ? Number(rawValue) : null);
						}}
						className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
						disabled={isLoadingOptions}
					>
						<option value="">-- Chọn nhà cung cấp --</option>
						{suppliers.map((supplier) => (
							<option key={supplier.id} value={supplier.id}>
								{supplier.name} (ID: {supplier.id})
							</option>
						))}
					</select>
				</label>

				<label className="text-sm text-slate-700">
					Ghi chú
					<input
						type="text"
						value={note}
						onChange={(event) => onNoteChange(event.target.value)}
						placeholder="Ghi chú cho phiếu nhập"
						className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
					/>
				</label>
			</div>

			<div className="rounded-lg border border-slate-200 p-4 space-y-4">
				<h4 className="font-medium text-slate-800">Thêm sản phẩm vào phiếu nhập (lưu tạm)</h4>

				<form onSubmit={handleSearchSubmit} className="space-y-3">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
						<label className="text-sm text-slate-700">
							Tìm sản phẩm <span className="text-red-500">*</span>
							<input
								type="text"
								value={searchInput}
								onChange={(event) => {
									setSearchInput(event.target.value);
									setLocalError('');
								}}
								placeholder="Nhập tên sản phẩm, thương hiệu hoặc danh mục"
								className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
								disabled={isLoadingOptions || isSearchingProducts}
							/>
						</label>

						<button
							type="submit"
							disabled={isLoadingOptions || isSearchingProducts}
							className="mt-6 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSearchingProducts ? 'Đang tìm...' : 'Tìm sản phẩm'}
						</button>
					</div>
				</form>

				{searchKeyword && (
					<p className="text-xs text-slate-500">
						Kết quả cho: <span className="font-medium text-slate-700">{searchKeyword}</span>
					</p>
				)}

				{productResults.length > 0 ? (
					<div className="rounded border border-slate-200">
						<div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
							{productResults.map((product) => {
								const isSelected = selectedProduct?.id === product.id;
								return (
									<button
										key={product.id}
										type="button"
										onClick={() => handlePickProduct(product)}
										className={`flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-blue-50 ${
											isSelected ? 'bg-blue-50' : 'bg-white'
										}`}
									>
										<div>
											<p className="font-medium text-slate-800">{product.name}</p>
											<p className="text-xs text-slate-500">
												ID: {product.id}
												{product.brand ? ` • ${product.brand}` : ''}
												{product.category?.name ? ` • ${product.category.name}` : ''}
											</p>
										</div>
										<div className="text-right text-sm text-slate-600">
											<p>
												{typeof product.price === 'number'
													? `${new Intl.NumberFormat('vi-VN').format(product.price)}₫`
													: '-'}
											</p>
											{isSelected && <p className="text-xs font-medium text-blue-600">Đã chọn</p>}
										</div>
									</button>
								);
							})}
						</div>
					</div>
				) : searchKeyword ? (
					<div className="rounded border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">
						Không tìm thấy sản phẩm phù hợp.
					</div>
				) : null}

				{selectedProduct && (
					<div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
						Đã chọn: <span className="font-semibold">{selectedProduct.name}</span> (ID: {selectedProduct.id})
					</div>
				)}

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<label className="text-sm text-slate-700">
						Giá nhập <span className="text-red-500">*</span>
						<input
							type="number"
							min={0}
							step="1000"
							value={importPriceInput}
							onChange={(event) => {
								setImportPriceInput(event.target.value);
								setLocalError('');
							}}
							className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
							placeholder="Ví dụ: 250000"
							disabled={!selectedProduct}
						/>
					</label>

					<div className="text-sm text-slate-500 md:pt-7">
						{selectedProduct ? 'Nhập giá và số lượng sau khi đã chọn sản phẩm.' : 'Hãy tìm và chọn một sản phẩm trước.'}
					</div>
				</div>

				<div className="rounded border border-slate-200 p-3">
					<p className="mb-3 text-sm font-medium text-slate-700">Số lượng theo size</p>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
						{sizes.map((size) => (
							<label key={size.id} className="text-sm text-slate-700">
								{size.name}
								<input
									type="text"
									inputMode="numeric"
									value={quantitiesBySize[size.id] ?? ''}
									onChange={(event) => handleQuantityChange(size.id, event.target.value)}
									placeholder="0"
									className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
								/>
							</label>
						))}
					</div>
				</div>

				<div className="flex justify-end">
					<button
						type="button"
						onClick={handleConfirmDraftItems}
						disabled={!selectedProduct || isSearchingProducts}
						className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
					>
						Xác nhận sản phẩm
					</button>
				</div>
			</div>
		</div>
	);
};

export default ImportReceiptInput;
