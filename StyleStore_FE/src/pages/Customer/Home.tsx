import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/Header';
import Footer from '../../components/Footer';

const Home: React.FC = () => {
    return (
        <div>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-6">
                <div className="bg-white shadow-lg rounded-xl p-8 max-w-xl w-full text-center border border-slate-100">
                    <h1 className="text-3xl font-bold text-slate-800 mb-3">Chào mừng đến StyleStore</h1>

                    <div className="flex justify-center gap-4">
                        <Link
                            to="/admin/dashboard"
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                        >
                            Đi tới Dashboard
                        </Link>
                        <Link
                            to="/login"
                            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                        >
                            Đăng nhập lại
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
