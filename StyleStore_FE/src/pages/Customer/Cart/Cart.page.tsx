import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import Header from "../../../components/Header";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { useToast } from "../../../components/ToastProvider";
import vietnamAddressData from "../../../vietnamAddress.json";
import CartItemList from "./CartItemList";
import AddressSection from "./AddressSection";
import OrderSummary from "./OrderSummary";
import PromotionSelector, { type Promotion } from "./PromotionSelector";
import {
    clearGuestCart,
    getGuestCart,
    removeGuestCartItem,
    updateGuestCartItemQuantity,
} from "../../../services/cartStorage";
import { appendGuestOrder } from "../../../services/orderStorage";

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

interface UserRole {
    id?: number;
    name?: string;
}

interface UserProfile {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    address: string;
    role?: string | UserRole;
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
    material?: string;
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

interface OrderItemRequestPayload {
    productId: number;
    sizeId: number;
    quantity: number;
}

interface CreateOrderRequestPayload {
    shippingAddress: string;
    receiverPhoneNumber: string;
    paymentMethod: PaymentMethod;
    promotionCode: string | null;
    orderItems: OrderItemRequestPayload[];
}

type PaymentMethod = "COD" | "MOMO" | "ZALOPAY";

export default function CartPage() {
    const navigate = useNavigate();
    const { pushToast } = useToast();
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
    const [recipientPhoneNumber, setRecipientPhoneNumber] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmCheckout, setShowConfirmCheckout] = useState(false);
    const [showPaymentQr, setShowPaymentQr] = useState(false);

    const subtotal = cart?.totalPrice || 0;
    const discountAmount = selectedPromotion
        ? Math.min(
            (subtotal * selectedPromotion.discountPercent) / 100,
            selectedPromotion.maxDiscountAmount
        )
        : 0;
    const finalAmount = Math.max(subtotal - discountAmount, 0);

    useEffect(() => {
        fetchCart();
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (userProfile?.phoneNumber && !recipientPhoneNumber) {
            setRecipientPhoneNumber(userProfile.phoneNumber);
        }
    }, [userProfile?.phoneNumber, recipientPhoneNumber]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                setCart(getGuestCart() as Cart);
                setError(null);
                return;
            }

            const response = await fetch("http://localhost:8080/api/user/cart", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Không thể lấy giỏ hàng hoặc phiên đã hết hạn. Vui lòng đăng nhập lại.");
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

    const paymentQrSrc = finalAmount > 0
        ? `https://img.vietqr.io/image/MB-0000836840548-print.png?amount=${Math.round(finalAmount)}`
        : "";

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                return;
            }

