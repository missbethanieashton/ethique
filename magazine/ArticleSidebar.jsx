
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryData = [
  {
    name: "Fashion",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800",
  },
  {
    name: "Art",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/63d31ea49_Screenshot2025-09-10at44425PM.png",
  },
  {
    name: "Cuisine",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  },
  {
    name: "Travel",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
  },
  {
    name: "Music",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
  },
  {
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
  },
];

export default function ArticleSidebar({ currentArticle, relatedArticles = [] }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: ads = [] } = useQuery({
    queryKey: ["sidebar-ads"],
    queryFn: async () => {
      const allAds = await base44.entities.Advertisement.list("order");
      return allAds.filter(ad => ad.active && ad.type === "sidebar");
    },
  });

  const { data: reels = [] } = useQuery({
    queryKey: ["featured-reels"],
    queryFn: async () => {
      const allFeatured = await base44.entities.Featured.list("-created_date");
      return allFeatured.filter(f => f.video && f.active).slice(0, 5);
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (emailData) => {
      // Add to Subscriber entity
      await base44.entities.Subscriber.create({
        email: emailData,
        subscription_date: new Date().toISOString().split('T')[0],
        source: "article_sidebar",
        active: true
      });

      // Add to Lead/CRM entity
      await base44.entities.Lead.create({
        name: emailData.split('@')[0],
        email: emailData,
        type: "Subscriber",
        status: "new",
        notes: "Membership signup from article sidebar",
        consent_marketing: true
      });
      
      // Send payment email
      await base44.integrations.Core.SendEmail({
        to: emailData,
        subject: "Complete Your ÉTHIQUE Membership - €39 Annual Membership",
        body: `
Welcome to ÉTHIQUE!

Thank you for your interest in joining our exclusive community for creatives in Paris.

To complete your membership registration, please proceed with payment:

💳 Membership Fee: €39 Annual Membership
🔗 Become a Member Now: https://buy.stripe.com/7sY7sK96q8Tn8AE2sc

Member Benefits:
✦ Open bar at exclusive events
✦ Early access to private gatherings in Paris
✦ 10% discount on all shoppable posts
✦ Premier access to new content
✦ Connect with creatives across fashion, art, cuisine, travel, music, and beauty

Once your payment is confirmed, you'll receive your member credentials and event calendar.

Questions? Reply to this email or contact us at media@one30m.com

See you soon,
The ÉTHIQUE Team
        `
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setSubmitted(true);
      setEmail("");
    },
  });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await subscribeMutation.mutateAsync(email);
    } catch (error) {
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const apiAds = currentArticle.ad_codes || [];
  const sidebarTopAds = apiAds.filter(ad => ad.position === "sidebar_top");
  const sidebarMiddleAds = apiAds.filter(ad => ad.position === "sidebar_middle");
  const sidebarBottomAds = apiAds.filter(ad => ad.position === "sidebar_bottom");

  const nextArticle = relatedArticles[0];

  return (
    <div className="lg:sticky lg:top-24 space-y-8 h-fit">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        .tape-input-wrapper {
          position: relative;
          width: 100%;
        }
        
        .tape-background {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .tape-input {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          outline: none;
          color: #000;
          font-size: 16px;
          font-family: 'Inter', sans-serif;
          padding: 0 40px;
          width: 100%;
        }
        
        .tape-input::placeholder {
          color: rgba(0, 0, 0, 0.4);
        }

        .reel-container {
          scroll-snap-type: y mandatory;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.3) transparent;
        }

        .reel-container::-webkit-scrollbar {
          width: 4px;
        }

        .reel-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .reel-container::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
        }

        .reel-item {
          scroll-snap-align: start;
        }
      `}</style>

      {/* Membership Signup - Nylon Style */}
      <div className="space-y-6 bg-gray-50 p-8">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <h3 className="text-xl font-medium text-black mb-2">Check Your Email</h3>
            <p className="text-sm text-gray-600">
              We've sent you a payment link to complete your €39 membership
            </p>
          </motion.div>
        ) : (
          <>
            <div>
              <h3 className="text-4xl font-semibold text-black leading-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Members Bar + Events,
              </h3>
              <p className="text-xl text-black font-light">for creatives in Paris.</p>
            </div>
            
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="tape-input-wrapper">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/5ca1dbb8b_Screenshot2025-10-17at42848PM.png"
                  alt="Tape"
                  className="tape-background"
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="tape-input"
                />
              </div>
              
              <div className="text-right">
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-black text-lg font-medium hover:opacity-70 transition-opacity inline-flex items-center gap-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {submitting ? "SUBMITTING..." : "→ SUBMIT"}
                </button>
              </div>
            </form>

            <div className="text-xs text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              By subscribing to this membership, you agree to our{" "}
              <button className="underline hover:text-black">Terms of Service</button>
              {" "}and{" "}
              <button className="underline hover:text-black">Privacy Policy</button>
            </div>
          </>
        )}
      </div>

      {/* Latest Reels Carousel */}
      {reels.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white text-sm uppercase tracking-wider font-light">Latest Reels</h3>
          
          <div className="relative">
            <div className="reel-container max-h-[500px] overflow-y-auto space-y-3">
              {reels.map((reel) => (
                <Link
                  key={reel.id}
                  to={reel.article_id ? createPageUrl("Article") + `?id=${reel.article_id}` : "#"}
                  className="reel-item block group relative aspect-[9/16] overflow-hidden bg-black"
                >
                  {reel.video ? (
                    <video
                      src={reel.video}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => e.target.pause()}
                    />
                  ) : (
                    <img
                      src={reel.thumbnail}
                      alt={reel.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play size={20} className="text-white ml-1" fill="white" />
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium line-clamp-2">{reel.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Read Next */}
      {nextArticle && (
        <div className="space-y-3">
          <h3 className="text-white text-sm uppercase tracking-wider font-light">Read Next</h3>
          <Link
            to={createPageUrl("Article") + `?id=${nextArticle.id}`}
            className="block group"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-black mb-3">
              <img
                src={nextArticle.thumbnail_image || nextArticle.hero_image}
                alt={nextArticle.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-medium line-clamp-2 mb-2">{nextArticle.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{nextArticle.category}</span>
                  {nextArticle.read_time && (
                    <>
                      <span>•</span>
                      <span>{nextArticle.read_time} min</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-purple-400 group-hover:text-purple-300 transition-colors">
              <span>Continue Reading</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      )}

      {/* API Ads - Top */}
      {sidebarTopAds.map((ad, index) => (
        <div key={`top-${index}`} className="api-ad-container" dangerouslySetInnerHTML={{ __html: ad.code }} />
      ))}

      {/* Static Advertisements */}
      {ads.length > 0 && (
        <div className="space-y-6">
          {ads.map((ad) => (
            <motion.a
              key={ad.id}
              href={ad.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative overflow-hidden bg-white/5">
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full transition-transform duration-500 group-hover:scale-105"
                />
                {ad.link && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={16} />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">Advertisement</p>
            </motion.a>
          ))}
        </div>
      )}

      {/* API Ads - Middle */}
      {sidebarMiddleAds.map((ad, index) => (
        <div key={`middle-${index}`} className="api-ad-container" dangerouslySetInnerHTML={{ __html: ad.code }} />
      ))}

      {/* Category Thumbnails Section */}
      <div className="space-y-4">
        <h3 className="text-white text-sm uppercase tracking-wider font-light">Explore Some More</h3>
        <div className="grid grid-cols-2 gap-3">
          {categoryData.map((category) => (
            <Link
              key={category.name}
              to={createPageUrl(category.name)}
              className="group relative aspect-square overflow-hidden bg-black"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-30"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center">
                <h4 className="text-xs md:text-sm font-normal uppercase text-white transition-all duration-300 group-hover:scale-110" style={{ letterSpacing: '1px' }}>
                  {category.name}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* API Ads - Bottom */}
      {sidebarBottomAds.map((ad, index) => (
        <div key={`bottom-${index}`} className="api-ad-container" dangerouslySetInnerHTML={{ __html: ad.code }} />
      ))}
    </div>
  );
}
