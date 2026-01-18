type PaymentMethod = "COD" | "MOMO" | "ZALOPAY";

interface PaymentMethodSectionProps {
    paymentMethod: PaymentMethod;
    onPaymentMethodChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSection({
    paymentMethod,
    onPaymentMethodChange,
}: PaymentMethodSectionProps) {
    return (
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
                        onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
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
                        onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
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
                        onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
                        className="mt-1 w-4 h-4 cursor-pointer"
                    />
                    <div>
                        <p className="font-semibold text-gray-900">Thanh toán qua ZaloPay</p>
                        <p className="text-sm text-gray-600">Sử dụng ZaloPay để thanh toán nhanh chóng và an toàn.</p>
                    </div>
                </label>
            </div>
        </div>
    );
}