            const response = await fetch("http://localhost:8080/api/user/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
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

    const handleProvinceChange = (provinceId: string) => {
        setSelectedProvince(provinceId);
        setSelectedDistrict("");
        setSelectedWard("");
    };

    const handleDistrictChange = (districtId: string) => {
        setSelectedDistrict(districtId);
        setSelectedWard("");
    };

    const handleWardChange = (wardId: string) => {
        setSelectedWard(wardId);
    };

    // const getProvincesForSelect = (): Province[] => vietnamAddress as Province[];

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

        const token = localStorage.getItem("token");

        if (!token) {
            const updatedCart = updateGuestCartItemQuantity(cartItemId, newQuantity) as Cart;
            setCart(updatedCart);
            window.dispatchEvent(new CustomEvent("cart-updated"));
            return;
        }

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

        const token = localStorage.getItem("token");

        if (!token) {
            const updatedCart = removeGuestCartItem(cartItemId) as Cart;
            setCart(updatedCart);
            window.dispatchEvent(new CustomEvent("cart-updated"));
            pushToast("Xóa sản phẩm thành công", "success");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/user/cart/${cartItemId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
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
            pushToast("Xóa sản phẩm thành công", "success");
        } catch (err) {
            console.error("Error removing item:", err);
            pushToast(err instanceof Error ? err.message : "Có lỗi xảy ra", "error");
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm("Bạn chắc chắn muốn xóa toàn bộ giỏ hàng?")) return;

        const token = localStorage.getItem("token");

        if (!token) {
            const updatedCart = clearGuestCart() as Cart;
            setCart(updatedCart);
            window.dispatchEvent(new CustomEvent("cart-updated"));
            pushToast("Xóa giỏ hàng thành công", "success");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/user/cart/clear", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
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
            pushToast("Xóa giỏ hàng thành công", "success");
        } catch (err) {
            console.error("Error clearing cart:", err);
            pushToast(err instanceof Error ? err.message : "Có lỗi xảy ra", "error");
        }
    };

    // const formatPrice = (price: number) => {
    //     return new Intl.NumberFormat("vi-VN", {
    //         style: "currency",
    //         currency: "VND",
    //     }).format(price);
    // };

    const handleCheckoutClick = () => {
        if (!cart || cart.cartItems.length === 0) {
            pushToast("Giỏ hàng trống", "error");
            return;
        }

        if (selectedPromotion && subtotal < selectedPromotion.minOrderAmount) {
            pushToast("Đơn hàng chưa đạt mức tối thiểu để áp dụng khuyến mãi đã chọn", "error");
            setSelectedPromotion(null);
            return;
        }

        const shippingAddress = getSelectedAddress();
        if (!shippingAddress || shippingAddress.includes("Chưa")) {
            pushToast("Vui lòng chọn hoặc nhập địa chỉ giao hàng", "error");
            return;
        }

        const normalizedPhoneNumber = recipientPhoneNumber.trim();
        if (!normalizedPhoneNumber) {
            pushToast("Vui lòng nhập số điện thoại người nhận", "error");
            return;
        }

        if (!/^\d{10}$/.test(normalizedPhoneNumber)) {
            pushToast("Số điện thoại người nhận phải gồm 10 chữ số", "error");
            return;
        }

        setShowConfirmCheckout(true);
    };

    const handleConfirmCheckout = async () => {
        if (!cart || cart.cartItems.length === 0) {
            setShowConfirmCheckout(false);
            return;
        }

        const shippingAddress = getSelectedAddress();
        const receiverPhoneNumber = recipientPhoneNumber.trim();
        const token = localStorage.getItem("token");

        if (!shippingAddress || !receiverPhoneNumber) {
            setShowConfirmCheckout(false);
            return;
        }

        if (selectedPromotion && subtotal < selectedPromotion.minOrderAmount) {
            pushToast("Khuyến mãi đã chọn không còn hợp lệ", "error");
            setSelectedPromotion(null);
            setShowConfirmCheckout(false);
            return;
        }

        const payload: CreateOrderRequestPayload = {
            shippingAddress,
            receiverPhoneNumber,
            paymentMethod,
            promotionCode: selectedPromotion?.code || null,
            orderItems: cart.cartItems.map((item) => ({
                productId: item.product.id,
                sizeId: item.size.id,
                quantity: item.quantity,
            })),
        };

        // If payment method is MOMO or ZALOPAY, show QR image first and create order after user confirms transfer
        if (paymentMethod === "MOMO" || paymentMethod === "ZALOPAY") {
            setShowConfirmCheckout(false);
            setShowPaymentQr(true);
            return;
        }

        // Otherwise (COD) create order immediately
        setIsSubmitting(true);
        try {
            const response = await fetch("http://localhost:8080/api/user/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                pushToast(result.message || "Tạo đơn hàng thất bại", "error");
                setShowConfirmCheckout(false);
                return;
            }

            if (!token && result.data) {
                appendGuestOrder(result.data);
                window.dispatchEvent(new Event("orders-updated"));
            }

            pushToast("Đặt hàng thành công", "success");
            const checkoutButton = document.querySelector('[data-checkout-button="true"]');
            if (checkoutButton) {
                const rect = checkoutButton.getBoundingClientRect();
                window.dispatchEvent(new CustomEvent('order-checkout-success', {
                    detail: {
                        fromX: rect.left + rect.width / 2,
                        fromY: rect.top + rect.height / 2,
                    },
                }));
            }

            setShowConfirmCheckout(false);
            setTimeout(() => {
                navigate("/orders");
            }, 1500);
        } catch (err) {
            console.error("Checkout error", err);
            pushToast("Có lỗi xảy ra, vui lòng thử lại", "error");
            setShowConfirmCheckout(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmTransferAndCreateOrder = async () => {
        if (!cart || cart.cartItems.length === 0) {
            setShowPaymentQr(false);
            return;
        }

        const shippingAddress = getSelectedAddress();
        const token = localStorage.getItem("token");
        const receiverPhoneNumber = recipientPhoneNumber.trim();

        if (!shippingAddress || !receiverPhoneNumber) {
            setShowPaymentQr(false);
            return;
        }

        if (selectedPromotion && subtotal < selectedPromotion.minOrderAmount) {
            pushToast("Khuyến mãi đã chọn không còn hợp lệ", "error");
            setSelectedPromotion(null);
            setShowPaymentQr(false);
            return;
        }

        const payload: CreateOrderRequestPayload = {
            shippingAddress,
            receiverPhoneNumber,
            paymentMethod,
            promotionCode: selectedPromotion?.code || null,
            orderItems: cart.cartItems.map((item) => ({
                productId: item.product.id,
                sizeId: item.size.id,
                quantity: item.quantity,
            })),
        };

        setIsSubmitting(true);
        try {
            const response = await fetch("http://localhost:8080/api/user/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                pushToast(result.message || "Tạo đơn hàng thất bại", "error");
                setShowPaymentQr(false);
                return;
            }

            if (!token && result.data) {
                appendGuestOrder(result.data);
                window.dispatchEvent(new Event("orders-updated"));
            }

            pushToast("Đặt hàng thành công", "success");
            setShowPaymentQr(false);
            const checkoutButton = document.querySelector('[data-checkout-button="true"]');
            if (checkoutButton) {
                const rect = checkoutButton.getBoundingClientRect();
                window.dispatchEvent(new CustomEvent('order-checkout-success', {
                    detail: {
                        fromX: rect.left + rect.width / 2,
                        fromY: rect.top + rect.height / 2,
                    },
                }));
            }

            setTimeout(() => {
                navigate("/orders");
            }, 1500);
        } catch (err) {
            console.error("Checkout error", err);
            pushToast("Có lỗi xảy ra, vui lòng thử lại", "error");
            setShowPaymentQr(false);
        } finally {
            setIsSubmitting(false);
        }
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
                            <CartItemList
                                items={cart.cartItems}
                                onQuantityChange={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onClearCart={handleClearCart}
                                onProductClick={(productId) => navigate(`/product/${productId}`)}
                            />

                            <AddressSection
                                addressType={addressType}
                                onAddressTypeChange={setAddressType}
                                userHomeAddress={userProfile?.address}
                                selectedProvince={selectedProvince}
                                onProvinceChange={handleProvinceChange}
                                selectedDistrict={selectedDistrict}
                                onDistrictChange={handleDistrictChange}
                                selectedWard={selectedWard}
                                onWardChange={handleWardChange}
                                detailedAddress={detailedAddress}
                                onDetailedAddressChange={setDetailedAddress}
                                provinces={vietnamAddress}
                                districts={getDistrictsForSelect()}
                                wards={getWardsForSelect()}
                                selectedAddress={getSelectedAddress()}
                            />
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <PromotionSelector
                                orderTotal={subtotal}
                                selectedPromotionId={selectedPromotion?.id || null}
                                onPromotionChange={setSelectedPromotion}
                            />

                            <OrderSummary
                                cart={cart}
                                selectedPromotion={selectedPromotion}
                                discountAmount={discountAmount}
                                finalAmount={finalAmount}
                                recipientPhoneNumber={recipientPhoneNumber}
                                onRecipientPhoneNumberChange={setRecipientPhoneNumber}
                                paymentMethod={paymentMethod}
                                onPaymentMethodChange={setPaymentMethod}
                                onCheckout={handleCheckoutClick}
                                onContinueShopping={() => navigate("/")}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Checkout Dialog */}
            {showPaymentQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black opacity-20 z-40" onClick={() => setShowPaymentQr(false)} />
                    <div className="bg-white rounded-lg shadow-lg p-8 z-50 max-w-xl mx-4 relative">
                        <h3 className="text-lg font-semibold mb-2">Xác nhận thanh toán ({paymentMethod === "MOMO" ? "Momo" : "ZaloPay"})</h3>
                        <p className="text-sm text-gray-600">Số tiền: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(finalAmount)}</p>
                        
                        <div className="flex justify-center">
                            <img src={paymentQrSrc} alt="QR" className="mx-auto my-4 w-96 h-96 object-contain" />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowPaymentQr(false)}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmTransferAndCreateOrder}
                                disabled={isSubmitting}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'}`}
                            >
                                {isSubmitting ? "Đang xử lý..." : "Đã thanh toán"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={showConfirmCheckout}
                title="Xác nhận đặt hàng"
                message={`Bạn có chắc muốn đặt hàng với phương thức thanh toán: ${paymentMethod === "COD" ? "Thanh toán khi nhận hàng" :
                    paymentMethod === "MOMO" ? "Ví Momo" :
                        "ZaloPay"
                    }?`}
                confirmText="Đặt hàng"
                cancelText="Hủy"
                isLoading={isSubmitting}
                onConfirm={handleConfirmCheckout}
                onCancel={() => setShowConfirmCheckout(false)}
            />
        </div>
    );
}
