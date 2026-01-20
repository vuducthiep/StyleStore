import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/Header';
import Footer from '../../../components/Footer';
import Banner from '../Home/Banner';
import Categories from '../Home/Categories';
import ListProduct from '../Home/ListProduct';
import type { Product } from '../Home/ListProduct';

interface ApiResponse {
    success: boolean;
    message: string;
    data: {
        content: Product[];
        totalPages: number;
        totalElements: number;
        currentPage: number;
        size: number;
    };
}

const Home: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const pageSize = 12;

    useEffect(() => {
        fetchProducts(currentPage, selectedCategoryId);
    }, [currentPage, selectedCategoryId]);

    const fetchProducts = async (page: number, categoryId: number | null) => {
        try {
            setLoading(true);
            const baseUrl = categoryId
                ? `http://localhost:8080/api/user/products/category/${categoryId}`
                : `http://localhost:8080/api/user/products`;

            const res = await fetch(`${baseUrl}?page=${page}&size=${pageSize}&sortBy=createdAt&sortDir=desc`);
            if (!res.ok) {
                throw new Error('Không thể lấy dữ liệu sản phẩm');
            }
            const data: ApiResponse = await res.json();
            setProducts(data.data.content);
            setTotalPages(data.data.totalPages);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage((prev) => prev + 1);
            window.scrollTo({ top: 380, behavior: 'smooth' });
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
            window.scrollTo({ top: 380, behavior: 'smooth' });
        }
    };

    const handleSelectCategory = (categoryId: number | null) => {
        setSelectedCategoryId(categoryId);
        setCurrentPage(0);
    };

    return (
        <div>
            <Header />
            <Banner />
            <Categories selectedCategoryId={selectedCategoryId} onSelect={handleSelectCategory} />
            <ListProduct
                products={products}
                loading={loading}
                error={error}
                currentPage={currentPage}
                totalPages={totalPages}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
            />
            <Footer />
        </div>
    );
};

export default Home;
