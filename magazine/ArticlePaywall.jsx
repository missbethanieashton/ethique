import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function ArticlePaywall({ onClose }) {
  const handleSignup = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backdropFilter: "blur(20px)" }}
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative max-w-lg w-full bg-black/60 backdrop-blur-md border border-white/20 p-8 md:p-12"
      >
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

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-4">
            Continue Reading
          </h2>

          <p className="text-gray-300 mb-2 text-lg">
            You've reached your free article limit
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Create a free account to enjoy 3 articles per week
          </p>

          <Button
            onClick={handleSignup}
            className="illuminate-button w-full bg-white text-black hover:bg-white px-12 py-6 text-sm uppercase font-semibold border-2 border-white rounded-none"
            style={{ letterSpacing: '1px' }}
          >
            Sign Up to Continue
          </Button>

          <p className="text-xs text-gray-500 mt-6">
            Already have an account?{" "}
            <button
              onClick={handleSignup}
              className="text-white hover:text-gray-300 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}