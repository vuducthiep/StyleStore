import React, { useMemo, useState } from 'react';

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
	products: ProductOption[];
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
	products,
	selectedSupplierId,
	note,
	isLoadingOptions,
	error,
	onSupplierChange,
	onNoteChange,
	onConfirmItems,
}) => {
	const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
	const [importPriceInput, setImportPriceInput] = useState('');
	const [quantitiesBySize, setQuantitiesBySize] = useState<Record<number, string>>({});
	const [localError, setLocalError] = useState('');

	const selectedProduct = useMemo(
		() => products.find((product) => product.id === selectedProductId),
		[products, selectedProductId],
	);

	const handleQuantityChange = (sizeId: number, value: string) => {
		if (value === '' || /^\d+$/.test(value)) {
			setQuantitiesBySize((prev) => ({ ...prev, [sizeId]: value }));
			setLocalError('');
		}
	};

	const handleConfirmDraftItems = () => {
		if (!selectedProduct) {
			setLocalError('Vui lòng chọn sản phẩm.');
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
		setSelectedProductId(null);
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

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<label className="text-sm text-slate-700">
						Sản phẩm <span className="text-red-500">*</span>
						<select
							value={selectedProductId ?? ''}
							onChange={(event) => {
								const rawValue = event.target.value;
								const productId = rawValue ? Number(rawValue) : null;
								setSelectedProductId(productId);
								if (productId === null) {
									setImportPriceInput('');
									setQuantitiesBySize({});
								} else {
									const product = products.find((item) => item.id === productId);
									setImportPriceInput(
										typeof product?.price === 'number' ? String(product.price) : '',
									);
									const next: Record<number, string> = {};
									sizes.forEach((size) => {
										next[size.id] = '';
									});
									setQuantitiesBySize(next);
								}
								setLocalError('');
							}}
							className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
							disabled={isLoadingOptions}
						>
							<option value="">-- Chọn sản phẩm --</option>
							{products.map((product) => (
								<option key={product.id} value={product.id}>
									{product.name} (ID: {product.id})
								</option>
							))}
						</select>
					</label>

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
							className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
							placeholder="Ví dụ: 250000"
						/>
					</label>
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
