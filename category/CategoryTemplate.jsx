
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import ArticleGrid from "../magazine/ArticleGrid";
import CategoryFilter from "../home/CategoryFilter";
import AnnouncementBar from "../home/AnnouncementBar";
import MembershipAd from "../home/MembershipAd"; // Import the new MembershipAd component

export default function CategoryTemplate({
  category,
  heroSlides = [],
  productBox = null
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // New: Fetch HeroSection data for the current category
  const { data: heroData, isLoading: heroLoading } = useQuery({
    queryKey: [`hero-section-${category}`],
    queryFn: async () => {
      const sections = await base44.entities.HeroSection.list();
      // Find the active hero section for the current page_name (category)
      return sections.find(s => s.page_name === category && s.active);
    },
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["articles", category],
    queryFn: async () => {
      const allArticles = await base44.entities.Article.list();
      return allArticles
        .filter(article => article.category === category && article.status === "published")
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    },
  });

  const { data: featured = [] } = useQuery({
    queryKey: ["featured"],
    queryFn: () => base44.entities.Featured.list("order", 9),
  });

  // Determine which hero slides to use: fetched data or default prop
  const effectiveHeroSlides = heroData && heroData.media_url
    ? [{ type: heroData.media_type, url: heroData.media_url }] // Use fetched hero data
    : []; // Fallback to an empty array to prevent flashing if data is not loaded

  // Determine which product box to use: fetched data or default prop
  const effectiveProductBox = heroData && heroData.product_carousel_enabled && heroData.product_carousel_image
    ? {
        image: heroData.product_carousel_image,
        label: heroData.product_carousel_label,
        title: heroData.product_carousel_title,
        subtitle: heroData.product_carousel_subtitle,
        price: heroData.product_carousel_price,
        link: heroData.product_carousel_link
      }
    : productBox;

  useEffect(() => {
    if (effectiveHeroSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % effectiveHeroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [effectiveHeroSlides.length]); // Dependency updated to effectiveHeroSlides.length

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + effectiveHeroSlides.length) % effectiveHeroSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % effectiveHeroSlides.length);
  };

  const displayArticles = articles.slice(0, 6);
  const featuredArticles = articles.filter(a =>
    featured.some(f => f.article_id === a.id)
  ).slice(0, 6);

  // Show a loading spinner if hero data is still loading or no effective slides are available yet
  if (heroLoading || effectiveHeroSlides.length === 0) {
    return (
      <div className="min-h-screen">
        <section className="relative h-screen w-full overflow-hidden bg-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Slider */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {effectiveHeroSlides[currentSlide]?.type === "video" ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                controls // Added controls attribute
                className="w-full h-full object-cover"
              >
                <source src={effectiveHeroSlides[currentSlide].url} type="video/mp4" />
              </video>
            ) : (
              <img
                src={effectiveHeroSlides[currentSlide]?.url}
                alt={category}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </motion.div>
        </AnimatePresence>

        {/* Category Title */}
        <div className="absolute top-1/3 left-0 right-0 text-center z-10 pt-32 md:pt-0">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-light uppercase tracking-wider"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
          >
            {category}
          </motion.h1>
        </div>

        {/* Navigation Arrows */}
        {effectiveHeroSlides.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 rounded-full"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 rounded-full"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </>
        )}

        {/* Product Box - Left aligned on mobile, centered on desktop */}
        {effectiveProductBox && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute bottom-8 left-6 md:left-1/2 md:-translate-x-1/2 z-30 w-full max-w-[calc(100%-3rem)] md:max-w-2xl"
          >
            <Link
              to={effectiveProductBox.link}
              className="group flex items-center bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden shadow-2xl"
            >
              <div className="relative w-32 h-40 flex-shrink-0 overflow-hidden">
                <img
                  src={effectiveProductBox.image}
                  alt={effectiveProductBox.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              <div className="flex-1 p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                    {effectiveProductBox.label}
                  </p>
                  <p className="text-lg font-light text-white mb-1">{effectiveProductBox.title}</p>
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    {effectiveProductBox.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-3xl font-semibold text-white">{effectiveProductBox.price}</p>

                  <style>{`
                    @keyframes illuminate {
                      0%, 100% {
                        box-shadow:
                          0 0 20px rgba(255, 255, 255, 0.4),
                          0 0 40px rgba(255, 255, 255, 0.3),
                          0 0 60px rgba(255, 255, 255, 0.2),
                          0 8px 16px rgba(0, 0, 0, 0.3);
                      }
                      50% {
                        box-shadow:
                          0 0 30px rgba(255, 255, 255, 0.6),
                          0 0 60px rgba(255, 255, 255, 0.4),
                          0 0 90px rgba(255, 255, 255, 0.3),
                          0 12px 24px rgba(0, 0, 0, 0.4);
                      }
                    }

                    .illuminate-box {
                      animation: illuminate 3s ease-in-out infinite;
                      transition: all 0.3s ease;
                    }

                    .illuminate-box:hover {
                      transform: scale(1.1) rotate(10deg);
                      box-shadow:
                        0 0 40px rgba(255, 255, 255, 0.8),
                        0 0 80px rgba(255, 255, 255, 0.6),
                        0 0 120px rgba(255, 255, 255, 0.4),
                        0 16px 32px rgba(0, 0, 0, 0.5);
                    }
                  `}</style>

                  <div className="illuminate-box w-12 h-12 bg-white text-black flex items-center justify-center">
                    <Plus size={24} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </section>

      {/* Category Filter Menu */}
      <CategoryFilter selectedCategory={category.toLowerCase()} />

      {/* Articles Grid - 6 articles */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : displayArticles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No articles available yet</p>
          </div>
        ) : (
          <ArticleGrid articles={displayArticles} />
        )}
      </section>

      {/* Membership Ad Banner */}
      <MembershipAd pageName={category} />

      {/* Featured Stories Carousel */}
      {featuredArticles.length > 0 && (
        <section className="w-full bg-[#0d0d0d] py-20">
          <div className="max-w-[1800px] mx-auto">
            <FeaturedCarousel articles={featuredArticles} />
          </div>
        </section>
      )}

      {/* Announcement Bar - Above Footer */}
      <AnnouncementBar />
    </div>
  );
}

function FeaturedCarousel({ articles }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [articles.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  const currentArticle = articles[currentIndex];

  return (
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
            className="relative aspect-[16/10] md:aspect-auto overflow-hidden group"
          >
            {currentArticle.hero_video ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                controls // Added controls attribute
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
          </Link>

          {/* Text Side */}
          <div className="bg-black p-8 md:p-16 flex flex-col justify-center">
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="uppercase tracking-widest">{currentArticle.category}</span>
            </div>

            <Link to={createPageUrl("Article") + `?id=${currentArticle.id}`}>
              <h3 className="text-3xl md:text-5xl font-light leading-tight hover:text-gray-300 transition-colors mb-6">
                {currentArticle.title}
              </h3>
            </Link>

            {currentArticle.subtitle && (
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                {currentArticle.subtitle}
              </p>
            )}

            {/* Carousel Indicators */}
            <div className="flex items-center gap-2 mt-8">
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
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 rounded-full"
      >
        <ChevronLeft size={24} className="text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 rounded-full"
      >
        <ChevronRight size={24} className="text-white" />
      </button>
    </div>
  );
}
