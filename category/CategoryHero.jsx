import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function CategoryHero({ category, description, featuredProduct }) {
  const categoryImages = {
    Fashion: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920",
    Art: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/45a88eb26_Screenshot2025-09-10at44525PM.png",
    Cuisine: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/d7c4c05c1_TaraKhattarlebanesechef.jpg",
    Travel: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920",
    Music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920",
  };

  return (
    <section className="relative h-[70vh] w-full overflow-hidden bg-black">
      {/* Background Image */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0"
      >
        <img
          src={categoryImages[category] || categoryImages.Fashion}
          alt={category}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
      </motion.div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl font-light mb-4 tracking-wide">
            {category}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-8">
            {description}
          </p>

          {featuredProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="inline-block bg-black/60 backdrop-blur-md border border-white/20 p-6 mt-8"
            >
              <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">
                Featured
              </p>
              <h3 className="text-2xl font-light mb-2">{featuredProduct.title}</h3>
              <p className="text-gray-400 mb-4">{featuredProduct.description}</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-xl font-semibold">{featuredProduct.price}</span>
                <Button className="bg-white text-black hover:bg-gray-200">
                  {featuredProduct.cta}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}