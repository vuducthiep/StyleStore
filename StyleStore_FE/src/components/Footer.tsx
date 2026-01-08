import logo from '../assets/Logo.jpg';
import { Github, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700 text-slate-200">
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                <p className="text-center text-slate-300 text-sm">
                    This website is created by students for educational purposes.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <img src={logo} alt="StyleStore Logo" className="h-10 w-10 rounded-full mx-auto sm:mx-0 mb-2" />
                        <p className="text-sm font-semibold">StyleStore</p>
                        <p className="text-xs text-slate-400">Fashion &amp; Style mỗi ngày</p>
                    </div>

                    <div className="flex items-center gap-5 text-xs text-slate-300">
                        <a
                            href="https://github.com/vuducthiep"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:text-purple-200 transition-colors"
                            aria-label="GitHub"
                        >
                            <Github className="w-4 h-4" />
                            <span className="hidden sm:inline">GitHub</span>
                        </a>
                        <a
                            href="https://www.facebook.com/vdthiep"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:text-purple-200 transition-colors"
                            aria-label="Facebook"
                        >
                            <Facebook className="w-4 h-4" />
                            <span className="hidden sm:inline">Facebook</span>
                        </a>
                    </div>

                    <div className="text-xs text-slate-400 text-center sm:text-right">
                        © {new Date().getFullYear()} StyleStore. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
