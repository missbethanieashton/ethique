import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function PolicyPopup({ isOpen, onClose, title, content }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50"
          />

          {/* Popup from bottom - 80% height */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "20%" }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-x-0 bottom-0 h-[80vh] bg-[#0d0d0d] border-t border-white/20 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0d0d0d] border-b border-white/10 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-light">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 transition-colors rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content with extra bottom padding */}
            <div className="h-[calc(100%-80px)] overflow-y-auto px-8 py-8 pb-40">
              <div className="max-w-4xl mx-auto prose prose-invert prose-sm">
                {content}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}