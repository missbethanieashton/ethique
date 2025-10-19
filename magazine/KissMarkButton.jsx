import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function KissMarkButton({ articleId, className = "", size = 24 }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const wishlist = currentUser.wishlisted_articles || [];
        setIsWishlisted(wishlist.includes(articleId));
      } catch (error) {
        setUser(null);
      }
    };
    checkWishlist();
  }, [articleId]);

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      const currentUser = await base44.auth.me();
      const wishlist = currentUser.wishlisted_articles || [];
      const newWishlist = wishlist.includes(articleId)
        ? wishlist.filter(id => id !== articleId)
        : [...wishlist, articleId];
      
      await base44.auth.updateMe({ wishlisted_articles: newWishlist });
      return newWishlist.includes(articleId);
    },
    onSuccess: (newState) => {
      setIsWishlisted(newState);
      queryClient.invalidateQueries(["currentUser"]);
      queryClient.invalidateQueries(["wishlist"]);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    
    toggleWishlistMutation.mutate();
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`relative z-20 group ${className}`}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      style={{ background: 'transparent', border: 'none', padding: 0 }}
    >
      <style>{`
        .lips-wishlist {
          transition: all 0.4s ease;
          filter: ${isWishlisted ? 'none' : 'grayscale(100%) brightness(0.8)'};
        }
        
        .lips-wishlist:hover {
          transform: scale(1.2);
          filter: ${isWishlisted ? 'brightness(1.3) drop-shadow(0 0 15px rgba(255, 0, 80, 0.8))' : 'grayscale(100%) brightness(1)'};
        }
        
        .lips-wishlist.selected {
          filter: hue-rotate(0deg) saturate(150%) brightness(1.1);
        }
        
        .lips-wishlist.selected:hover {
          animation: kissWishlist 0.6s ease-in-out;
        }
        
        @keyframes kissWishlist {
          0%, 100% {
            transform: scale(1.2);
          }
          25% {
            transform: scale(1.3) rotate(-5deg);
          }
          50% {
            transform: scale(1.25) rotate(5deg);
          }
          75% {
            transform: scale(1.3) rotate(-5deg);
          }
        }
      `}</style>
      
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/e5997ff9a_EthiqueBrandKit.png"
        alt="Save"
        className={`lips-wishlist ${isWishlisted ? 'selected' : ''}`}
        style={{
          width: `${size * 3}px`,
          height: `${size * 3}px`,
          objectFit: 'contain',
        }}
      />
    </motion.button>
  );
}