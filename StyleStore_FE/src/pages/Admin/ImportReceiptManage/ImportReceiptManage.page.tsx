import React, { useState } from 'react';
import ImportReceiptTable, { type AdminImportReceipt } from './ImportReceiptTable';
import ImportReceiptDetailModal from './ImportReceiptDetailModal';
import ImportReceiptModal from './ImportReceiptModal/ImportReceiptModal';

const ImportReceiptManage: React.FC = () => {
	const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
	const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	const handleViewDetail = (receipt: AdminImportReceipt) => {
		setSelectedReceiptId(receipt.id);
	};

	const handleCloseDetailModal = () => {
		setSelectedReceiptId(null);
	};

	const handleImportSaved = () => {
		setRefreshKey((prev) => prev + 1);
	};

	return (
		<div className="p-6 w-full">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-800">Quản lý phiếu nhập</h1>
					<p className="text-slate-500 text-sm">Xem danh sách phiếu nhập và theo dõi trạng thái nhập kho.</p>
				</div>
				<button
					type="button"
					onClick={() => setIsImportDialogOpen(true)}
					className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
				>
					+ Nhập sản phẩm
				</button>
			</div>

			<ImportReceiptTable refreshKey={refreshKey} onViewDetail={handleViewDetail} />

			<ImportReceiptModal
				isOpen={isImportDialogOpen}
				onClose={() => setIsImportDialogOpen(false)}
				onSaved={handleImportSaved}
			/>

			<ImportReceiptDetailModal
				isOpen={selectedReceiptId !== null}
				receiptId={selectedReceiptId}
				onClose={handleCloseDetailModal}
			/>
		</div>
	);
};

export default ImportReceiptManage;
