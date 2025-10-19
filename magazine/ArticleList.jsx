import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function ArticleList({ articles }) {
  return (
    <div className="space-y-8">
      {articles.map((article, idx) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: idx * 0.1 }}
        >
          <Link
            to={createPageUrl("Article") + `?id=${article.id}`}
            className="group grid md:grid-cols-3 gap-6 items-center border-b border-white/10 pb-8"
          >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={article.hero_image}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            {/* Content */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="uppercase tracking-widest">{article.category}</span>
                {article.published_date && (
                  <>
                    <span>•</span>
                    <span>{format(new Date(article.published_date), "MMM d, yyyy")}</span>
                  </>
                )}
                {article.read_time && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{article.read_time} min</span>
                    </div>
                  </>
                )}
              </div>

              <h3 className="text-2xl font-light group-hover:text-gray-300 transition-colors">
                {article.title}
              </h3>

              {article.subtitle && (
                <p className="text-gray-400 line-clamp-2 leading-relaxed">
                  {article.subtitle}
                </p>
              )}

              {article.author && (
                <p className="text-sm text-gray-500">By {article.author}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-300 group-hover:text-white transition-colors">
                <span>Read More</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}