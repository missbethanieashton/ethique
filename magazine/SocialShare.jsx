import React from "react";
import { motion } from "framer-motion";
import { Share2, Mail, Twitter, Facebook, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SocialShare({ article }) {
  const shareUrl = window.location.href;
  const shareText = `Check out this article: ${article.title}`;

  const handleShare = (platform) => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(shareText + " " + shareUrl)}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } else {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-20 pt-12 border-t border-white/10"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <Share2 size={20} className="text-white" />
          <span className="text-sm tracking-widest uppercase text-white">
            Share This Story
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleShare("twitter")}
            className="w-12 h-12 rounded-full bg-transparent hover:bg-white/10 transition-all duration-300 text-white"
          >
            <Twitter size={20} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleShare("facebook")}
            className="w-12 h-12 rounded-full bg-transparent hover:bg-white/10 transition-all duration-300 text-white"
          >
            <Facebook size={20} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleShare("email")}
            className="w-12 h-12 rounded-full bg-transparent hover:bg-white/10 transition-all duration-300 text-white"
          >
            <Mail size={20} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleShare("copy")}
            className="w-12 h-12 rounded-full bg-transparent hover:bg-white/10 transition-all duration-300 text-white"
          >
            <LinkIcon size={20} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}