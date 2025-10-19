import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openImage = (index) => {
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  return (
    <>
      {/* Gallery Grid - Portrait format, 5 per row, 2 rows */}
      <div className="grid grid-cols-5 gap-2 mt-20">
        {images.slice(0, 10).map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="aspect-[3/4] overflow-hidden cursor-pointer group"
            onClick={() => openImage(index)}
          >
            <img
              src={image.url}
              alt={image.caption || `Gallery image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </motion.div>
        ))}
      </div>

      {/* Show remaining images if more than 10 */}
      {images.length > 10 && (
        <div className="grid grid-cols-5 gap-2 mt-2">
          {images.slice(10, 20).map((image, index) => (
            <motion.div
              key={index + 10}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="aspect-[3/4] overflow-hidden cursor-pointer group"
              onClick={() => openImage(index + 10)}
            >
              <img
                src={image.url}
                alt={image.caption || `Gallery image ${index + 11}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
            onClick={closeImage}
          >
            {/* Close Button */}
            <button
              onClick={closeImage}
              className="absolute top-6 right-6 z-[70] p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-[70] w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-full transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-[70] w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-full transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-7xl max-h-[90vh] w-full"
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.caption || ""}
                className="w-full h-full object-contain"
              />
              {selectedImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-sm text-gray-300 text-center">
                    {selectedImage.caption}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <span className="text-sm">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}