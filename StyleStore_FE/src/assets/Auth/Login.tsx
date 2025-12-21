import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormData {
    email: string;
    password: string;
}

interface ApiResponse {
    message: string;
    token?: string;
    user?: {
        id: number;
        email: string;
        fullName: string;
        role: string;
    };
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const raw = await response.text();
            const data: ApiResponse = raw ? JSON.parse(raw) : ({} as ApiResponse);

            if (!response.ok) {
                // 401/403 thường do sai email hoặc mật khẩu hoặc bị chặn bảo mật
                const fallbackMsg = response.status === 401 || response.status === 403
                    ? 'Email hoặc mật khẩu không đúng.'
                    : 'Đăng nhập thất bại. Vui lòng thử lại.';
                setError(data?.message || fallbackMsg);
                return;
            }

            // Save token to localStorage
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirect based on user role
            if (data.user?.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Lỗi kết nối. Vui lòng kiểm tra lại đường dẫn API.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUpClick = () => {
        navigate('/signup');
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-md px-4">
                {/* Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">StyleStore</h1>
                        <p className="text-gray-600">Đăng nhập để tiếp tục</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="ml-2 text-sm text-gray-600">Nhớ mật khẩu</span>
                            </label>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Quên mật khẩu?
                            </a>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-gray-500 text-sm">Hoặc</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <span className="text-lg">f</span>
                            <span className="ml-2 text-sm font-medium text-gray-700">Facebook</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <span className="text-lg">G</span>
                            <span className="ml-2 text-sm font-medium text-gray-700">Google</span>
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center mt-6 text-gray-600">
                        Chưa có tài khoản?{' '}
                        <button
                            onClick={handleSignUpClick}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Đăng ký ngay
                        </button>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-gray-500 text-sm">
                    © 2024 StyleStore. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
