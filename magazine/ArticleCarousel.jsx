import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ArticleCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 4 >= images.length ? 0 : prev + 4));
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 4 < 0 ? Math.max(0, images.length - 4) : prev - 4));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 4 >= images.length ? 0 : prev + 4));
  };

  const visibleImages = images.slice(currentIndex, currentIndex + 4);

  return (
    <div className="relative my-12">
      <div className="grid grid-cols-4 gap-4">
        {visibleImages.map((image, index) => (
          <motion.div
            key={currentIndex + index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="aspect-[3/4] overflow-hidden group relative"
          >
            <img
              src={image.url}
              alt={image.caption || ""}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {image.caption && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm">{image.caption}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {images.length > 4 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-full transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-full transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}