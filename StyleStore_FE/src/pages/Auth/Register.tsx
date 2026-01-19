import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/Logo.jpg';

interface RegisterFormData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
}

interface ApiResponse {
    message: string;
    success?: boolean;
}

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterFormData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const validateForm = (): boolean => {
        if (!formData.fullName.trim()) {
            setError('Vui lòng nhập họ tên');
            return false;
        }
        if (!formData.email.includes('@')) {
            setError('Email không hợp lệ');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return false;
        }
        if (!formData.phoneNumber.trim()) {
            setError('Vui lòng nhập số điện thoại');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:8080/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    phoneNumber: formData.phoneNumber,
                    gender: 'OTHER',
                }),
            });

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                setError(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
                return;
            }

            setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError('Lỗi kết nối. Vui lòng kiểm tra lại đường dẫn API.');
            console.error('Register error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
                <div className="absolute -top-24 -left-10 h-64 w-64 rounded-full bg-blue-500 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500 blur-3xl" />
            </div>
            <div className="w-full max-w-2xl px-4 py-10">
                {/* Card */}
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent" aria-hidden="true" />
                    <div className="relative p-8">
                        {/* Header */}
                        <div className="text-center mb-6 flex flex-col items-center gap-2">
                            <div className="p-[3px] bg-gradient-to-br from-blue-500 via-cyan-400 to-indigo-600 rounded-full shadow-lg">
                                <div className="rounded-full bg-white p-2">
                                    <img src={logo} alt="StyleStore" className="mx-auto h-20 w-20 rounded-full shadow-md" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-semibold text-slate-900">StyleStore</h1>
                            <p className="text-slate-200">Tạo tài khoản mới và bắt đầu hành trình mua sắm</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Success Alert */}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-700 text-sm">{success}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name Field */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-slate-200 mb-1">
                                    Họ và tên
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        id="fullName"
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Nguyễn Văn A"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/60 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/60 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                                    />
                                </div>
                            </div>

                            {/* Phone Number Field */}
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-200 mb-1">
                                    Số điện thoại
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        id="phoneNumber"
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="0912345678"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/60 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-12 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/60 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-1">
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-12 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/60 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Terms & Conditions */}
                            <label className="flex items-start">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-cyan-400 bg-white/10 border-white/30 rounded focus:ring-2 focus:ring-cyan-400 cursor-pointer mt-1"
                                    required
                                />
                                <span className="ml-2 text-sm text-slate-100">
                                    Tôi đồng ý với{' '}
                                    <a href="#" className="text-blue-600 hover:text-blue-700">
                                        điều khoản dịch vụ
                                    </a>{' '}
                                    và{' '}
                                    <a href="#" className="text-blue-600 hover:text-blue-700">
                                        chính sách bảo mật
                                    </a>
                                </span>
                            </label>

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-4 py-3 text-white font-semibold shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:opacity-70 disabled:hover:scale-100"
                            >
                                <span className="absolute inset-0 bg-white/10 blur opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <p className="text-center mt-6 text-slate-100">
                            Đã có tài khoản?{' '}
                            <button
                                onClick={handleLoginClick}
                                className="font-semibold text-cyan-200 hover:text-white underline decoration-dotted"
                            >
                                Đăng nhập ngay
                            </button>
                        </p>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default Register;
