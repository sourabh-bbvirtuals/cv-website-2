import { useEffect, useState, useRef, useCallback } from 'react';

interface MobileBannerSliderProps {
  mobileBanners: string[];
  altTexts?: string[]; // Optional prop for custom alt texts
}

export function MobileBannerSlider({
  mobileBanners,
  altTexts = [],
}: MobileBannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [bannerHeight, setBannerHeight] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPaused = useRef(false); // Track pause state

  // Validate URLs (basic check)
  const isValidBanners = mobileBanners.every(
    (url) => typeof url === 'string' && url.trim() !== '',
  );

  // Handle next slide
  const handleNext = useCallback(() => {
    if (!isPaused.current) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }
  }, []);

  // Auto-slide interval
  useEffect(() => {
    if (!isValidBanners || mobileBanners.length <= 1) return;

    intervalRef.current = setInterval(handleNext, 6500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mobileBanners.length, handleNext, isValidBanners]);

  // Handle infinite loop transitions
  useEffect(() => {
    if (!isValidBanners || mobileBanners.length <= 1) return;

    if (currentIndex === mobileBanners.length + 1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(1);
      }, 500); // Match CSS transition duration
    } else if (currentIndex === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(mobileBanners.length);
      }, 500);
    }
  }, [currentIndex, mobileBanners.length, isValidBanners]);

  // Debounced height calculation
  const updateHeight = useCallback(() => {
    if (sliderRef.current) {
      const currentImage = sliderRef.current.querySelector(
        `.slide-${currentIndex}`,
      ) as HTMLImageElement;
      if (currentImage?.offsetHeight) {
        setBannerHeight(currentImage.offsetHeight);
      }
    }
  }, [currentIndex]);

  // Handle height calculation and image loading
  useEffect(() => {
    if (!isValidBanners) return;

    updateHeight();

    const handleResize = () => {
      const timeout = setTimeout(updateHeight, 100); // Debounce resize
      return () => clearTimeout(timeout);
    };

    const images = sliderRef.current?.querySelectorAll('img');
    images?.forEach((img) => img.addEventListener('load', updateHeight));
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      images?.forEach((img) => img.removeEventListener('load', updateHeight));
    };
  }, [mobileBanners, currentIndex, updateHeight, isValidBanners]);

  // Handle dot click
  const handleDotClick = (index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index + 1);
    isPaused.current = true; // Pause on user interaction
    setTimeout(() => (isPaused.current = false), 10000); // Resume after 10s
  };

  // Pause on hover
  const handleMouseEnter = () => {
    isPaused.current = true;
  };

  const handleMouseLeave = () => {
    isPaused.current = false;
  };

  // Fallback UI for invalid or empty banners
  if (!isValidBanners || mobileBanners.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
        No banners available
      </div>
    );
  }

  // Disable slider for single banner
  if (mobileBanners.length === 1) {
    return (
      <div className="w-full mx-auto relative">
        <img
          src={mobileBanners[0]}
          alt={altTexts[0] || 'Banner 1'}
          className="w-full h-auto object-cover"
        />
        {/* <MobileSearchCard className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-[90%]" /> */}
      </div>
    );
  }

  return (
    <div
      className="relative w-full mx-auto"
      ref={sliderRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="overflow-hidden">
        <div
          className={`flex ${
            isTransitioning
              ? 'transition-transform duration-500 ease-in-out'
              : ''
          }`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {/* Cloned Last Slide */}
          <div className="w-full flex-shrink-0">
            <img
              src={mobileBanners[mobileBanners.length - 1]}
              alt={altTexts[mobileBanners.length - 1] || 'Banner Last Clone'}
              className="w-full h-auto object-cover slide-0"
            />
          </div>

          {/* Actual Slides */}
          {mobileBanners.map((src, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={src}
                alt={altTexts[index] || `Banner ${index + 1}`}
                className={`w-full h-auto object-cover slide-${index + 1}`}
              />
            </div>
          ))}

          {/* Cloned First Slide */}
          <div className="w-full flex-shrink-0">
            <img
              src={mobileBanners[0]}
              alt={altTexts[0] || 'Banner First Clone'}
              className={`w-full h-auto object-cover slide-${
                mobileBanners.length + 1
              }`}
            />
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 flex gap-2"
        style={{
          bottom: bannerHeight
            ? `${Math.max(bannerHeight * 0.1, 16)}px`
            : '24px',
        }}
      >
        {mobileBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex - 1 ? 'true' : 'false'}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentIndex - 1 ? 'bg-white w-20' : 'bg-gray-400 w-16'
            }`}
          />
        ))}
      </div>

      {/* Search Bar Positioned Below Image */}
      {/* <MobileSearchCard className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-[90%]" /> */}
    </div>
  );
}
