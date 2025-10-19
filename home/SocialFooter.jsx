import React from "react";
import { motion } from "framer-motion";
import { Instagram, Linkedin, Music } from "lucide-react";

const SubstackIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 8V2L2 2V8" />
    <path d="M22 8L12 14L2 8" />
    <path d="M2 8V22L12 16L22 22V8" />
  </svg>
);

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function SocialFooter() {
  return (
    <section className="py-16 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-8">
            Follow Us
          </h3>

          <div className="flex items-center justify-center gap-6">
            {[
              { href: "https://substack.com", icon: SubstackIcon },
              { href: "https://instagram.com", icon: Instagram },
              { href: "https://linkedin.com", icon: Linkedin },
              { href: "https://tiktok.com", icon: TikTokIcon },
            ].map(({ href, icon: Icon }, idx) => (
              <motion.a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors duration-300"
              >
                <Icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}