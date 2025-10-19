import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function CategoryThumbnails() {
  const { data: thumbnails = [], isLoading } = useQuery({
    queryKey: ["category-thumbnails"],
    queryFn: async () => {
      const all = await base44.entities.CategoryThumbnail.list("order");
      return all.filter(t => t.active);
    },
  });

  if (isLoading || thumbnails.length === 0) {
    return null;
  }

  return (
    <section className="w-full relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lacquer&display=swap');
        
        .lacquer-text {
          font-family: 'Lacquer', system-ui;
          font-weight: 400;
          letter-spacing: 0.05em;
        }
        
        @keyframes liquidRipple {
          0%, 100% {
            transform: translateY(0) scale(1);
            filter: hue-rotate(0deg) brightness(0.7) contrast(1.2);
          }
          25% {
            transform: translateY(-8px) scale(1.02);
            filter: hue-rotate(5deg) brightness(0.75) contrast(1.15);
          }
          50% {
            transform: translateY(-5px) scale(1.01);
            filter: hue-rotate(-5deg) brightness(0.7) contrast(1.25);
          }
          75% {
            transform: translateY(-10px) scale(1.03);
            filter: hue-rotate(3deg) brightness(0.72) contrast(1.18);
          }
        }
        
        .liquid-background {
          animation: liquidRipple 8s ease-in-out infinite;
          will-change: transform, filter;
        }
      `}</style>
      
      {/* Liquid Chrome Background */}
      <div 
        className="absolute inset-0 liquid-background"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/aae14933b_Screenshot2025-10-10at113645PM.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
          zIndex: 1,
        }}
      />
      
      <div className="max-w-[1800px] mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
          {thumbnails.map((thumbnail, index) => (
            <motion.div
              key={thumbnail.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <Link
                to={createPageUrl("Article") + `?id=${thumbnail.article_id}`}
                className="group block relative aspect-square overflow-hidden bg-black"
              >
                <img
                  src={thumbnail.image}
                  alt={thumbnail.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-30"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="lacquer-text text-base md:text-2xl font-normal uppercase text-white transition-all duration-300 group-hover:scale-125 md:group-hover:scale-150" style={{ letterSpacing: '1px' }}>
                    {thumbnail.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}