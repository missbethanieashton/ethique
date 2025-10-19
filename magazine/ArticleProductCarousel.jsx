import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ArticleProductCarousel({ products }) {
  return (
    <div className="grid grid-cols-4 gap-4 my-12">
      {products.map((product, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white/5 border border-white/10 overflow-hidden group"
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="p-4">
            <h3 className="text-white font-medium mb-2">{product.title}</h3>
            {product.price && (
              <p className="text-gray-400 mb-3">{product.price}</p>
            )}
            <a href={product.url} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-white text-black hover:bg-gray-200">
                {product.button_text || "Buy Now"}
              </Button>
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}