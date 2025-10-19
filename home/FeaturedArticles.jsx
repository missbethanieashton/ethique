
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import KissMarkButton from "../magazine/KissMarkButton";

export default function FeaturedArticles({ articles, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-16">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-[16/10]" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        .afrah-text {
          font-family: 'Playfair Display', serif;
          font-weight: 400;
          letter-spacing: 0.05em;
        }
      `}</style>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="afrah-text text-4xl md:text-5xl text-center mb-16 uppercase tracking-wider"
      >
        Latest Stories
      </motion.h2>

      {articles.map((article, index) => {
        const isEven = index % 2 === 0;

        return (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={`grid md:grid-cols-2 gap-12 items-center ${
              isEven ? "" : "md:grid-flow-dense"
            }`}
          >
            <div className={`relative ${isEven ? "" : "md:col-start-2"}`}>
              <Link
                to={createPageUrl("Article") + `?id=${article.id}`}
                className="group relative overflow-hidden block"
              >
                <div className="aspect-[16/10] overflow-hidden bg-gray-900">
                  <img
                    src={article.hero_image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>

              <div className="absolute top-4 right-4 z-20">
                <KissMarkButton articleId={article.id} size={24} />
              </div>
            </div>

            <div className={`space-y-6 ${isEven ? "" : "md:col-start-1 md:row-start-1"}`}>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="uppercase tracking-widest">{article.category}</span>
                {article.read_time && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{article.read_time} min read</span>
                    </div>
                  </>
                )}
              </div>

              <Link to={createPageUrl("Article") + `?id=${article.id}`}>
                <h3 className="text-3xl md:text-4xl font-light leading-tight hover:text-gray-300 transition-colors">
                  {article.title}
                </h3>
              </Link>

              {article.subtitle && (
                <p className="text-lg text-gray-400 leading-relaxed line-clamp-3">
                  {article.subtitle}
                </p>
              )}

              {article.author && (
                <p className="text-sm text-gray-500">
                  By {article.author}
                </p>
              )}

              <Link
                to={createPageUrl("Article") + `?id=${article.id}`}
                className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-white hover:text-gray-300 transition-colors group"
              >
                <span>Read More</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
