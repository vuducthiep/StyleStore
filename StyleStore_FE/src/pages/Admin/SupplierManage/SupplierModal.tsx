import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { buildAuthHeaders } from '../../../services/auth';
import { useToast } from '../../../components/ToastProvider';
import type { AdminSupplier } from './SupplierTable';

interface SupplierModalProps {
	isOpen: boolean;
	supplier: AdminSupplier | null;
	onClose: () => void;
	onSuccess: () => void;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, supplier, onClose, onSuccess }) => {
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		email: '',
		address: '',
		status: 'ACTIVE',
		note: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');
	const { pushToast } = useToast();

	const isEdit = Boolean(supplier);

	useEffect(() => {
		if (supplier) {
			setFormData({
				name: supplier.name || '',
				phone: supplier.phone || '',
				email: supplier.email || '',
				address: supplier.address || '',
				status: supplier.status || 'ACTIVE',
				note: supplier.note || '',
			});
		} else {
			setFormData({
				name: '',
				phone: '',
				email: '',
				address: '',
				status: 'ACTIVE',
				note: '',
			});
		}
		setError('');
	}, [supplier, isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsSubmitting(true);

		try {
			const authHeaders = buildAuthHeaders();
			const url = isEdit
				? `http://localhost:8080/api/admin/suppliers/${supplier?.id}`
				: 'http://localhost:8080/api/admin/suppliers';

			const method = isEdit ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					...authHeaders,
				},
				body: JSON.stringify(formData),
			});

			const text = await res.text();
			const data = text ? JSON.parse(text) : {};
			if (!res.ok || !data.success) {
				throw new Error(data.message || 'Không thể lưu nhà cung cấp.');
			}

			pushToast(isEdit ? 'Cập nhật nhà cung cấp thành công' : 'Tạo nhà cung cấp thành công', 'success');
			onSuccess();
			onClose();
		} catch (err: unknown) {
			const message = (err as Error)?.message || 'Có lỗi xảy ra.';
			setError(message);
			pushToast(message, 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-6 border-b border-slate-200">
					<h2 className="text-2xl font-bold text-slate-800">
						{isEdit ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
					</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-slate-100 rounded-lg transition"
						type="button"
					>
						<X size={24} className="text-slate-600" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
							{error}
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-slate-700 mb-2">
								Tên nhà cung cấp <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								required
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Nhập tên nhà cung cấp"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
							<input
								type="text"
								value={formData.phone}
								onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Nhập số điện thoại"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
							<input
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Nhập email"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ</label>
							<input
								type="text"
								value={formData.address}
								onChange={(e) => setFormData({ ...formData, address: e.target.value })}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Nhập địa chỉ"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
							<select
								value={formData.status}
								onChange={(e) => setFormData({ ...formData, status: e.target.value })}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="ACTIVE">ACTIVE</option>
								<option value="INACTIVE">INACTIVE</option>
							</select>
						</div>

						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú</label>
							<textarea
								rows={3}
								value={formData.note}
								onChange={(e) => setFormData({ ...formData, note: e.target.value })}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Nhập ghi chú"
							/>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
							disabled={isSubmitting}
						>
							Hủy
						</button>
						<button
							type="submit"
							className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SupplierModal;
