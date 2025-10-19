import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedStories({ featured, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-16">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="grid md:grid-cols-2 gap-8 items-center">
            <Skeleton className="aspect-[4/3]" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-32">
      {featured.map((feature, index) => {
        const isEven = index % 2 === 0;

        return (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`grid md:grid-cols-2 gap-12 items-center ${
              isEven ? "" : "md:grid-flow-dense"
            }`}
          >
            {/* Image */}
            <motion.div
              className={`relative group overflow-hidden ${
                isEven ? "" : "md:col-start-2"
              }`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={feature.thumbnail}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Type Badge */}
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 text-sm tracking-widest uppercase bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                  {feature.type}
                </span>
              </div>
            </motion.div>

            {/* Content */}
            <div className={`space-y-6 ${isEven ? "" : "md:col-start-1 md:row-start-1"}`}>
              <motion.div
                initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="text-sm tracking-widest text-purple-400 uppercase block mb-4">
                  {feature.type}
                </span>

                <h3 className="text-4xl md:text-5xl font-light mb-6 leading-tight">
                  {feature.title}
                </h3>

                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  {feature.excerpt}
                </p>

                {feature.article_id ? (
                  <Link to={createPageUrl("Article") + `?id=${feature.article_id}`}>
                    <Button className="group bg-transparent border border-purple-400/30 hover:bg-purple-600/20 hover:border-purple-400 text-white px-8 py-6 rounded-full transition-all duration-300">
                      <span className="mr-2 tracking-wider">READ MORE</span>
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    disabled
                    className="bg-transparent border border-gray-600/30 text-gray-600 px-8 py-6 rounded-full"
                  >
                    <span className="mr-2 tracking-wider">COMING SOON</span>
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}