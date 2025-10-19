import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MenuCarousel({ ads }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!ads || ads.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [ads]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  if (!ads || ads.length === 0) {
    return (
      <div className="flex items-center gap-6">
        <div className="w-48 aspect-[4/5] bg-white/5 animate-pulse" />
        <div className="flex flex-col justify-center">
          <div className="h-4 w-32 bg-white/5 animate-pulse mb-2" />
          <div className="h-3 w-20 bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  const currentAd = ads[currentIndex];

  // Determine the link destination
  const getAdLink = () => {
    if (currentAd.link_type === "external" && currentAd.external_link) {
      return currentAd.external_link;
    }
    if (currentAd.article_id) {
      return createPageUrl("Article") + `?id=${currentAd.article_id}`;
    }
    return "#";
  };

  const isExternalLink = currentAd.link_type === "external" && currentAd.external_link;

  return (
    <div className="relative group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
        >
          {isExternalLink ? (
            <a 
              href={getAdLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="group/card flex gap-6"
            >
              <div className="w-48 aspect-[4/5] overflow-hidden flex-shrink-0">
                {currentAd.video_url ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                  >
                    <source src={currentAd.video_url} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={currentAd.image}
                    alt={currentAd.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center flex-1">
                <h4 className="text-base font-light text-white mb-2 group-hover/card:text-gray-300 transition-colors">
                  {currentAd.title}
                </h4>
                <p className="text-sm text-gray-500">{currentAd.subtitle || "by Éthique"}</p>
              </div>
            </a>
          ) : (
            <Link 
              to={getAdLink()}
              className="group/card flex gap-6"
            >
              <div className="w-48 aspect-[4/5] overflow-hidden flex-shrink-0">
                {currentAd.video_url ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                  >
                    <source src={currentAd.video_url} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={currentAd.image}
                    alt={currentAd.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center flex-1">
                <h4 className="text-base font-light text-white mb-2 group-hover/card:text-gray-300 transition-colors">
                  {currentAd.title}
                </h4>
                <p className="text-sm text-gray-500">{currentAd.subtitle || "by Éthique"}</p>
              </div>
            </Link>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {ads.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 w-8 h-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"
          >
            <ChevronLeft size={16} className="text-white" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-10 w-8 h-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"
          >
            <ChevronRight size={16} className="text-white" />
          </button>
        </>
      )}

      {/* Indicators */}
      {ads.length > 1 && (
        <div className="flex items-center gap-1 mt-4">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 transition-all duration-300 ${
                index === currentIndex
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