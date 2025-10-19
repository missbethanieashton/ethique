
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import KissMarkButton from "./KissMarkButton";

export default function AIRecommendations({ user, currentArticleId }) {
  const scrollRef = useRef(null);

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ["ai-recommendations", user?.id, currentArticleId],
    queryFn: async () => {
      const allArticles = await base44.entities.Article.list("-created_date");
      
      // Filter out current article
      let filteredArticles = allArticles.filter(article => article.id !== currentArticleId);
      
      if (!user) {
        return filteredArticles.slice(0, 5);
      }

      const viewedArticles = user.articles_viewed || [];
      const wishlistedArticles = user.wishlisted_articles || [];
      
      const viewedArticleData = filteredArticles.filter(a => viewedArticles.includes(a.id));
      const preferredCategories = [...new Set(viewedArticleData.map(a => a.category))];
      
      let recommendations = filteredArticles.filter(article => 
        !viewedArticles.includes(article.id) &&
        !wishlistedArticles.includes(article.id) &&
        (preferredCategories.length === 0 || preferredCategories.includes(article.category))
      );

      if (recommendations.length < 5) {
        const moreArticles = filteredArticles.filter(article => 
          !viewedArticles.includes(article.id) &&
          !wishlistedArticles.includes(article.id) &&
          !recommendations.some(r => r.id === article.id)
        );
        recommendations = [...recommendations, ...moreArticles];
      }

      return recommendations.slice(0, 5);
    },
    enabled: !!currentArticleId,
  });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth / 5;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 pt-12 border-t border-white/10">
      <div className="mb-8 flex items-center gap-4">
        <h2 className="text-sm md:text-base font-light uppercase tracking-[0.2em]">
          AI Predicts You Might Like To Read These Articles Next
        </h2>
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="h-px bg-white/30 flex-1"></div>
          <ArrowRight size={16} className="text-white/50" />
        </div>
      </div>

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"
        >
          <ChevronRight size={20} className="text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-0 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {recommendations.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex-shrink-0 w-1/5 min-w-[200px] relative"
            >
              <Link
                to={createPageUrl("Article") + `?id=${article.id}`}
                className="group/card block relative aspect-[3/4] overflow-hidden bg-gray-900"
              >
                <img
                  src={article.hero_image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-4 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-500">
                  <span className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                    {article.category}
                  </span>
                  <h3 className="text-sm font-light leading-tight mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  {article.subtitle && (
                    <p className="text-xs text-gray-300 line-clamp-2">
                      {article.subtitle}
                    </p>
                  )}
                </div>

                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <KissMarkButton articleId={article.id} size={32} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
