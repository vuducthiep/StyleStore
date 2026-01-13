import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, MapPin } from "lucide-react";
import Header from "../../../components/Header";
import vietnamAddressData from "../../../vietnamAddress.json";

interface Province {
    Id: string;
    Name: string;
    Districts: District[];
}

interface District {
    Id: string;
    Name: string;
    Wards: Ward[];
}

interface Ward {
    Id: string;
    Name: string;
    Level?: string;
}

interface UserProfile {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    address: string;
    role: string;
    status: string;
    createdAt: string;
}

interface UserProfileResponse {
    success: boolean;
    message: string;
    data: UserProfile;
}

interface Size {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    thumbnail: string;
}

interface CartItem {
    id: number;
    product: Product;
    size: Size;
    quantity: number;
    price: number;
}

interface Cart {
    id: number;
    cartItems: CartItem[];
    totalPrice: number;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: Cart;
}

type PaymentMethod = "COD" | "MOMO" | "ZALOPAY";

export default function CartPage() {
    const navigate = useNavigate();
    const vietnamAddress = vietnamAddressData as Province[];
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Address selection state
    const [addressType, setAddressType] = useState<'home' | 'custom'>('home');
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [detailedAddress, setDetailedAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

    useEffect(() => {
        fetchCart();
        fetchUserProfile();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8080/api/user/cart", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Không thể lấy giỏ hàng");
            }

            const data: ApiResponse = await response.json();
            setCart(data.data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
            console.error("Error fetching cart:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/user/profile", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                const data: UserProfileResponse = await response.json();
                setUserProfile(data.data);
            }
        } catch (err) {
            console.error("Error fetching user profile:", err);
        }
    };

    const getProvinceName = (provinceId: string) => {
        const province = vietnamAddress.find(p => p.Id === provinceId);
        return province?.Name || "";
    };

    const getDistrictName = (districtId: string) => {
        if (!selectedProvince) return "";
        const province = vietnamAddress.find(p => p.Id === selectedProvince);
        const district = province?.Districts.find(d => d.Id === districtId);
        return district?.Name || "";
    };

    const getWardName = (wardId: string) => {
        if (!selectedProvince || !selectedDistrict) return "";
        const province = vietnamAddress.find(p => p.Id === selectedProvince);
        const district = province?.Districts.find(d => d.Id === selectedDistrict);
        const ward = district?.Wards.find(w => w.Id === wardId);
        return ward?.Name || "";
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProvince(e.target.value);
        setSelectedDistrict("");
        setSelectedWard("");
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDistrict(e.target.value);
        setSelectedWard("");
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWard(e.target.value);
    };

    const getProvincesForSelect = (): Province[] => vietnamAddress as Province[];

    const getDistrictsForSelect = (): District[] => {
        if (!selectedProvince) return [];
        const province = vietnamAddress.find(p => p.Id === selectedProvince);
        return province?.Districts || [];
    };

    const getWardsForSelect = (): Ward[] => {
        if (!selectedProvince || !selectedDistrict) return [];
        const province = vietnamAddress.find(p => p.Id === selectedProvince);
        const district = province?.Districts.find(d => d.Id === selectedDistrict);
        return district?.Wards || [];
    };

    const getSelectedAddress = () => {
        if (addressType === 'home') {
            return userProfile?.address || "Chưa có địa chỉ";
        } else {
            const parts = [];
            if (detailedAddress) parts.push(detailedAddress);
            if (selectedWard) {
                const wardName = getWardName(selectedWard);
                if (wardName) parts.push(wardName);
            }
            if (selectedDistrict) {
                const districtName = getDistrictName(selectedDistrict);
                if (districtName) parts.push(districtName);
            }
            if (selectedProvince) {
                const provinceName = getProvinceName(selectedProvince);
                if (provinceName) parts.push(provinceName);
            }
            return parts.length > 0 ? parts.join(", ") : "Chưa chọn địa chỉ";
        }
    };

    const handleUpdateQuantity = (cartItemId: number, newQuantity: number) => {
        if (newQuantity <= 0) return;

        // Chỉ cập nhập state local, không gọi API
        if (cart) {
            const updatedCart = {
                ...cart,
                cartItems: cart.cartItems.map((item) =>
                    item.id === cartItemId ? { ...item, quantity: newQuantity } : item
                ),
            };
            // Tính lại totalPrice
            updatedCart.totalPrice = updatedCart.cartItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            setCart(updatedCart);
        }
    };

    const handleRemoveItem = async (cartItemId: number) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;

        try {
            const response = await fetch(
                `http://localhost:8080/api/user/cart/${cartItemId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Lỗi khi xóa sản phẩm");
            }

            // Cập nhật state
            if (cart) {
                const updatedItems = cart.cartItems.filter((item) => item.id !== cartItemId);
                const updatedCart = {
                    ...cart,
                    cartItems: updatedItems,
                    totalPrice: updatedItems.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                    ),
                };
                setCart(updatedCart);
            }
        } catch (err) {
            console.error("Error removing item:", err);
            alert(err instanceof Error ? err.message : "Có lỗi xảy ra");
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm("Bạn chắc chắn muốn xóa toàn bộ giỏ hàng?")) return;

        try {
            const response = await fetch("http://localhost:8080/api/user/cart/clear", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Lỗi khi xóa giỏ hàng");
            }

            setCart({
                id: cart?.id || 0,
                cartItems: [],
                totalPrice: 0,
            });
        } catch (err) {
            console.error("Error clearing cart:", err);
            alert(err instanceof Error ? err.message : "Có lỗi xảy ra");
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <p className="text-red-500 text-lg font-semibold mb-4">{error}</p>
                        <button
                            onClick={() => navigate("/")}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Quay lại trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Page Title */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={28} className="text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                    </div>
                </div>
            </div>

            {/* Cart Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {!cart || cart.cartItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
                        <p className="text-gray-600 mb-6">Hãy thêm một số sản phẩm để bắt đầu</p>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                {/* Header */}
                                <div className="grid grid-cols-12 gap-4 bg-gray-100 p-4 font-semibold text-gray-900 border-b">
                                    <div className="col-span-5">Sản phẩm</div>
                                    <div className="col-span-2 text-center">Kích cỡ</div>
                                    <div className="col-span-2 text-center">Số lượng</div>
                                    <div className="col-span-2 text-right">Giá</div>
                                    <div className="col-span-1"></div>
                                </div>

                                {/* Items */}
                                <div className="divide-y">
                                    {cart.cartItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition"
                                        >
                                            {/* Product Info */}
                                            <div className="col-span-5 flex gap-4">
                                                <img
                                                    src={item.product.thumbnail}
                                                    alt={item.product.name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                                <div className="flex flex-col justify-center">
                                                    <h3
                                                        onClick={() => navigate(`/product/${item.product.id}`)}
                                                        className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                                                    >
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {formatPrice(item.price)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Size */}
                                            <div className="col-span-2 text-center">
                                                <span className="bg-gray-200 px-3 py-1 rounded-full font-semibold text-sm">
                                                    {item.size.name}
                                                </span>
                                            </div>

                                            {/* Quantity Control */}
                                            <div className="col-span-2 flex justify-center items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    disabled={item.quantity === 1}
                                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="p-1 hover:bg-gray-200 rounded transition"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            {/* Total Price */}
                                            <div className="col-span-2 text-right">
                                                <p className="font-bold text-blue-600">
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>

                                            {/* Delete Button */}
                                            <div className="col-span-1 flex justify-end">
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Clear Cart Button */}
                                <div className="p-4 bg-gray-50 border-t">
                                    <button
                                        onClick={handleClearCart}
                                        className="text-red-600 font-semibold hover:text-red-700 hover:underline"
                                    >
                                        Xóa toàn bộ giỏ hàng
                                    </button>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={24} />
                                        <h3 className="text-lg font-bold">Địa chỉ giao hàng</h3>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Address Type Selection */}
                                    <div className="mb-6 space-y-3">
                                        {/* Option 1: Home Address */}
                                        <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-blue-50" style={{ borderColor: addressType === 'home' ? '#2563eb' : '#e5e7eb' }}>
                                            <input
                                                type="radio"
                                                name="addressType"
                                                value="home"
                                                checked={addressType === 'home'}
                                                onChange={(e) => setAddressType(e.target.value as 'home' | 'custom')}
                                                className="mt-1 w-4 h-4 cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 mb-1">Địa chỉ nhà riêng</p>
                                                <p className="text-sm text-gray-600">{userProfile?.address || "Chưa cập nhật"}</p>
                                            </div>
                                        </label>

                                        {/* Option 2: Custom Address */}
                                        <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-blue-50" style={{ borderColor: addressType === 'custom' ? '#2563eb' : '#e5e7eb' }}>
                                            <input
                                                type="radio"
                                                name="addressType"
                                                value="custom"
                                                checked={addressType === 'custom'}
                                                onChange={(e) => setAddressType(e.target.value as 'home' | 'custom')}
                                                className="mt-1 w-4 h-4 cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 mb-3">Địa chỉ tự chọn</p>

                                                {/* Address Selection Dropdowns */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                                    {/* Province */}
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                            Tỉnh/Thành phố
                                                        </label>
                                                        <select
                                                            value={selectedProvince}
                                                            onChange={handleProvinceChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        >
                                                            <option value="">Chọn tỉnh/thành phố</option>
                                                            {getProvincesForSelect().map((province) => (
                                                                <option key={province.Id} value={province.Id}>
                                                                    {province.Name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* District */}
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                            Quận/Huyện
                                                        </label>
                                                        <select
                                                            value={selectedDistrict}
                                                            onChange={handleDistrictChange}
                                                            disabled={!selectedProvince}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                        >
                                                            <option value="">Chọn quận/huyện</option>
                                                            {getDistrictsForSelect().map((district) => (
                                                                <option key={district.Id} value={district.Id}>
                                                                    {district.Name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Ward */}
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                            Phường/Xã
                                                        </label>
                                                        <select
                                                            value={selectedWard}
                                                            onChange={handleWardChange}
                                                            disabled={!selectedDistrict}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                        >
                                                            <option value="">Chọn phường/xã</option>
                                                            {getWardsForSelect().map((ward) => (
                                                                <option key={ward.Id} value={ward.Id}>
                                                                    {ward.Name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Detailed Address */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                        Số nhà, đường, v.v.
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={detailedAddress}
                                                        onChange={(e) => setDetailedAddress(e.target.value)}
                                                        placeholder="Nhập số nhà, tên đường..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Selected Address Display */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                        <p className="text-sm text-gray-600 mb-1">Địa chỉ giao hàng:</p>
                                        <p className="text-gray-900 font-semibold">{getSelectedAddress()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    Tóm tắt đơn hàng
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Tổng sản phẩm:</span>
                                        <span className="font-semibold">
                                            {cart.cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Tổng tiền:</span>
                                        <span className="font-semibold">
                                            {formatPrice(cart.totalPrice)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Phí vận chuyển:</span>
                                        <span className="font-semibold text-green-600">Miễn phí</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-bold text-gray-900">
                                            Thành tiền:
                                        </span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            {formatPrice(cart.totalPrice)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                                        Phương thức thanh toán
                                    </h3>
                                    <div className="space-y-3">
                                        <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition" style={{ borderColor: paymentMethod === "COD" ? "#2563eb" : "#e5e7eb" }}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="COD"
                                                checked={paymentMethod === "COD"}
                                                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                                className="mt-1 w-4 h-4 cursor-pointer"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">COD (Thanh toán khi nhận hàng)</p>
                                                <p className="text-sm text-gray-600">Thanh toán tiền mặt hoặc chuyển khoản khi đơn được giao.</p>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition" style={{ borderColor: paymentMethod === "MOMO" ? "#2563eb" : "#e5e7eb" }}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="MOMO"
                                                checked={paymentMethod === "MOMO"}
                                                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                                className="mt-1 w-4 h-4 cursor-pointer"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">Thanh toán qua Momo</p>
                                                <p className="text-sm text-gray-600">Quét mã hoặc mở ứng dụng Momo để hoàn tất thanh toán.</p>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition" style={{ borderColor: paymentMethod === "ZALOPAY" ? "#2563eb" : "#e5e7eb" }}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="ZALOPAY"
                                                checked={paymentMethod === "ZALOPAY"}
                                                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                                className="mt-1 w-4 h-4 cursor-pointer"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">Thanh toán qua ZaloPay</p>
                                                <p className="text-sm text-gray-600">Sử dụng ZaloPay để thanh toán nhanh chóng và an toàn.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mb-2">
                                    Thanh toán
                                </button>
                                <button
                                    onClick={() => navigate("/")}
                                    className="w-full bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Tiếp tục mua sắm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
