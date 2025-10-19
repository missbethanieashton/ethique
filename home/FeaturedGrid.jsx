
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import KissMarkButton from "../magazine/KissMarkButton";

export default function FeaturedGrid({ featured, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-0">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] md:aspect-[3/4]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-0">
      {featured.map((feature, index) => (
        <div
          key={feature.id}
          className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-[#1a1a1a]"
        >
          <Link
            to={
              feature.article_id
                ? createPageUrl("Article") + `?id=${feature.article_id}`
                : "#"
            }
            className="absolute inset-0"
          >
            {/* Image/Video */}
            <div className="absolute inset-0">
              {feature.video ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-40"
                >
                  <source src={feature.video} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={feature.thumbnail}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-40"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Type Badge */}
            <div className="absolute top-4 md:top-6 left-4 md:left-6 z-10">
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/60 px-2 md:px-3 py-1 border border-white/20 backdrop-blur-sm">
                {feature.type}
              </span>
            </div>

            {/* Title on Hover */}
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 md:mb-3">
                {feature.type}
              </span>
              <h3 className="text-lg md:text-2xl lg:text-3xl font-serif leading-tight text-white mb-2 md:mb-4">
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-300 line-clamp-2 leading-relaxed">
                {feature.excerpt}
              </p>
            </div>
          </Link>

          {/* Wishlist Icon - Top Right - Outside Link */}
          {feature.article_id && (
            <div className="absolute top-4 md:top-6 right-4 md:right-6 z-30">
              <KissMarkButton articleId={feature.article_id} size={32} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
