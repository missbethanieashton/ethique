
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import KissMarkButton from "../magazine/KissMarkButton";

export default function CreatorCultureCarousel({ creators, isLoading }) {
  const scrollRef = useRef(null);
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.6;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-[20px] px-6 py-8">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-1/5 h-[500px] flex-shrink-0" />
        ))}
      </div>
    );
  }

  // Filter to only show Creators type
  const validCreators = creators.filter(creator => creator.type === "Creators");

  if (!validCreators || validCreators.length === 0) {
    return (
      <div className="text-center py-12 text-white">
        <p className="mb-2">No creator content available yet.</p>
        <p className="text-sm text-gray-400">Add Creator features in the dashboard to display them here.</p>
      </div>
    );
  }

  const displayCreators = validCreators.slice(0, 8);

  return (
    <div className="relative group">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&display=swap');
        
        .polaroid-vintage {
          position: relative;
        }
        
        .polaroid-vintage::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(135deg, rgba(255, 240, 200, 0.05) 0%, transparent 50%),
            linear-gradient(45deg, rgba(139, 115, 85, 0.08) 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
        }
        
        .polaroid-vintage::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(0, 0, 0, 0.05) 0%, transparent 50%);
          mix-blend-mode: overlay;
          pointer-events: none;
          z-index: 2;
        }
        
        .polaroid-image {
          filter: sepia(0.1) contrast(0.95) brightness(0.98);
        }
      `}</style>

      <button
        onClick={() => scroll("left")}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"
      >
        <ChevronLeft size={24} className="text-white" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"
      >
        <ChevronRight size={24} className="text-white" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-[12px] md:gap-[20px] overflow-x-auto scrollbar-hide scroll-smooth px-4 md:px-6 py-16 md:py-20"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {displayCreators.map((creator, index) => {
          const randomRotation = (index % 5 - 2) * 1.5;

          return (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex-shrink-0 w-[70%] md:w-[calc(20%-16px)]"
              style={{
                transform: `rotate(${randomRotation}deg)`,
                minWidth: '240px',
              }}
            >
              <div className="relative h-full">
                <Link
                  to={
                    creator.article_id
                      ? createPageUrl("Article") + `?id=${creator.article_id}`
                      : "#"
                  }
                  className="block group/card h-full"
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      rotate: randomRotation + 2,
                      y: -12,
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-white p-4 pb-20 h-full polaroid-vintage"
                    style={{
                      boxShadow: `
                        0 10px 30px rgba(0,0,0,0.15),
                        0 4px 12px rgba(0,0,0,0.1),
                        0 1px 3px rgba(0,0,0,0.08)
                      `,
                      transform: 'perspective(1000px)',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="overflow-hidden relative bg-gray-50 mb-3 aspect-[3/4]">
                      {creator.video ? (
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105 polaroid-image"
                        >
                          <source src={creator.video} type="video/mp4" />
                        </video>
                      ) : (
                        <img
                          src={creator.thumbnail}
                          alt={creator.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105 polaroid-image"
                        />
                      )}
                    </div>

                    <div className="relative px-1 z-10">
                      <h3 className="text-sm font-medium text-black text-center line-clamp-1 leading-tight mb-2">
                        {creator.title}
                      </h3>
                      
                      {creator.excerpt && (
                        <p className="text-xs text-gray-700 text-center line-clamp-2 leading-snug mb-3">
                          {creator.excerpt}
                        </p>
                      )}
                      
                      {creator.location && (
                        <p 
                          className="absolute -bottom-14 left-0 text-base text-gray-700"
                          style={{ fontFamily: "'Covered By Your Grace', cursive" }}
                        >
                          {creator.location}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </Link>

                {creator.article_id && (
                  <div className="absolute -top-4 -right-4 z-30" style={{ transform: `rotate(-${randomRotation}deg)` }}>
                    <KissMarkButton articleId={creator.article_id} size={56} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
