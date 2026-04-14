import React from 'react';
import type { DraftImportReceiptItem } from './ImportReceiptInput';

interface ImportReceiptIItemsProps {
	items: DraftImportReceiptItem[];
	onRemoveItem: (productId: number, sizeId: number) => void;
}

const ImportReceiptIItems: React.FC<ImportReceiptIItemsProps> = ({ items, onRemoveItem }) => {
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount || 0);
	};

	const grandTotal = items.reduce((sum, item) => sum + item.importPrice * item.quantity, 0);

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h4 className="text-base font-semibold text-slate-800">Danh sách sản phẩm tạm lưu</h4>
				<span className="text-sm text-slate-500">{items.length} dòng</span>
			</div>

			{items.length === 0 ? (
				<div className="rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
					Chưa có sản phẩm tạm lưu. Hãy chọn sản phẩm, nhập số lượng theo size và bấm "Xác nhận sản phẩm".
				</div>
			) : (
				<div className="overflow-x-auto rounded border border-slate-200">
					<table className="min-w-full text-sm">
						<thead className="bg-slate-50 text-slate-600">
							<tr>
								<th className="px-3 py-2 text-left">Sản phẩm</th>
								<th className="px-3 py-2 text-center">Size</th>
								<th className="px-3 py-2 text-center">Số lượng</th>
								<th className="px-3 py-2 text-right">Giá nhập</th>
								<th className="px-3 py-2 text-right">Thành tiền</th>
								<th className="px-3 py-2 text-center">Thao tác</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{items.map((item) => {
								const subtotal = item.importPrice * item.quantity;
								return (
									<tr key={`${item.productId}-${item.sizeId}`} className="hover:bg-slate-50">
										<td className="px-3 py-2">
											<p className="font-medium text-slate-800">{item.productName}</p>
											<p className="text-xs text-slate-500">ID: {item.productId}</p>
										</td>
										<td className="px-3 py-2 text-center">{item.sizeName}</td>
										<td className="px-3 py-2 text-center">{item.quantity}</td>
										<td className="px-3 py-2 text-right">{formatCurrency(item.importPrice)}</td>
										<td className="px-3 py-2 text-right font-semibold text-blue-700">{formatCurrency(subtotal)}</td>
										<td className="px-3 py-2 text-center">
											<button
												type="button"
												onClick={() => onRemoveItem(item.productId, item.sizeId)}
												className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
											>
												Xóa
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
						<tfoot className="bg-slate-50 text-slate-800">
							<tr>
								<td colSpan={4} className="px-3 py-2 text-right font-semibold">Tổng cộng:</td>
								<td className="px-3 py-2 text-right font-bold text-blue-700">{formatCurrency(grandTotal)}</td>
								<td className="px-3 py-2" />
							</tr>
						</tfoot>
					</table>
				</div>
			)}
		</div>
	);
};

export default ImportReceiptIItems;
