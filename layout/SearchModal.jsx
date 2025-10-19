import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArticles, setFilteredArticles] = useState([]);

  const { data: articles = [] } = useQuery({
    queryKey: ["all-articles"],
    queryFn: () => base44.entities.Article.list("-created_date"),
  });

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredArticles([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = articles
      .filter((article) => {
        const titleMatch = article.title.toLowerCase().includes(query);
        const subtitleMatch = article.subtitle?.toLowerCase().includes(query);
        const categoryMatch = article.category.toLowerCase().includes(query);
        return titleMatch || subtitleMatch || categoryMatch;
      })
      .slice(0, 8);

    setFilteredArticles(filtered);
  }, [searchQuery, articles]);

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md"
        onClick={handleClose}
      >
        <div className="max-w-3xl mx-auto px-6 pt-32">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute -top-12 right-0 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            {/* Search Input */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-white/5 border border-white text-white placeholder:text-gray-500 pl-12 py-6 text-lg rounded-none focus:border-white"
                style={{ borderWidth: '1px' }}
              />
            </div>

            {/* Search Results */}
            {searchQuery.trim() !== "" && (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-hide">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={createPageUrl("Article") + `?id=${article.id}`}
                      onClick={handleClose}
                      className="block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-4 transition-all duration-300 group"
                    >
                      <div className="flex gap-4">
                        <img
                          src={article.hero_image}
                          alt={article.title}
                          className="w-20 h-20 object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">
                            {article.category}
                          </span>
                          <h3 className="text-base font-light group-hover:text-gray-300 transition-colors line-clamp-2 mb-1">
                            {article.title}
                          </h3>
                          {article.subtitle && (
                            <p className="text-sm text-gray-400 line-clamp-1">
                              {article.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p>No articles found</p>
                    <p className="text-sm mt-2">Try searching for something else</p>
                  </div>
                )}
              </div>
            )}

            {searchQuery.trim() === "" && (
              <div className="text-center py-12 text-gray-400">
                <Search size={48} className="mx-auto mb-4 opacity-30" />
                <p>Start typing to search articles</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}