import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuth2CallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const userId = searchParams.get('userId');
        const error = searchParams.get('error');

        if (error) {
            console.error('OAuth2 login failed:', error);
            navigate('/login?error=oauth2_failure');
            return;
        }

        if (token) {
            // Lưu token và user info
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({
                id: userId,
                email: email,
                fullName: name,
                role: 'USER',
            }));

            console.log('OAuth2 Login Success - Redirecting to home');
            navigate('/');
        } else {
            navigate('/login?error=invalid_callback');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang xử lý đăng nhập...</p>
            </div>
        </div>
    );
};

export default OAuth2CallbackPage;
