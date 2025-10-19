import React from "react";
import { motion } from "framer-motion";

export default function ArticleGallery({ images }) {
  return (
    <div className="grid grid-cols-4 gap-0 my-12">
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="aspect-[3/4] overflow-hidden group relative"
        >
          <img
            src={image.url}
            alt={image.caption || ""}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {image.source && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3">
              <p className="text-white text-xs">© {image.source}</p>
            </div>
          )}
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3">
              <p className="text-white text-xs">{image.caption}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}