
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import KissMarkButton from "./KissMarkButton";

export default function ArticleGrid({ articles }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article, index) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <Link
            to={createPageUrl("Article") + `?id=${article.id}`}
            className="group block"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-900 mb-4">
              {article.thumbnail_video ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls // Added controls attribute here
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                >
                  <source src={article.thumbnail_video} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={article.thumbnail_image || article.hero_image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Kiss Mark Button - Top Right */}
              <div className="absolute top-4 right-4 z-10">
                <KissMarkButton articleId={article.id} size={32} />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-gray-500">
                {article.category}
              </span>
              <h3 className="text-xl font-light leading-tight group-hover:text-gray-300 transition-colors">
                {article.title}
              </h3>
              {article.subtitle && (
                <p className="text-sm text-gray-400 line-clamp-2">
                  {article.subtitle}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {article.read_time && (
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{article.read_time} min</span>
                  </div>
                )}
                {article.published_date && (
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{format(new Date(article.published_date), "MMM d")}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
