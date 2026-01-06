import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Admin/Sidebar';

const AdminLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 overflow-auto transition-all duration-300 w-full lg:pl-64">
                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;