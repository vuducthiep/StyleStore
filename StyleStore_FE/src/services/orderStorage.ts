const GUEST_ORDERS_STORAGE_KEY = "guest-orders";

export interface StoredGuestOrder {
    id: number;
    userId: number | null;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    promotionCode?: string | null;
    shippingAddress: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    receiverPhoneNumber?: string | null;
}

const createEmptyOrders = (): StoredGuestOrder[] => [];

const safeParseOrders = (value: string | null): StoredGuestOrder[] => {
    if (!value) {
        return createEmptyOrders();
    }

    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
            return createEmptyOrders();
        }

        return parsed.filter((order) => order && typeof order.id === "number");
    } catch {
        return createEmptyOrders();
    }
};

export const getGuestOrders = (): StoredGuestOrder[] => {
    if (typeof window === "undefined") {
        return createEmptyOrders();
    }

    return safeParseOrders(localStorage.getItem(GUEST_ORDERS_STORAGE_KEY));
};

export const saveGuestOrders = (orders: StoredGuestOrder[]) => {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(GUEST_ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

export const appendGuestOrder = (order: StoredGuestOrder): StoredGuestOrder[] => {
    const currentOrders = getGuestOrders();
    const nextOrders = [order, ...currentOrders.filter((existingOrder) => existingOrder.id !== order.id)];
    saveGuestOrders(nextOrders);
    return nextOrders;
};