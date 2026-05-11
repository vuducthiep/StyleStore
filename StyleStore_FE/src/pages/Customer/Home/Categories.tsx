import { useState, useEffect } from "react";

export interface Category {
    id: number;
    name: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: Category[];
}

type CategoriesProps = {
    selectedCategoryId: number | null;
    onSelect: (categoryId: number | null) => void;
};

export default function Categories({ selectedCategoryId, onSelect }: CategoriesProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:8080/api/user/categories", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error("Không thể lấy dữ liệu danh mục");
            }

            const result: ApiResponse = await response.json();
            if (result.success) {
                setCategories(result.data);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (categoryId: number) => {
        const next = categoryId === selectedCategoryId ? null : categoryId;
        onSelect(next);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white py-12 border-b border-gray-200">
            <style>{`
                @keyframes categorySlideIn {
                    0% {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .category-btn {
                    animation: categorySlideIn 0.5s ease-out;
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Danh Mục Sản Phẩm
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base">
                        Tìm kiếm sản phẩm yêu thích của bạn
                    </p>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                    {/* All categories button */}
                    <button
                        onClick={() => onSelect(null)}
                        className={`category-btn px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm md:text-base whitespace-nowrap ${
                            selectedCategoryId === null
                                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                        }`}
                    >
                        ✓ Tất Cả Sản Phẩm
                    </button>

                    {/* Category buttons */}
                    {categories.map((category, index) => (
                        <div key={category.id} className="relative group" style={{ animationDelay: `${(index + 1) * 50}ms` }}>
                            <button
                                onClick={() => handleCategoryClick(category.id)}
                                className={`category-btn px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm md:text-base whitespace-nowrap ${
                                    selectedCategoryId === category.id
                                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                                }`}
                            >
                                {category.name}
                            </button>

                            {/* Tooltip for description */}
                            {category.description && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-gray-900 text-white text-xs md:text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-20 pointer-events-none shadow-lg">
                                    {category.description}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
