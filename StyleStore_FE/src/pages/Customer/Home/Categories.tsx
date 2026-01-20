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
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 py-8">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    Danh Mục Sản Phẩm
                </h2>

                <div className="flex flex-wrap justify-center gap-4">
                    {/* All categories button */}
                    <button
                        onClick={() => onSelect(null)}
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${selectedCategoryId === null
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                            }`}
                    >
                        Tất cả
                    </button>

                    {/* Category buttons */}
                    {categories.map((category) => (
                        <div key={category.id} className="relative group">
                            <button
                                onClick={() => handleCategoryClick(category.id)}
                                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${selectedCategoryId === category.id
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                                    }`}
                            >
                                {category.name}
                            </button>

                            {/* Tooltip */}
                            {category.description && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 pointer-events-none">
                                    {category.description}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
