import React, { useEffect, useMemo, useState } from 'react';
import type { AdminUser } from './UserTable';

interface UserModalProps {
	isOpen: boolean;
	userId: number | null;
	onClose: () => void;
	onSaved?: () => void;
}

interface UserForm {
	fullName: string;
	email: string;
	phoneNumber?: string;
	role?: string;
	status?: string;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, userId, onClose, onSaved }) => {
	const [form, setForm] = useState<UserForm>({ fullName: '', email: '', phoneNumber: '', role: 'USER', status: 'ACTIVE' });
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState('');

	const token = useMemo(() => localStorage.getItem('token'), []);

	useEffect(() => {
		if (!isOpen || !userId) return;
		if (!token) {
			setError('Bạn chưa đăng nhập hoặc thiếu token.');
			return;
		}
		const fetchDetail = async () => {
			setIsLoading(true);
			setError('');
			try {
				const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				});
				if (!res.ok) {
					const text = await res.text();
					const data = text ? JSON.parse(text) : {};
					const message = data.message || `Không tải được thông tin người dùng (code ${res.status}).`;
					setError(message);
					return;
				}
				const data: AdminUser = await res.json();
				setForm({
					fullName: data.fullName || '',
					email: data.email || '',
					phoneNumber: data.phoneNumber || '',
					role: data.role || 'USER',
					status: data.status || 'ACTIVE',
				});
			} catch (e) {
				console.error('Fetch user detail error:', e);
				setError('Không thể kết nối máy chủ.');
			} finally {
				setIsLoading(false);
			}
		};
		fetchDetail();
	}, [isOpen, userId, token]);

	const handleChange = (key: keyof UserForm, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = async () => {
		if (!userId || !token) return;
		setIsSaving(true);
		setError('');
		try {
			const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(form),
			});
			if (!res.ok) {
				const text = await res.text();
				const data = text ? JSON.parse(text) : {};
				const message = data.message || `Cập nhật thất bại (code ${res.status}).`;
				setError(message);
				return;
			}
			onSaved?.();
			onClose();
		} catch (e) {
			console.error('Update user error:', e);
			setError('Không thể kết nối máy chủ.');
		} finally {
			setIsSaving(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
			<div className="w-full max-w-lg rounded-xl bg-white shadow-lg border border-slate-200">
				<div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
					<div>
						<h3 className="text-lg font-semibold text-slate-900">Chỉnh sửa người dùng</h3>
						{userId && <p className="text-xs text-slate-500">ID: {userId}</p>}
					</div>
					<button onClick={onClose} className="text-slate-500 hover:text-slate-700">
						✕
					</button>
				</div>

				<div className="px-5 py-4 space-y-4">
					{error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</div>}
					{isLoading ? (
						<div className="text-sm text-slate-600">Đang tải thông tin người dùng...</div>
					) : (
						<>
							<div className="grid grid-cols-1 gap-4">
								<label className="text-sm text-slate-700">
									Họ tên
									<input
										type="text"
										className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
										value={form.fullName}
										onChange={(e) => handleChange('fullName', e.target.value)}
									/>
								</label>
								<label className="text-sm text-slate-700">
									Email
									<input
										type="email"
										className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
										value={form.email}
										onChange={(e) => handleChange('email', e.target.value)}
									/>
								</label>
								<label className="text-sm text-slate-700">
									SĐT
									<input
										type="text"
										className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
										value={form.phoneNumber || ''}
										onChange={(e) => handleChange('phoneNumber', e.target.value)}
									/>
								</label>
								<div className="grid grid-cols-2 gap-4">
									<label className="text-sm text-slate-700">
										Role
										<select
											className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
											value={form.role}
											onChange={(e) => handleChange('role', e.target.value)}
										>
											<option value="ADMIN">ADMIN</option>
											<option value="USER">USER</option>
										</select>
									</label>
									<label className="text-sm text-slate-700">
										Trạng thái
										<select
											className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
											value={form.status}
											onChange={(e) => handleChange('status', e.target.value)}
										>
											<option value="ACTIVE">ACTIVE</option>
											<option value="INACTIVE">INACTIVE</option>
										</select>
									</label>
								</div>
							</div>
						</>
					)}
				</div>

				<div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-white transition"
						disabled={isSaving}
					>
						Hủy
					</button>
					<button
						onClick={handleSave}
						className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
						disabled={isSaving || isLoading}
					>
						{isSaving ? 'Đang lưu...' : 'Lưu'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default UserModal;