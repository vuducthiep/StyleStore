import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ListProduct from '../Home/ListProduct';
import type { Product } from '../Home/ListProduct';

const API_BASE_URL = 'http://localhost:8080/api/user/products';

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const keyword = searchParams.get('q') || '';
    const PAGE_SIZE = 12;

    useEffect(() => {
        if (!keyword.trim()) {
            setError('Vui lòng nhập từ khóa tìm kiếm');
            setLoading(false);
            return;
        }

        const fetchSearchResults = async () => {
            try {
                setLoading(true);
                setError(null);

                const url = `${API_BASE_URL}/search/${encodeURIComponent(keyword)}?page=${currentPage}&size=${PAGE_SIZE}`;
                console.log('Fetching from:', url);

                const response = await fetch(url);

                if (!response.ok) {
                    console.error('Response status:', response.status);
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const data = await response.json();
                console.log('API Response:', data);

                // Xử lý response từ API - API trả về {success, message, data: {content, totalPages, ...}}
                if (data && data.data && data.data.content && Array.isArray(data.data.content)) {
                    console.log('Using data.data.content:', data.data.content);
                    setProducts(data.data.content);
                    setTotalPages(data.data.totalPages || 1);
                } else if (data && data.content && Array.isArray(data.content)) {
                    console.log('Using data.content:', data.content);
                    setProducts(data.content);
                    setTotalPages(data.totalPages || 1);
                } else if (Array.isArray(data)) {
                    console.log('Using data directly:', data);
                    setProducts(data);
                    setTotalPages(1);
                } else {
                    console.log('No valid data found');
                    setProducts([]);
                    setTotalPages(0);
                }
            } catch (err) {
                console.error('Error searching products:', err);
                setError('Không thể tìm kiếm sản phẩm. Vui lòng thử lại sau.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [keyword, currentPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-900">
            <Header />

            <main className="flex-1">
                {/* Search Header */}
                <div className="bg-slate-800 border-b border-slate-700 py-6 px-4 mb-8">
                    <div className="max-w-7xl mx-auto">

                        <div className="flex items-center justify-between mb-4">

                            <h1 className="text-3xl font-bold text-white">
                                Kết quả tìm kiếm
                            </h1>

                        </div>
                        <p className="text-slate-300">
                            Tìm kiếm cho: <span className="font-semibold text-purple-300">"{keyword}"</span>
                            {!loading && products.length > 0 && (
                                <span className="ml-3 text-slate-400">
                                    ({products.length} kết quả)
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Product List */}
                <ListProduct
                    products={products}
                    loading={loading}
                    error={error}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onNextPage={handleNextPage}
                    onPrevPage={handlePrevPage}
                />
            </main>

            <Footer />
        </div>
    );
}
