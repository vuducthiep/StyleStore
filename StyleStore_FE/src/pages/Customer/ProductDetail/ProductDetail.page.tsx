import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingCart, Check } from "lucide-react";
import Header from "../../../components/Header";
import Comments from "./Comments";
interface Size {
    id: number;
    name: string;
}

interface ProductSize {
    id: number;
    size: Size;
    stock: number;
}

interface Category {
    id: number;
    name: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    gender: string;
    brand: string;
    price: number;
    thumbnail: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    category: Category;
    productSizes: ProductSize[];
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: Product;
}

// interface CartItem {
//     productId: number;
//     productName: string;
//     price: number;
//     selectedSize: string;
//     quantity: number;
//     thumbnail: string;
// }

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProduct(parseInt(id));
        }
    }, [id]);

    const fetchProduct = async (productId: number) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/api/user/products/${productId}`);

            if (!response.ok) {
                throw new Error("Không thể lấy dữ liệu sản phẩm");
            }

            const data: ApiResponse = await response.json();
            setProduct(data.data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
            console.error("Error fetching product:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const handleAddToCart = async () => {
        if (!selectedSize) {
            alert("Vui lòng chọn size");
            return;
        }

        if (!product) return;

        try {
            // Lấy Size.id từ ProductSize (selectedSize là ProductSize.id)
            const selectedProductSize = product.productSizes.find(ps => ps.id === selectedSize);
            if (!selectedProductSize) {
                throw new Error("Size không hợp lệ");
            }

            const sizeId = selectedProductSize.size.id;

            // Gọi API thêm vào giỏ hàng
            const params = new URLSearchParams({
                productId: product.id.toString(),
                sizeId: sizeId.toString(),
                quantity: quantity.toString(),
            });

            const response = await fetch(
                `http://localhost:8080/api/user/cart/add?${params.toString()}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Lỗi khi thêm vào giỏ hàng");
            }

            setAddedToCart(true);

            // Reset sau 2 giây
            setTimeout(() => {
                setAddedToCart(false);
                setSelectedSize(null);
                setQuantity(1);
            }, 2000);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Có lỗi xảy ra");
            console.error("Error adding to cart:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 text-lg font-semibold mb-4">{error || "Không tìm thấy sản phẩm"}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const availableSizes = product.productSizes.filter(ps => ps.stock > 0);

    return (


        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            < Header />
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
                    >
                        <ChevronLeft size={20} />
                        Quay lại
                    </button>
                </div>
            </div>


            {/* Product Detail */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-full aspect-square bg-gray-200 rounded-lg overflow-hidden">
                            <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            {product.status === "ACTIVE" && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-semibold">
                                    Có sẵn
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col justify-center">
                        {/* Breadcrumb */}
                        <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide mb-2">
                            {product.category.name}
                        </p>

                        {/* Product Name */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                        {/* Brand & Gender */}
                        <div className="flex gap-4 mb-6">
                            <div>
                                <p className="text-xs text-gray-600 uppercase">Thương hiệu</p>
                                <p className="text-lg font-semibold text-gray-900">{product.brand?.toUpperCase() || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase">Giới tính</p>
                                <p className="text-lg font-semibold text-gray-900">{product.gender}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-lg mb-6">{product.description}</p>

                        {/* Price */}
                        <div className="text-4xl font-bold text-blue-600 mb-8">
                            {formatPrice(product.price)}
                        </div>

                        {/* Size Selection */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn Size</h3>
                            {availableSizes.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {availableSizes.map((ps) => (
                                        <button
                                            key={ps.id}
                                            onClick={() => setSelectedSize(ps.id)}
                                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${selectedSize === ps.id
                                                ? "bg-blue-600 text-white scale-105"
                                                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                                }`}
                                        >
                                            {ps.size.name} ({ps.stock})
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-red-500 font-semibold">Sản phẩm này hiện không có size khả dụng</p>
                            )}
                        </div>

                        {/* Quantity Selection */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Số lượng</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
                                >
                                    −
                                </button>
                                <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={availableSizes.length === 0 || addedToCart}
                            className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${addedToCart
                                ? "bg-green-500 text-white"
                                : availableSizes.length === 0
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                                }`}
                        >
                            {addedToCart ? (
                                <>
                                    <Check size={20} />
                                    Đã thêm vào giỏ
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={20} />
                                    Thêm vào giỏ hàng
                                </>
                            )}
                        </button>

                        {/* Product Info */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin sản phẩm</h3>
                            <div className="space-y-3 text-gray-700">
                                <p><span className="font-semibold">Danh mục:</span> {product.category.name}</p>
                                <p><span className="font-semibold">Thương hiệu:</span> {product.brand || "Chưa xác định"}</p>
                                <p><span className="font-semibold">Giới tính:</span> {product.gender}</p>
                                <p><span className="font-semibold">Trạng thái:</span> {product.status === "ACTIVE" ? "Có sẵn" : "Hết hàng"}</p>
                                <p><span className="font-semibold">Ngày tạo:</span> {new Date(product.createdAt).toLocaleDateString("vi-VN")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* cmt */}
            <Comments productId={product.id} />
        </div>
    );
}
