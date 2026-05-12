import { useMemo, useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import type { ProductSize } from "./productDetail.types";
import { findSuggestedSize, getNearestAvailableSize, type FitPreference } from "./sizeSuggestion";

type SizeSuggestionWidgetProps = {
    availableSizes: ProductSize[];
    selectedSize: number | null;
    onSelectSize: (productSizeId: number) => void;
    defaultGender?: string;
};

const genderOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
    { value: "unisex", label: "Unisex" },
    { value: "other", label: "Khác" },
];

const fitOptions: { value: FitPreference; label: string }[] = [
    { value: "regular", label: "Regular" },
    { value: "slim", label: "Gầy" },
    { value: "fuller", label: "Đầy đặn / vai rộng" },
    { value: "oversize", label: "Oversize" },
];

const formatSizeList = (sizes: ProductSize[]) => sizes.map((size) => size.size.name).join(", ");

export default function SizeSuggestionWidget({
    availableSizes,
    selectedSize,
    onSelectSize,
    defaultGender = "unisex",
}: SizeSuggestionWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [gender, setGender] = useState(defaultGender.toLowerCase());
    const [height, setHeight] = useState<number | "">("");
    const [weight, setWeight] = useState<number | "">("");
    const [fitPreference, setFitPreference] = useState<FitPreference>("regular");
    const [resultMessage, setResultMessage] = useState<string>("");
    const [recommendedSize, setRecommendedSize] = useState<string>("");

    const availableSizeNames = useMemo(() => availableSizes.map((size) => size.size.name), [availableSizes]);

    const selectedProductSize = useMemo(
        () => availableSizes.find((size) => size.id === selectedSize) || null,
        [availableSizes, selectedSize]
    );

    const handleSuggest = () => {
        if (height === "" || weight === "") {
            setResultMessage("Vui lòng nhập đầy đủ chiều cao và cân nặng.");
            setRecommendedSize("");
            return;
        }

        const suggestion = findSuggestedSize(Number(height), Number(weight), fitPreference);
        const matchedSize = getNearestAvailableSize(suggestion.standardSize, availableSizeNames);

        setRecommendedSize(matchedSize || suggestion.standardSize);

        if (!matchedSize) {
            setResultMessage(`Không tìm thấy size phù hợp trong sản phẩm. ${suggestion.reason}`);
            return;
        }

        setResultMessage(
            `${suggestion.reason} Phù hợp với size đang có trong sản phẩm: ${matchedSize}.`
        );
    };

    const handleApplySuggestedSize = () => {
        if (!recommendedSize) {
            return;
        }

        const matched = availableSizes.find((size) => size.size.name.toLowerCase() === recommendedSize.toLowerCase());
        if (matched) {
            onSelectSize(matched.id);
        }
    };

    return (
        <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-sky-50 p-5 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Gợi ý size</p>
                        <h3 className="mt-1 text-lg font-bold text-slate-900">Tìm size phù hợp trong vài giây</h3>
                        <p className="mt-1 text-sm text-slate-600">Nhập thông tin cơ thể, hệ thống sẽ gợi ý size theo bảng chuẩn và size đang có.</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen((current) => !current)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                    Gợi ý size
                    <ChevronDown size={18} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
            </div>

            <div className={`grid overflow-hidden transition-all duration-300 ${isOpen ? "mt-5 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"}`}>
                <div className="min-h-0">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-slate-700">Giới tính</span>
                                <select
                                    value={gender}
                                    onChange={(event) => setGender(event.target.value)}
                                    className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                                >
                                    {genderOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-slate-700">Dáng người / kiểu mặc</span>
                                <select
                                    value={fitPreference}
                                    onChange={(event) => setFitPreference(event.target.value as FitPreference)}
                                    className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                                >
                                    {fitOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-slate-700">Chiều cao (cm)</span>
                                <input
                                    type="number"
                                    min={120}
                                    max={220}
                                    value={height}
                                    onChange={(event) => setHeight(event.target.value === "" ? "" : Number(event.target.value))}
                                    placeholder="Ví dụ: 168"
                                    className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                                />
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-slate-700">Cân nặng (kg)</span>
                                <input
                                    type="number"
                                    min={30}
                                    max={200}
                                    value={weight}
                                    onChange={(event) => setWeight(event.target.value === "" ? "" : Number(event.target.value))}
                                    placeholder="Ví dụ: 58"
                                    className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                                />
                            </label>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleSuggest}
                                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:-translate-y-0.5 hover:from-sky-500 hover:to-cyan-500"
                            >
                                Gợi ý size
                            </button>

                            {recommendedSize && (
                                <button
                                    type="button"
                                    onClick={handleApplySuggestedSize}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                                >
                                    <Check size={16} />
                                    Áp dụng size gợi ý
                                </button>
                            )}
                        </div>

                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">Kết quả</p>
                                    <p className="mt-1 text-lg font-bold text-slate-900">
                                        {recommendedSize || "Chưa có size gợi ý"}
                                    </p>
                                </div>

                                {selectedProductSize && (
                                    <div className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                                        Đang chọn: {selectedProductSize.size.name}
                                    </div>
                                )}
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                {resultMessage || `Size khả dụng của sản phẩm: ${formatSizeList(availableSizes)}.`}
                            </p>

                            {availableSizeNames.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {availableSizes.map((size) => {
                                        const active = recommendedSize.toLowerCase() === size.size.name.toLowerCase();
                                        return (
                                            <span
                                                key={size.id}
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-sky-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
                                            >
                                                {size.size.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
