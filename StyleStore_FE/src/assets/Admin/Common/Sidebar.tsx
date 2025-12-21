import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface SidebarItem {
    label: string;
    path: string;
    icon: string;
}

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    const menuItems: SidebarItem[] = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { label: 'User Manager', path: '/admin/user-manager', icon: '👥' },
        { label: 'Product Manager', path: '/admin/product-manager', icon: '📦' },
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
                className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-700 to-blue-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'
                    } lg:w-64 overflow-y-auto z-40`}
            >
                {/* Logo */}
                <div className="flex items-center justify-center py-8 border-b border-blue-600">
                    <div className={`text-center ${isOpen ? '' : 'hidden lg:block'}`}>
                        <h2 className="text-2xl font-bold">StyleStore</h2>
                        <p className="text-xs text-blue-200 mt-1">Admin Panel</p>
                    </div>
                    {!isOpen && <span className="text-2xl hidden lg:block">SS</span>}
                </div>

                {/* Menu Items */}
                <nav className="mt-8 space-y-4 px-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                                ? 'bg-white text-blue-700 shadow-lg'
                                : 'text-white hover:bg-blue-600'
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
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-200 ${!isOpen ? 'justify-center' : ''
                            }`}
                    >
                        <span className="text-xl">🚪</span>
                        {isOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </div>

        </>
    );
};

export default Sidebar;
