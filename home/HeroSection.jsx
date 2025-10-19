import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const { data: heroData, isLoading } = useQuery({
    queryKey: ["hero-section-home"],
    queryFn: async () => {
      const sections = await base44.entities.HeroSection.list();
      return sections.find(s => s.page_name === "Home" && s.active);
    },
  });

  if (isLoading || !heroData) {
    return (
      <section className="relative h-[70vh] md:h-screen w-full overflow-hidden bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[70vh] md:h-screen w-full overflow-hidden bg-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        @keyframes silkShimmer {
          0%, 100% {
            transform: scale(1.02) translateY(0);
            filter: brightness(1) contrast(1);
          }
          25% {
            transform: scale(1.03) translateY(-5px);
            filter: brightness(1.1) contrast(1.05);
          }
          50% {
            transform: scale(1.025) translateY(-8px);
            filter: brightness(1.15) contrast(1.08);
          }
          75% {
            transform: scale(1.03) translateY(-3px);
            filter: brightness(1.08) contrast(1.04);
          }
        }
        
        .silk-animation {
          animation: silkShimmer 8s ease-in-out infinite;
          will-change: transform, filter;
        }
        
        .afrah-text {
          font-family: 'Playfair Display', serif;
          font-weight: 400;
          letter-spacing: 0.05em;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="absolute inset-0"
      >
        {heroData.media_type === "video" ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover silk-animation"
          >
            <source src={heroData.media_url} type="video/mp4" />
          </video>
        ) : (
          <img
            src={heroData.media_url}
            alt="Luxury Fashion"
            className="w-full h-full object-cover silk-animation"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </motion.div>

      <div className="relative h-full flex flex-col justify-center px-4 md:px-16 pb-24 md:pb-32 z-20 max-w-[1800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="max-w-2xl"
        >
          <h1 
            className="afrah-text text-lg md:text-5xl lg:text-6xl text-white font-normal tracking-[0.1px] uppercase leading-tight mb-2 md:mb-6"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
          >
            {heroData.heading}
          </h1>
          
          <p className="text-xs md:text-xl text-white/90 font-light leading-relaxed mb-4 md:mb-8" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {heroData.subheading}
          </p>

          {heroData.button_text && (
            <Link to={heroData.button_link}>
              <Button 
                className="bg-transparent border border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-4 md:px-8 py-2 md:py-6 text-[10px] md:text-sm uppercase tracking-[0.2em] font-light rounded-none"
              >
                {heroData.button_text}
              </Button>
            </Link>
          )}
        </motion.div>
      </div>

      {heroData.product_carousel_enabled && heroData.product_carousel_image && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="hidden md:block absolute bottom-8 right-16 z-30 w-auto max-w-2xl"
        >
          <Link
            to={heroData.product_carousel_link}
            className="group flex flex-row items-stretch bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden shadow-2xl"
          >
            <div className="relative w-32 h-40 flex-shrink-0 overflow-hidden">
              <img
                src={heroData.product_carousel_image}
                alt={heroData.product_carousel_title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            <div className="flex-1 p-6 flex items-center justify-between min-w-0">
              <div className="min-w-0 flex-shrink">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                  {heroData.product_carousel_label}
                </p>
                <p className="text-lg font-light text-white mb-1 truncate">
                  {heroData.product_carousel_title}
                </p>
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  {heroData.product_carousel_subtitle}
                </p>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <p className="text-3xl font-semibold text-white">
                  {heroData.product_carousel_price}
                </p>
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-90">
                  <Plus size={24} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </section>
  );
}