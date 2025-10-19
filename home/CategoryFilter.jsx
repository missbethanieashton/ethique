import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categories = [
  { name: "All", page: "Home" },
  { name: "Fashion", page: "Fashion" },
  { name: "Art", page: "Art" },
  { name: "Cuisine", page: "Cuisine" },
  { name: "Travel", page: "Travel" },
  { name: "Music", page: "Music" },
  { name: "Beauty", page: "Beauty" },
];

export default function CategoryFilter({ selectedCategory }) {
  return (
    <section className="sticky top-14 md:top-16 z-30 bg-[#0d0d0d]/95 backdrop-blur-sm border-b border-white/5 py-4 md:py-6">
      <div className="max-w-[1800px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-start md:justify-center gap-4 md:gap-8 overflow-x-auto scrollbar-hide">
          {categories.map((category) => {
            const isActive = selectedCategory === category.name.toLowerCase();

            return (
              <Link
                key={category.name}
                to={createPageUrl(category.page)}
                className={`text-[10px] md:text-xs uppercase tracking-[0.2em] transition-colors duration-300 whitespace-nowrap pb-1 border-b-2 ${
                  isActive
                    ? "text-white border-white"
                    : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}