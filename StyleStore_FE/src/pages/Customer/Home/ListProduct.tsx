
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Size {
    id: number;
    name: string;
}

export interface ProductSize {
    id: number;
    size: Size;
    stock: number;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    gender: string;
    brand: string;
    material?: string;
    color?: string;
    price: number;
    thumbnail: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    category: Category;
    productSizes: ProductSize[];
}
export type ListProductProps = {
    products: Product[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    onNextPage: () => void;
    onPrevPage: () => void;
};

export default function ListProduct({
    products,
    loading,
    error,
    currentPage,
    totalPages,
    onNextPage,
    onPrevPage,
}: ListProductProps) {
    const navigate = useNavigate();
    const [sortByPrice, setSortByPrice] = useState<"default" | "asc" | "desc">("default");
    const productCardRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const [visibleProducts, setVisibleProducts] = useState<Set<number>>(new Set());

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const sortedProducts = useMemo(() => {
        const data = [...products];

        if (sortByPrice === "asc") {
            return data.sort((a, b) => a.price - b.price);
        }

        if (sortByPrice === "desc") {
            return data.sort((a, b) => b.price - a.price);
        }

        return data;
    }, [products, sortByPrice]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const productId = Number((entry.target as HTMLElement).dataset.productId);

                    setVisibleProducts((current) => {
                        if (current.has(productId)) {
                            return current;
                        }

                        const next = new Set(current);
                        next.add(productId);
                        return next;
                    });
                });
            },
            {
                threshold: 0,
                rootMargin: "0px 0px 50px 0px",
            }
        );

        sortedProducts.forEach((product) => {
            const element = productCardRefs.current[product.id];

            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [sortedProducts]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-red-500 text-lg font-semibold mb-2">{error}</p>
                    <p className="text-gray-600">Vui lòng thử lại sau</p>
                </div>
            </div>
        );
    }


    return (
        <div className="w-full py-16 px-4 relative overflow-hidden min-h-screen bg-white">
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shimmer {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                .animate-slide-up {
                    animation: slideUp 0.6s ease-out;
                }

                .product-card {
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .product-card:hover {
                    transform: translateY(-8px);
                }

                .product-image-wrapper {
                    position: relative;
                    overflow: hidden;
                    background-color: #f5f5f5;
                }

                .product-image {
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    will-change: transform;
                }

                .product-card:hover .product-image {
                    transform: scale(1.08);
                }

                .product-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    padding: 6px 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    z-index: 10;
                }

                .size-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px 10px;
                    border-radius: 6px;
                    border: 1px solid #e5e7eb;
                    background-color: #f9fafb;
                    font-size: 12px;
                    font-weight: 500;
                    color: #374151;
                    transition: all 0.2s ease;
                }

                .size-badge:hover {
                    border-color: #667eea;
                    background-color: #f0f4ff;
                    color: #667eea;
                }
            `}</style>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="mb-12 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                        Bộ Sưu Tập Mới
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Khám phá những mẫu thiết kế đẹp mắt và xu hướng thời trang mới nhất
                    </p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center min-h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Sorting */}
                        <div className="flex justify-end mb-8">
                            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <label htmlFor="price-sort" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                                    Sắp xếp theo giá:
                                </label>
                                <div className="relative">
                                    <select
                                        id="price-sort"
                                        value={sortByPrice}
                                        onChange={(e) => setSortByPrice(e.target.value as "default" | "asc" | "desc")}
                                        className="appearance-none min-w-40 pl-3 pr-8 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors cursor-pointer"
                                    >
                                        <option value="default">Mặc định</option>
                                        <option value="asc">Thấp đến cao</option>
                                        <option value="desc">Cao đến thấp</option>
                                    </select>
                                    <ChevronRight
                                        size={16}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                            {sortedProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    ref={(node) => {
                                        productCardRefs.current[product.id] = node;
                                    }}
                                    data-product-id={product.id}
                                    className={`product-card bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full ${
                                        visibleProducts.has(product.id)
                                            ? "opacity-100 translate-y-0"
                                            : "opacity-0 translate-y-4"
                                    }`}
                                    style={{
                                        transitionDelay: `${Math.min(index, 11) * 50}ms`,
                                    }}
                                >
                                    {/* Product Image Container */}
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        className="product-image-wrapper relative w-full h-72 cursor-pointer text-left"
                                        aria-label={`Xem chi tiết sản phẩm ${product.name}`}
                                    >
                                        <img
                                            src={product.thumbnail}
                                            alt={product.name}
                                            className="product-image w-full h-full object-cover"
                                        />
                                        {/* NEW Badge */}
                                        <div className="product-badge">
                                            MỚI
                                        </div>
                                    </button>

                                    {/* Product Info */}
                                    <div className="p-5 flex flex-col flex-1">
                                        {/* Category Badge */}
                                        <span className="inline-block w-fit text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3 bg-purple-50 px-3 py-1 rounded-full">
                                            {product.category.name}
                                        </span>

                                        {/* Product Name */}
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 h-10 group-hover:text-purple-600 transition-colors flex-grow">
                                            {product.name}
                                        </h3>

                                        {/* Brand & Details */}
                                        <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                                            <span className="font-medium text-gray-700">{product.brand?.toUpperCase() || "N/A"}</span>
                                            <span className="text-gray-600">{product.gender || "---"}</span>
                                        </div>

                                        {/* Sizes */}
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">Size có sẵn:</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {product.productSizes
                                                    .filter((ps) => ps.stock > 0)
                                                    .slice(0, 3)
                                                    .map((ps) => (
                                                        <span key={ps.id} className="size-badge">
                                                            {ps.size.name}
                                                        </span>
                                                    ))}
                                                {product.productSizes.filter((ps) => ps.stock > 0).length > 3 && (
                                                    <span className="size-badge">
                                                        +{product.productSizes.filter((ps) => ps.stock > 0).length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price & CTA */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                            <div className="text-xl font-bold text-purple-600">
                                                {formatPrice(product.price)}
                                            </div>
                                            <button
                                                onClick={() => navigate(`/product/${product.id}`)}
                                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm"
                                            >
                                                Xem
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-6 mt-16 py-8">
                                <button
                                    onClick={onPrevPage}
                                    disabled={currentPage === 0}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-purple-600 hover:text-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                                >
                                    <ChevronLeft size={20} />
                                    Trang Trước
                                </button>

                                {/* Page Info */}
                                <div className="text-center">
                                    <p className="text-gray-600 font-medium text-sm">Trang</p>
                                    <p className="text-purple-600 font-bold text-2xl">{currentPage + 1}</p>
                                    <p className="text-gray-600 font-medium text-sm">của {totalPages}</p>
                                </div>

                                <button
                                    onClick={onNextPage}
                                    disabled={currentPage >= totalPages - 1}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
                                >
                                    Trang Sau
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}

                        {/* No Products Message */}
                        {sortedProducts.length === 0 && !loading && (
                            <div className="text-center py-20">
                                <p className="text-gray-500 text-xl font-medium">Không có sản phẩm để hiển thị</p>
                                <p className="text-gray-400 text-sm mt-2">Hãy thử lựa chọn danh mục khác</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
