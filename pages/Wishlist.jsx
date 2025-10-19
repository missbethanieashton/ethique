
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ArticleGrid from "../components/magazine/ArticleGrid";
import AIRecommendations from "../components/magazine/AIRecommendations";

const categories = ["All", "Fashion", "Art", "Cuisine", "Travel", "Music", "Beauty"];

export default function Wishlist() {
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    checkAuth();
  }, []);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const wishlist = user.wishlisted_articles || [];
      if (wishlist.length === 0) return [];
      
      const allArticles = await base44.entities.Article.list();
      return allArticles.filter(article => wishlist.includes(article.id));
    },
    enabled: !!user,
  });

  const filteredArticles = selectedCategory === "All" 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-32 px-6">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-light mb-8">Saved Articles</h1>
          </div>

          {/* Category Filter */}
          {articles.length > 0 && (
            <div className="flex items-center justify-center gap-4 md:gap-6 mb-12 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`text-xs uppercase tracking-[0.2em] transition-colors duration-300 pb-1 border-b-2 ${
                    selectedCategory === category
                      ? "text-white border-white"
                      : "text-gray-500 border-transparent hover:text-gray-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {articles.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="mb-4">Your saved articles list is empty</p>
              <p className="text-sm">Click the lips icon on any article to save it here</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p>No articles in this category</p>
            </div>
          ) : (
            <ArticleGrid articles={filteredArticles} />
          )}

          {/* AI Recommendations */}
          <AIRecommendations user={user} />
        </motion.div>
      </div>
    </div>
  );
}
