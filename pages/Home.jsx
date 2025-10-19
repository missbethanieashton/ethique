
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

import HeroSection from "../components/home/HeroSection";
import CategoryFilter from "../components/home/CategoryFilter";
import CategoryThumbnails from "../components/home/CategoryThumbnails";
import FeaturedGrid from "../components/home/FeaturedGrid";
import LatestStoriesCarousel from "../components/home/LatestStoriesCarousel";
import MembershipAd from "../components/home/MembershipAd";
import CreatorCultureCarousel from "../components/home/CreatorCultureCarousel";
import ProductAdvertisement from "../components/home/ProductAdvertisement";
import AnnouncementBar from "../components/home/AnnouncementBar";

export default function Home() {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "all";
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data: featured = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ["featured"],
    queryFn: () => base44.entities.Featured.list("order", 9),
  });

  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.list("-created_date", 6),
  });

  // Filter to ONLY get Creators type items
  const creators = featured.filter((item) => item.type === "Creators");

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative bg-[#0d0d0d]">
      <HeroSection />
      <CategoryFilter selectedCategory={selectedCategory} />
      <section className="max-w-[1800px] mx-auto">
        <FeaturedGrid featured={featured} isLoading={loadingFeatured} />
      </section>
      
      <AnnouncementBar />
      
      <MembershipAd pageName="Home" />
      
      <LatestStoriesCarousel articles={articles} isLoading={loadingArticles} />
      
      {/* Only show Creator section if there are valid Creators items */}
      {creators.length > 0 && (
        <section className="w-full py-[20px] md:py-[10px] overflow-visible relative min-h-[600px] md:min-h-[500px]">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/aae14933b_Screenshot2025-10-10at113645PM.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.7) contrast(1.2)',
            }}
          />

          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
            }}
          />

          <div className="relative z-10">
            <CreatorCultureCarousel creators={creators} isLoading={loadingFeatured} />
          </div>
        </section>
      )}
      
      <ProductAdvertisement />
      
      <CategoryThumbnails />
      
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0,
        }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300"
      >
        <ArrowUp size={20} />
      </motion.button>
    </div>
  );
}
