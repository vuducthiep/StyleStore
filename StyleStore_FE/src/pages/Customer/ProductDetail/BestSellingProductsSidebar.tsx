type TopProduct = {
    productId: number;
    productName: string;
    productThumbnail: string;
    totalSold: number;
};

type BestSellingProductsSidebarProps = {
    currentProductId: number;
    topProducts: TopProduct[];
    loading: boolean;
    onSelectProduct: (productId: number) => void;
};

export default function BestSellingProductsSidebar({
    currentProductId,
    topProducts,
    loading,
    onSelectProduct,
}: BestSellingProductsSidebarProps) {
    const visibleProducts = topProducts.filter((item) => item.productId !== currentProductId).slice(0, 5);

    return (
        <aside className="w-full lg:w-[400px] flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Cùng danh mục</p>
                    <h2 className="text-lg font-bold text-gray-900">Bán chạy nhất</h2>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : visibleProducts.length > 0 ? (
                <div className="space-y-3">
                    {visibleProducts.map((item) => (
                        <button
                            key={item.productId}
                            type="button"
                            onClick={() => onSelectProduct(item.productId)}
                            className="w-full text-left flex items-center gap-3 rounded-xl border border-gray-200 p-2 hover:border-blue-400 hover:shadow-md transition-all bg-white"
                        >
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                <img
                                    src={item.productThumbnail}
                                    alt={item.productName}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                                    {item.productName}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Đã bán {item.totalSold}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                    Chưa có dữ liệu bán chạy cho danh mục này.
                </div>
            )}
        </aside>
    );
}