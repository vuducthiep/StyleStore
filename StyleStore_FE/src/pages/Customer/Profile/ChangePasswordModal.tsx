import { useState } from "react";
import { Eye, EyeOff, Lock, X } from "lucide-react";
import { useToast } from "../../../components/ToastProvider";

interface ChangePasswordModalProps {
	open: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

interface ChangePasswordResponse {
	success: boolean;
	message: string;
	data: null;
}

export default function ChangePasswordModal({ open, onClose, onSuccess }: ChangePasswordModalProps) {
	const { pushToast } = useToast();
	const [formData, setFormData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	if (!open) return null;

	const resetForm = () => {
		setFormData({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
		setError(null);
		setShowCurrentPassword(false);
		setShowNewPassword(false);
		setShowConfirmPassword(false);
	};

	const handleClose = () => {
		if (!submitting) {
			resetForm();
			onClose();
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
			setError("Vui lòng nhập đầy đủ thông tin");
			return;
		}

		if (formData.newPassword.length < 6) {
			setError("Mật khẩu mới phải ít nhất 6 ký tự");
			return;
		}

		if (formData.newPassword !== formData.confirmPassword) {
			setError("Xác nhận mật khẩu không khớp");
			return;
		}

		try {
			setSubmitting(true);
			const response = await fetch("http://localhost:8080/api/user/profile/change-password", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify(formData),
			});

			const result: ChangePasswordResponse = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || "Đổi mật khẩu thất bại");
			}

			pushToast(result.message || "Đổi mật khẩu thành công", "success");
			resetForm();
			onClose();
			onSuccess?.();
		} catch (err) {
			const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
			setError(message);
			pushToast(message, "error");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
			<div className="w-full max-w-md rounded-lg bg-white shadow-lg border border-slate-200">
				<div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-slate-900">Đổi mật khẩu</h3>
					<button
						type="button"
						onClick={handleClose}
						disabled={submitting}
						className="text-slate-500 hover:text-slate-700 disabled:opacity-60"
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu hiện tại</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
								<Lock size={16} />
							</span>
							<input
								type={showCurrentPassword ? "text" : "password"}
								name="currentPassword"
								value={formData.currentPassword}
								onChange={handleInputChange}
								className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								placeholder="Nhập mật khẩu hiện tại"
							/>
							<button
								type="button"
								onClick={() => setShowCurrentPassword((prev) => !prev)}
								className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
							>
								{showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
								<Lock size={16} />
							</span>
							<input
								type={showNewPassword ? "text" : "password"}
								name="newPassword"
								value={formData.newPassword}
								onChange={handleInputChange}
								className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								placeholder="Nhập mật khẩu mới"
							/>
							<button
								type="button"
								onClick={() => setShowNewPassword((prev) => !prev)}
								className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
							>
								{showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
								<Lock size={16} />
							</span>
							<input
								type={showConfirmPassword ? "text" : "password"}
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleInputChange}
								className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								placeholder="Nhập lại mật khẩu mới"
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword((prev) => !prev)}
								className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
							>
								{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</div>

					{error && (
						<p className="text-sm text-red-600">{error}</p>
					)}

					<div className="pt-2 flex justify-end gap-2">
						<button
							type="button"
							onClick={handleClose}
							disabled={submitting}
							className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
						>
							Hủy
						</button>
						<button
							type="submit"
							disabled={submitting}
							className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
						>
							{submitting ? "Đang xử lý..." : "Xác nhận"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
