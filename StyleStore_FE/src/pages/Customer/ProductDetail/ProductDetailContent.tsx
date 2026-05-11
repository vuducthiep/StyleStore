import { ShoppingCart, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import type { CSSProperties } from "react";
import type { Product, ProductSize, ProductImage } from "./productDetail.types";

type FlyingSpark = {
    id: number;
    startX: number;
    startY: number;
    deltaX: number;
    deltaY: number;
    curveX: number;
    curveY: number;
    size: number;
    delay: number;
};

type ProductDetailContentProps = {
    product: Product;
    availableSizes: ProductSize[];
    selectedSize: number | null;
    quantity: number;
    addedToCart: boolean;
    onSelectSize: (productSizeId: number) => void;
    onDecreaseQuantity: () => void;
    onIncreaseQuantity: () => void;
    onAddToCart: () => void;
    formatPrice: (price: number) => string;
};

export default function ProductDetailContent({
    product,
    availableSizes,
    selectedSize,
    quantity,
    addedToCart,
    onSelectSize,
    onDecreaseQuantity,
    onIncreaseQuantity,
    onAddToCart,
    formatPrice,
}: ProductDetailContentProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [thumbnailScrollOffset, setThumbnailScrollOffset] = useState(0);
    const [flyingSparks, setFlyingSparks] = useState<FlyingSpark[]>([]);
    const thumbnailContainerRef = useRef<HTMLDivElement>(null);
    const addToCartButtonRef = useRef<HTMLButtonElement>(null);

    // Check if product is new (created within 30 days)
    const isNewProduct = () => {
        const createdAt = new Date(product.createdAt);
        const now = new Date();
        const daysDifference = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysDifference < 30;
    };

    // Combine thumbnail with product images for carousel
    const allImages: ProductImage[] = [
        { imageUrl: product.thumbnail, displayOrder: 0 },
        ...(product.productImages || []).sort((a, b) => a.displayOrder - b.displayOrder)
    ];

    const currentImage = allImages[currentImageIndex];
    const thumbnailWidth = 80; // 64px (w-16) + 16px gap
    const maxScrollOffset = Math.max(0, (allImages.length * thumbnailWidth) - 400);

    const changeImage = (newIndex: number) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentImageIndex(newIndex);
            setIsTransitioning(false);
        }, 150);
    };

    const goToPreviousImage = () => {
        const newIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
        changeImage(newIndex);
    };

    const goToNextImage = () => {
        const newIndex = (currentImageIndex + 1) % allImages.length;
        changeImage(newIndex);
    };

    const goToImage = (index: number) => {
        changeImage(index);
    };

    const scrollThumbnailsLeft = () => {
        const newOffset = Math.max(0, thumbnailScrollOffset - 100);
        setThumbnailScrollOffset(newOffset);
    };

    const scrollThumbnailsRight = () => {
        const newOffset = Math.min(maxScrollOffset, thumbnailScrollOffset + 100);
        setThumbnailScrollOffset(newOffset);
    };

    const triggerFlyToCartAnimation = () => {
        const startElement = addToCartButtonRef.current;
        const cartAnchor = document.querySelector('[data-cart-icon-anchor="true"]') as HTMLElement | null;

        if (!startElement || !cartAnchor) {
            return;
        }

        const startRect = startElement.getBoundingClientRect();
        const targetRect = cartAnchor.getBoundingClientRect();

        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        const sparkCount = 14;
        const sparks = Array.from({ length: sparkCount }, (_, index) => {
            const spreadX = (Math.random() - 0.5) * 48;
            const spreadY = (Math.random() - 0.5) * 34;

            return {
                id: Date.now() + index,
                startX,
                startY,
                deltaX: targetX - startX + spreadX,
                deltaY: targetY - startY + spreadY,
                curveX: (Math.random() - 0.5) * 90,
                curveY: -60 - Math.random() * 90,
                size: 8 + Math.random() * 7,
                delay: index * 24,
            };
        });

        setFlyingSparks(sparks);
        window.setTimeout(() => {
            setFlyingSparks([]);
        }, 1300);
    };

    const handleAddToCartClick = () => {
        triggerFlyToCartAnimation();
        onAddToCart();

        window.setTimeout(() => {
            window.dispatchEvent(new CustomEvent('cart-updated'));
        }, 950);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <style>{`
                @keyframes blink {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.6;
                        transform: scale(0.98);
                    }
                }
                .animate-blink {
                    animation: blink 0.5s infinite;
                }

                @keyframes sparkFlyToCart {
                    0% {
                        transform: translate3d(0, 0, 0) scale(0.72);
                        opacity: 0;
                    }
                    12% {
                        opacity: 1;
                    }
                    36% {
                        transform: translate3d(var(--cx), var(--cy), 0) scale(1.18);
                        opacity: 1;
                    }
                    82% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate3d(var(--dx), var(--dy), 0) scale(0.2);
                        opacity: 0;
                    }
                }

                .spark-fly-item {
                    position: fixed;
                    pointer-events: none;
                    z-index: 120;
                    border-radius: 9999px;
                    background: radial-gradient(circle at 35% 35%, #fffdf0 0%, #fde68a 28%, #f59e0b 62%, rgba(245, 158, 11, 0) 85%);
                    box-shadow:
                        0 0 10px rgba(255, 245, 180, 0.95),
                        0 0 20px rgba(251, 191, 36, 0.85),
                        0 0 34px rgba(245, 158, 11, 0.55);
                    animation: sparkFlyToCart 1.05s cubic-bezier(0.2, 0.75, 0.2, 1) forwards;
                    will-change: transform, opacity;
                }

                .spark-fly-item::after {
                    content: "";
                    position: absolute;
                    inset: -55%;
                    border-radius: 9999px;
                    background: radial-gradient(circle, rgba(255, 249, 196, 0.7) 0%, rgba(251, 191, 36, 0) 72%);
                }
            `}</style>

            {flyingSparks.map((spark) => (
                <span
                    key={spark.id}
                    className="spark-fly-item"
                    style={{
                        left: `${spark.startX}px`,
                        top: `${spark.startY}px`,
                        width: `${spark.size}px`,
                        height: `${spark.size}px`,
                        animationDelay: `${spark.delay}ms`,
                        '--cx': `${spark.curveX}px`,
                        '--cy': `${spark.curveY}px`,
                        '--dx': `${spark.deltaX}px`,
                        '--dy': `${spark.deltaY}px`,
                    } as CSSProperties & Record<'--cx' | '--cy' | '--dx' | '--dy', string>}
                />
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center justify-center">
                    {/* Image Carousel */}
                    <div className="relative w-full max-w-[720px] mx-auto group">
                        {/* Image Container */}
                        <div className="relative w-full aspect-[4/5] min-h-[560px] bg-gray-200 rounded-lg overflow-hidden">
                            <img
                                src={currentImage.imageUrl}
                                alt={product.name}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${
                                    isTransitioning ? 'opacity-0' : 'opacity-100'
                                }`}
                            />
                            {isNewProduct() && (
                                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg animate-blink shadow-lg">
                                    NEW
                                </div>
                            )}

                            {/* Previous Button */}
                            {allImages.length > 1 && (
                                <button
                                    onClick={goToPreviousImage}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            )}

                            {/* Next Button */}
                            {allImages.length > 1 && (
                                <button
                                    onClick={goToNextImage}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            )}
                        </div>

                        {/* Thumbnails Strip */}
                        {allImages.length > 1 && (
                            <div className="mt-4">
                                <div className="relative flex items-center gap-3 group">
                                    {/* Left Button */}
                                    <button
                                        onClick={scrollThumbnailsLeft}
                                        className={`flex-shrink-0 p-2 rounded-full transition-all ${
                                            thumbnailScrollOffset === 0
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                        }`}
                                        disabled={thumbnailScrollOffset === 0}
                                        aria-label="Scroll thumbnails left"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    {/* Thumbnails Container */}
                                    <div className="flex-1 overflow-hidden">
                                        <div
                                            ref={thumbnailContainerRef}
                                            className="flex justify-center gap-4 transition-transform duration-300"
                                            style={{ transform: `translateX(-${thumbnailScrollOffset}px)` }}
                                        >
                                            {allImages.map((img, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => goToImage(index)}
                                                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                                        index === currentImageIndex
                                                            ? 'border-blue-600 shadow-md scale-105'
                                                            : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                    aria-label={`Select image ${index + 1}`}
                                                >
                                                    <img
                                                        src={img.imageUrl}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Button */}
                                    <button
                                        onClick={scrollThumbnailsRight}
                                        className={`flex-shrink-0 p-2 rounded-full transition-all ${
                                            thumbnailScrollOffset >= maxScrollOffset
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                        }`}
                                        disabled={thumbnailScrollOffset >= maxScrollOffset}
                                        aria-label="Scroll thumbnails right"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Image counter */}
                                <div className="text-center text-sm text-gray-600 mt-3">
                                    {currentImageIndex + 1} / {allImages.length}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col justify-center">
                    <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide mb-2">
                        {product.category.name}
                    </p>

                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>

                    <div className="flex gap-4 mb-6">
                        <div>
                            <p className="text-xs text-gray-600 uppercase">Thương hiệu</p>
                            <p className="text-base font-semibold text-gray-900">{product.brand?.toUpperCase() || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 uppercase">Chất liệu</p>
                            <p className="text-base font-semibold text-gray-900">{product.material || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 uppercase">Màu sắc</p>
                            <p className="text-base font-semibold text-gray-900">{product.color || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 uppercase">Giới tính</p>
                            <p className="text-base font-semibold text-gray-900">{product.gender}</p>
                        </div>
                    </div>

                    <p className="text-gray-700 text-base mb-6">{product.description}</p>

                    <div className="text-3xl font-bold text-blue-600 mb-8">
                        {formatPrice(product.price)}
                    </div>

                    <div className="mb-8">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Chọn Size</h3>
                        {availableSizes.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {availableSizes.map((ps) => (
                                    <button
                                        key={ps.id}
                                        onClick={() => onSelectSize(ps.id)}
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

                    <div className="mb-8">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Số lượng</h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onDecreaseQuantity}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
                            >
                                −
                            </button>
                            <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                            <button
                                onClick={onIncreaseQuantity}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button
                        ref={addToCartButtonRef}
                        onClick={handleAddToCartClick}
                        disabled={availableSizes.length === 0 || addedToCart}
                        className={`w-full py-4 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 ${addedToCart
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

                </div>
            </div>
        </div>
    );
}