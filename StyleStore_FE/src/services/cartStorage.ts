export interface GuestCartProduct {
    id: number;
    name: string;
    price: number;
    thumbnail: string;
    material?: string;
    color?: string;
}

export interface GuestCartSize {
    id: number;
    name: string;
}

export interface GuestCartItem {
    id: number;
    productId: number;
    sizeId: number;
    product: GuestCartProduct;
    size: GuestCartSize;
    quantity: number;
    price: number;
}

export interface GuestCart {
    id: number;
    cartItems: GuestCartItem[];
    totalPrice: number;
}

const GUEST_CART_STORAGE_KEY = "guestCart";

const createGuestCartItemId = () => Number(`${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`);

const createEmptyCart = (): GuestCart => ({
    id: 0,
    cartItems: [],
    totalPrice: 0,
});

const calculateTotalPrice = (cartItems: GuestCartItem[]) =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

const safeParseCart = (rawValue: string | null): GuestCart => {
    if (!rawValue) {
        return createEmptyCart();
    }

    try {
        const parsed = JSON.parse(rawValue) as Partial<GuestCart>;
        const cartItems = Array.isArray(parsed.cartItems) ? (parsed.cartItems as GuestCartItem[]) : [];

        return {
            id: typeof parsed.id === "number" ? parsed.id : 0,
            cartItems,
            totalPrice: typeof parsed.totalPrice === "number"
                ? parsed.totalPrice
                : calculateTotalPrice(cartItems),
        };
    } catch {
        return createEmptyCart();
    }
};

export const getGuestCart = (): GuestCart => {
    if (typeof window === "undefined") {
        return createEmptyCart();
    }

    return safeParseCart(localStorage.getItem(GUEST_CART_STORAGE_KEY));
};

export const saveGuestCart = (cart: GuestCart) => {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(cart));
};

export const clearGuestCart = (): GuestCart => {
    const emptyCart = createEmptyCart();
    saveGuestCart(emptyCart);
    return emptyCart;
};

export const addGuestCartItem = (
    item: Omit<GuestCartItem, "id" | "price"> & { price?: number }
): GuestCart => {
    const currentCart = getGuestCart();
    const existingIndex = currentCart.cartItems.findIndex(
        (cartItem) => cartItem.productId === item.productId && cartItem.sizeId === item.sizeId
    );

    const nextCartItems = [...currentCart.cartItems];

    if (existingIndex >= 0) {
        nextCartItems[existingIndex] = {
            ...nextCartItems[existingIndex],
            quantity: nextCartItems[existingIndex].quantity + item.quantity,
        };
    } else {
        nextCartItems.push({
            id: createGuestCartItemId(),
            productId: item.productId,
            sizeId: item.sizeId,
            product: item.product,
            size: item.size,
            quantity: item.quantity,
            price: item.price ?? item.product.price,
        });
    }

    const nextCart = {
        ...currentCart,
        cartItems: nextCartItems,
        totalPrice: calculateTotalPrice(nextCartItems),
    };

    saveGuestCart(nextCart);
    return nextCart;
};

export const updateGuestCartItemQuantity = (cartItemId: number, quantity: number): GuestCart => {
    const currentCart = getGuestCart();

    if (quantity <= 0) {
        return removeGuestCartItem(cartItemId);
    }

    const nextCartItems = currentCart.cartItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
    );

    const nextCart = {
        ...currentCart,
        cartItems: nextCartItems,
        totalPrice: calculateTotalPrice(nextCartItems),
    };

    saveGuestCart(nextCart);
    return nextCart;
};

export const removeGuestCartItem = (cartItemId: number): GuestCart => {
    const currentCart = getGuestCart();
    const nextCartItems = currentCart.cartItems.filter((item) => item.id !== cartItemId);

    const nextCart = {
        ...currentCart,
        cartItems: nextCartItems,
        totalPrice: calculateTotalPrice(nextCartItems),
    };

    saveGuestCart(nextCart);
    return nextCart;
};

export const getGuestCartCount = (): number => getGuestCart().cartItems.length;