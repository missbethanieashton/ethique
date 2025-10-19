import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const categories = ["all", "Fashion", "Art", "Cuisine", "Travel", "Music"];

export default function CategoryFilter({ selectedCategory }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="sticky top-0 z-30 blur-gradient border-b border-white/5 py-6"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center gap-8 overflow-x-auto scrollbar-hide">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            const url =
              category === "all"
                ? createPageUrl("Home")
                : createPageUrl("Home") + `?category=${category}`;

            return (
              <Link
                key={category}
                to={url}
                className="relative group"
              >
                <span
                  className={`text-sm tracking-widest uppercase font-light transition-colors duration-300 whitespace-nowrap ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-purple-300"
                  }`}
                >
                  {category}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="categoryUnderline"
                    className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}