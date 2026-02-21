import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { DashboardOutlined, UserOutlined, ShoppingOutlined, ShoppingCartOutlined, LogoutOutlined, AppstoreOutlined, MessageOutlined } from '@ant-design/icons';
import logo from '../../assets/Logo.jpg';

interface SidebarItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    const menuItems: SidebarItem[] = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardOutlined /> },
        { label: 'User Manager', path: '/admin/user-manager', icon: <UserOutlined /> },
        { label: 'Product Manager', path: '/admin/product-manager', icon: <ShoppingOutlined /> },
        { label: 'Category Manager', path: '/admin/category-manager', icon: <AppstoreOutlined /> },
        { label: 'Order Manager', path: '/admin/order-manager', icon: <ShoppingCartOutlined /> },
        { label: 'Hỗ trợ khách hàng', path: '/admin/support-chat', icon: <MessageOutlined /> },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden bg-blue-600 text-white p-2 rounded-lg"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'
                    } lg:w-64 overflow-y-auto z-40`}
            >
                {/* Logo */}
                <div className="flex items-center justify-center py-8 border-b border-gray-700">
                    {isOpen ? (
                        <div className="text-center">
                            <img src={logo} alt="StyleStore" className="mx-auto mb-2 h-24 w-24 rounded-full shadow-md" />

                            <p className="text-lg text-gray-400 mt-1">Admin Panel</p>
                        </div>
                    ) : (
                        <img src={logo} alt="SS" className="hidden lg:block h-10 w-10 rounded-full shadow-md" />
                    )}
                </div>

                {/* Menu Items */}
                <nav className="mt-8 space-y-4 px-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-800'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {isOpen && <span className="font-medium">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-8 left-4 right-4">
                    <button
                        onClick={() => {
                            // Logout logic
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg bg-red-700 hover:bg-red-800 transition-all duration-200 ${!isOpen ? 'justify-center' : ''
                            }`}
                    >
                        <LogoutOutlined className="text-xl" />
                        {isOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </div>

        </>
    );
};

export default Sidebar;
