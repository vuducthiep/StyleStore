import React, { useState, useEffect } from 'react';
import banner1 from '../../../assets/banner1.png';
import banner2 from '../../../assets/banner2.png';
import banner3 from '../../../assets/banner3.png';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Promotion {
    id: number;
    code: string;
    name: string;
    description: string;
    discountPercent: number;
    maxDiscountAmount: number;
    minOrderAmount: number;
    startAt: string;
    endAt: string;
    isActive: boolean;
}

interface PromotionApiResponse {
    success: boolean;
    message: string;
    data: Promotion[];
}

// Generate random particles data once
const generateParticles = () => {
    return Array.from({ length: 6 }, (_, i) => ({
        id: i,
        width: Math.random() * 100 + 50,
        height: Math.random() * 100 + 50,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 10 + 15,
        delay: i * 0.5,
    }));
};

const particlesData = generateParticles();

// Particle component for background effect
const Particle: React.FC<{ particle: typeof particlesData[0] }> = ({ particle }) => {
    return (
        <div
            className="absolute rounded-full bg-purple-300/20 pointer-events-none"
            style={{
                width: particle.width + 'px',
                height: particle.height + 'px',
                left: particle.left + '%',
                top: particle.top + '%',
                animation: `float ${particle.duration}s infinite ease-in-out`,
                animationDelay: particle.delay + 's',
            }}
        />
    );
};

const Banner: React.FC = () => {
    const images = [banner1, banner2, banner3];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [promotionIndex, setPromotionIndex] = useState(0);
    const [promotionLoading, setPromotionLoading] = useState(true);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    // Auto slide every 3 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [images.length]);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setPromotionLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8080/api/user/promotions/available', {
                    headers: token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : undefined,
                });

                if (!response.ok) {
                    throw new Error('Không thể tải khuyến mãi');
                }

                const result: PromotionApiResponse = await response.json();
                setPromotions(result.data || []);
            } catch {
                setPromotions([]);
            } finally {
                setPromotionLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    useEffect(() => {
        if (promotions.length <= 1) return;

        const promotionTimer = setInterval(() => {
            setPromotionIndex((prev) => (prev + 1) % promotions.length);
        }, 2800);

        return () => clearInterval(promotionTimer);
    }, [promotions]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handleExplore = () => {
        window.scrollBy({
            top: 500,
            behavior: 'smooth',
        });
    };

    const goToPreviousPromotion = () => {
        if (promotions.length === 0) return;
        setPromotionIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
    };

    const goToNextPromotion = () => {
        if (promotions.length === 0) return;
        setPromotionIndex((prev) => (prev + 1) % promotions.length);
    };

    const activePromotion = promotions[promotionIndex];

    return (
        <>
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.15;
                    }
                    90% {
                        opacity: 0.3;
                    }
                    100% {
                        transform: translateY(-100vh) translateX(100px);
                        opacity: 0;
                    }
                }
                
                @keyframes fadeUp {
                    0% {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInRight {
                    0% {
                        opacity: 0;
                        transform: translateX(40px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes hotBlink {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.5;
                        transform: scale(1.05);
                    }
                }

                .promo-shine {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 3s infinite;
                }

                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }

                .hot-badge {
                    animation: hotBlink 1.2s ease-in-out infinite;
                }
            `}</style>

            <div className="w-full relative overflow-hidden bg-white">
                {/* Subtle Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 pointer-events-none" />

                {/* Animated Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {particlesData.map((particle) => (
                        <Particle key={particle.id} particle={particle} />
                    ))}
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 min-h-[500px] relative z-10">
                    {/* Left Section - Text & Promotion */}
                    <div className="w-full space-y-6 flex flex-col items-center lg:items-start">
                        {/* Title */}
                        <div className="w-full flex flex-col items-center lg:items-start" style={{ animation: 'fadeUp 0.8s ease 0s both' }}>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
                                StyleWearVN
                            </h1>
                            
                        </div>

                        {/* Promotion Card */}
                        <div
                            className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-visible promo-shine"
                            style={{ animation: 'fadeUp 0.8s ease 0.1s both' }}
                        >
                            <div className="relative p-6">
                                {/* Navigation Buttons */}
                                {promotions.length > 1 && (
                                    <>
                                        <button
                                            onClick={goToPreviousPromotion}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-gray-100 hover:bg-purple-600 hover:text-white text-gray-700 rounded-full p-2 transition-all"
                                            aria-label="Khuyến mãi trước"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={goToNextPromotion}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-gray-100 hover:bg-purple-600 hover:text-white text-gray-700 rounded-full p-2 transition-all"
                                            aria-label="Khuyến mãi tiếp theo"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </>
                                )}

                                {/* HOT Badge */}
                                {!promotionLoading && activePromotion && (
                                    <div className="absolute -top-2 -right-2 z-50">
                                        <div className="relative inline-flex">
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 transition duration-1000"></div>
                                            <div className="relative px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold text-sm shadow-lg hot-badge">
                                                -{activePromotion.discountPercent}%
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pr-8 pl-8">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-purple-600 mb-3">
                                        ✨ Ưu đãi hôm nay
                                    </p>

                                    {promotionLoading ? (
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
                                        </div>
                                    ) : activePromotion ? (
                                        <>
                                            <p className="font-bold text-lg text-purple-600 mb-2">{activePromotion.code}</p>
                                            <p className="text-sm font-semibold text-gray-900 mb-1">{activePromotion.name}</p>
                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{activePromotion.description}</p>
                                            <div className="pt-3 border-t border-gray-100">
                                                <p className="text-xs text-gray-500">
                                                    Tối thiểu <span className="font-semibold text-gray-700">{formatPrice(activePromotion.minOrderAmount)}</span> · Giảm tối đa <span className="font-semibold text-gray-700">{formatPrice(activePromotion.maxDiscountAmount)}</span>
                                                </p>
                                            </div>
                                            {promotions.length > 1 && (
                                                <div className="mt-3 flex gap-1.5">
                                                    {promotions.map((promotion, index) => (
                                                        <span
                                                            key={promotion.id}
                                                            className={`h-1.5 rounded-full transition-all ${index === promotionIndex ? 'w-6 bg-purple-600' : 'w-2 bg-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-600">Hiện chưa có khuyến mãi khả dụng.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={handleExplore}
                            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            style={{ animation: 'fadeUp 0.8s ease 0.2s both' }}
                        >
                            ↓ Khám Phá Ngay
                        </button>
                    </div>

                    {/* Right Section - Carousel */}
                    <div className="w-full relative group" style={{ animation: 'slideInRight 0.8s ease 0.25s both' }}>
                        {/* Main Image Container */}
                        <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`absolute w-full h-full transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    <img
                                        src={image}
                                        alt={`Banner ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}

                            {/* Navigation Buttons */}
                            <button
                                onClick={goToPrevious}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 transition-all opacity-0 group-hover:opacity-100 shadow-lg hover:shadow-xl"
                                aria-label="Ảnh trước"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <button
                                onClick={goToNext}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 transition-all opacity-0 group-hover:opacity-100 shadow-lg hover:shadow-xl"
                                aria-label="Ảnh tiếp theo"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Dots Navigation */}
                        <div className="flex justify-center gap-2 mt-6">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`transition-all duration-300 ${index === currentIndex
                                        ? 'bg-purple-600 w-8 h-2.5 rounded-full'
                                        : 'bg-gray-300 w-2.5 h-2.5 rounded-full hover:bg-gray-400'
                                        }`}
                                    aria-label={`Đi đến ảnh ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Banner;
