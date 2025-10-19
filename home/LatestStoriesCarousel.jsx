
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import KissMarkButton from "../magazine/KissMarkButton";

export default function LatestStoriesCarousel({ articles, isLoading }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!articles || articles.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [articles]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[500px]">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  const currentArticle = articles[currentIndex];

  return (
    <section className="relative w-full bg-[#0d0d0d] overflow-hidden py-20 md:py-32">
      <div className="max-w-[1800px] mx-auto">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 gap-0"
            >
              {/* Image Side */}
              <Link
                to={createPageUrl("Article") + `?id=${currentArticle.id}`}
                className="relative h-[400px] md:h-[600px] overflow-hidden group"
              >
                {currentArticle.hero_video ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  >
                    <source src={currentArticle.hero_video} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={currentArticle.hero_image}
                    alt={currentArticle.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60 md:to-black/40" />
                
                {/* Wishlist Button */}
                <div className="absolute top-4 md:top-6 right-4 md:right-6 z-20">
                  <KissMarkButton articleId={currentArticle.id} size={40} />
                </div>
              </Link>

              {/* Text Side */}
              <div className="bg-black p-3 md:p-12 lg:p-20 flex flex-col justify-center h-[400px] md:h-[600px]">
                <div className="flex items-center gap-4 text-xs md:text-sm text-gray-400 mb-3 md:mb-4">
                  <span className="uppercase tracking-widest">{currentArticle.category}</span>
                  {currentArticle.read_time && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="md:w-3.5 md:h-3.5" />
                        <span>{currentArticle.read_time} min read</span>
                      </div>
                    </>
                  )}
                </div>

                <Link to={createPageUrl("Article") + `?id=${currentArticle.id}`}>
                  <h3 className="text-2xl md:text-3xl lg:text-5xl font-light leading-tight hover:text-gray-300 transition-colors mb-4 md:mb-6">
                    {currentArticle.title}
                  </h3>
                </Link>

                {currentArticle.subtitle && (
                  <p className="text-base md:text-lg text-gray-400 leading-relaxed mb-4 md:mb-6">
                    {currentArticle.subtitle}
                  </p>
                )}

                <div className="flex items-center justify-between flex-wrap gap-3">
                  {currentArticle.author && (
                    <p className="text-xs md:text-sm text-gray-500">
                      By {currentArticle.author}
                    </p>
                  )}

                  {currentArticle.published_date && (
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                      <Calendar size={12} className="md:w-3.5 md:h-3.5" />
                      <span>{format(new Date(currentArticle.published_date), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                {/* Carousel Indicators */}
                <div className="flex items-center gap-2 mt-6 md:mt-8">
                  {articles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-1 transition-all duration-300 ${
                        index === currentIndex
                          ? "w-12 bg-white"
                          : "w-8 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 rounded-full"
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6 text-white" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 rounded-full"
          >
            <ChevronRight size={20} className="md:w-6 md:h-6 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}
