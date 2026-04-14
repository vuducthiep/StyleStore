import React, { useState } from 'react';
import SupplierTable, { type AdminSupplier } from './SupplierTable';
import SupplierModal from './SupplierModal';

const SupplierManagePage: React.FC = () => {
	const [refreshKey, setRefreshKey] = useState(0);
	const [selectedSupplier, setSelectedSupplier] = useState<AdminSupplier | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleEdit = (supplier: AdminSupplier) => {
		setSelectedSupplier(supplier);
		setIsModalOpen(true);
	};

	const handleCreate = () => {
		setSelectedSupplier(null);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedSupplier(null);
	};

	const handleSuccess = () => {
		setRefreshKey((prev) => prev + 1);
	};

	return (
		<div className="min-h-screen bg-slate-50 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-slate-800">Quản lý nhà cung cấp</h1>
							<p className="text-slate-600 mt-2">Theo dõi và cập nhật thông tin nhà cung cấp</p>
						</div>
						<button
							onClick={handleCreate}
							className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
						>
							+ Thêm nhà cung cấp
						</button>
					</div>
				</div>

				<SupplierTable refreshKey={refreshKey} onEdit={handleEdit} />

				<SupplierModal
					isOpen={isModalOpen}
					supplier={selectedSupplier}
					onClose={handleCloseModal}
					onSuccess={handleSuccess}
				/>
			</div>
		</div>
	);
};

export default SupplierManagePage;
