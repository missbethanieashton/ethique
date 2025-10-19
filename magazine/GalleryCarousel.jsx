import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryCarousel({ images, startIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(null);
  const scrollRef = useRef(null);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 4));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, images.length - 4);
      return prev + 4 > maxIndex ? 0 : prev + 4;
    });
  };

  const visibleImages = images.slice(currentIndex, currentIndex + 4);

  return (
    <div className="relative my-12 group">
      {/* Navigation Arrows */}
      {images.length > 4 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-30 rounded-full"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>

          <button
            onClick={goToNext}
            disabled={currentIndex >= images.length - 4}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-30 rounded-full"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </>
      )}

      {/* Carousel */}
      <div className="grid grid-cols-4 gap-3">
        <AnimatePresence mode="wait">
          {visibleImages.map((image, index) => (
            <motion.div
              key={currentIndex + index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative aspect-[3/4] overflow-hidden bg-gray-900 cursor-pointer group/item"
              onMouseEnter={() => setIsHovered(currentIndex + index)}
              onMouseLeave={() => setIsHovered(null)}
            >
              {image.url.includes('.mp4') || image.url.includes('.mov') || image.url.includes('video') ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                >
                  <source src={image.url} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={image.url}
                  alt={image.caption || ""}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                />
              )}

              {/* Hover Overlay with Credits */}
              {isHovered === currentIndex + index && (image.source || image.caption) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end p-4"
                >
                  {image.source && (
                    <p className="text-white text-xs font-medium mb-1">
                      📷 {image.source}
                    </p>
                  )}
                  {image.caption && (
                    <p className="text-gray-300 text-xs line-clamp-2">
                      {image.caption}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress Indicators */}
      {images.length > 4 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(images.length / 4) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * 4)}
              className={`h-1 transition-all duration-300 ${
                Math.floor(currentIndex / 4) === index
                  ? "w-8 bg-white"
                  : "w-4 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}