import React, { useState, useEffect } from 'react';
import banner1 from '../../../assets/banner1.png';
import banner2 from '../../../assets/banner2.png';
import banner3 from '../../../assets/banner3.png';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

    // Auto slide every 3 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [images.length]);

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
            top: 390,
            behavior: 'smooth',
        });
    };

    return (
        <>
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.5;
                    }
                    50% {
                        opacity: 0.3;
                    }
                    90% {
                        opacity: 0.5;
                    }
                    100% {
                        transform: translateY(-100vh) translateX(100px);
                        opacity: 0;
                    }
                }
                
                @keyframes gradientShift {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
                
                .gradient-animated {
                    background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
                    background-size: 400% 400%;
                    animation: gradientShift 15s ease infinite;
                }

                @keyframes fadeUp {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

            <div className="w-full max-h-[400px] relative overflow-hidden">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 gradient-animated opacity-20" />

                {/* Particle Background */}
                <div className="absolute inset-0 overflow-hidden">
                    {particlesData.map((particle) => (
                        <Particle key={particle.id} particle={particle} />
                    ))}
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-between gap-12 h-full relative z-10">
                    {/* Left Section - Text Introduction */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h1
                                className="h-14 text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3"
                                style={{ animation: 'fadeUp 0.8s ease 0s both' }}
                            >
                                StyleStore
                            </h1>
                            <p
                                className="text-lg text-slate-700 leading-relaxed"
                                style={{ animation: 'fadeUp 0.8s ease 0.1s both' }}
                            >
                                Khám phá bộ sưu tập thời trang hiện đại, phong cách và chất lượng cao. Chúng tôi mang đến những xu hướng mới nhất từ các thương hiệu hàng đầu, giúp bạn tỏa sáng trong mọi dịp.
                            </p>
                        </div>
                        <div className="flex gap-4" style={{ animation: 'fadeUp 0.8s ease 0.2s both' }}>
                            <button
                                onClick={handleExplore}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                            >
                                Khám Phá Ngay
                            </button>
                        </div>
                    </div>

                    {/* Right Section - Image Carousel */}
                    <div className="flex-1 relative group" style={{ animation: 'fadeUp 0.9s ease 0.25s both' }}>
                        {/* Image Container */}
                        <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-2xl">
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`absolute w-full h-full transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    <img
                                        src={image}
                                        alt={`Banner ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}

                            {/* Previous Button */}
                            <button
                                onClick={goToPrevious}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-slate-800 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Next Button */}
                            <button
                                onClick={goToNext}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-slate-800 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Dots Navigation */}
                        <div className="flex justify-center gap-2 mt-4">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-purple-600 w-8'
                                        : 'bg-slate-300 hover:bg-slate-400'
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
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
