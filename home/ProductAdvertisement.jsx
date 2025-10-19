import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ProductAdvertisement() {
  return (
    <section className="hidden md:block w-full bg-[#0d0d0d] py-20">
      <style>{`
        @keyframes illuminate {
          0%, 100% {
            box-shadow: 
              0 0 20px rgba(255, 255, 255, 0.4),
              0 0 40px rgba(255, 255, 255, 0.3),
              0 0 60px rgba(255, 255, 255, 0.2),
              0 8px 16px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: 
              0 0 30px rgba(255, 255, 255, 0.6),
              0 0 60px rgba(255, 255, 255, 0.4),
              0 0 90px rgba(255, 255, 255, 0.3),
              0 12px 24px rgba(0, 0, 0, 0.4);
          }
        }
        
        .illuminate-button {
          animation: illuminate 3s ease-in-out infinite;
          transform: perspective(1000px) translateZ(0);
          transition: all 0.3s ease;
        }
        
        .illuminate-button:hover {
          transform: perspective(1000px) translateZ(20px) scale(1.05);
          box-shadow: 
            0 0 40px rgba(255, 255, 255, 0.8),
            0 0 80px rgba(255, 255, 255, 0.6),
            0 0 120px rgba(255, 255, 255, 0.4),
            0 16px 32px rgba(0, 0, 0, 0.5);
        }
      `}</style>
      
      <div className="max-w-[1800px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-3 gap-0 overflow-hidden border border-white/10"
        >
          {/* Product Image Section - 2/3 width */}
          <div className="md:col-span-2 relative aspect-video md:aspect-auto bg-black/80 flex items-center justify-center p-12">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/a5b9a0950_Screenshot2025-10-10at91150PM.png"
              alt="Mele + Marie Basket"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Text Section - 1/3 width */}
          <div className="bg-[#1a1a1a] p-8 md:p-12 flex flex-col justify-center">
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">
              Featured Product
            </span>

            <h3 className="text-3xl md:text-4xl font-light mb-6 leading-tight">
              Luxury Timepiece Collection
            </h3>

            <p className="text-gray-400 leading-relaxed mb-8">
              Discover our exclusive collaboration with Mele + Marie. 
              Crafted with precision and timeless elegance.
            </p>

            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold">€1,200</span>
              </div>

              <p className="text-xs text-gray-500 uppercase tracking-wider">
                5% discount for members
              </p>

              <Button 
                onClick={() => window.open("https://www.meleandmarie.com/products/basket-elia?_pos=3&_sid=3d6b09693&_ss=r", "_blank")}
                className="illuminate-button w-full bg-white text-black hover:bg-white py-6 text-sm uppercase tracking-widest transition-all duration-300 group rounded-none"
                style={{ letterSpacing: '1px' }}
              >
                <span>Buy Now</span>
              </Button>
            </div>

            <p className="text-xs text-gray-600 mt-6 uppercase tracking-wider">
              Exclusive Collaboration • Worldwide Shipping
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}