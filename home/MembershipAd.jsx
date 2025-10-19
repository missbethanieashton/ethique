
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

export default function MembershipAd({ pageName = "Home" }) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: bannerAd } = useQuery({
    queryKey: ["banner-ad", pageName],
    queryFn: async () => {
      const ads = await base44.entities.Advertisement.list("order");
      return ads.find(ad => 
        ad.type === "full_width_banner" && 
        ad.active && 
        ad.target_pages && 
        ad.target_pages.includes(pageName)
      );
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (emailData) => {
      await base44.entities.Subscriber.create({
        email: emailData,
        subscription_date: new Date().toISOString().split('T')[0],
        source: "membership_banner",
        active: true
      });

      await base44.entities.Lead.create({
        name: emailData.split('@')[0],
        email: emailData,
        type: "Subscriber",
        status: "new",
        notes: "Membership signup from banner ad",
        consent_marketing: true
      });
      
      await base44.integrations.Core.SendEmail({
        to: emailData,
        subject: "Complete Your ÉTHIQUE Membership - €39",
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
      setTimeout(() => {
        setShowEmailModal(false);
        setSubmitted(false);
      }, 3000);
    },
  });

  const handleSubmit = async (e) => {
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

  const handleClick = () => {
    if (bannerAd?.banner_button_url) {
      window.open(bannerAd.banner_button_url, '_blank');
    }
  };

  if (!bannerAd) {
    return null;
  }

  return (
    <>
      <section className="relative w-full py-16 my-16 overflow-hidden bg-[#1a1a1a]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
          
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
          
          .afrah-text {
            font-family: 'Playfair Display', serif;
            font-weight: 400;
            letter-spacing: 0.05em;
          }
        `}</style>

        <div className="absolute inset-0">
          <img
            src={bannerAd.banner_background_image}
            alt="Luxury"
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/2ec706ef8_EthiquelogotransparentW.png" 
              alt="Éthique" 
              className="h-16 w-auto mx-auto mb-8 opacity-80"
            />

            <h2 className="afrah-text text-4xl md:text-5xl mb-8 uppercase tracking-wider">
              {bannerAd.banner_heading}
            </h2>

            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto mb-10">
              {bannerAd.banner_subtitle}
            </p>

            <Button
              onClick={handleClick}
              className="illuminate-button bg-white text-black hover:bg-white px-12 py-6 text-sm uppercase font-semibold border-2 border-white rounded-none"
              style={{ letterSpacing: '1px' }}
            >
              {bannerAd.banner_button_text}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Email Collection Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmailModal(false)}
              className="fixed inset-0 bg-black/80 z-50"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-gray-50 p-8 relative">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="absolute top-4 right-4 text-black hover:text-gray-600"
                >
                  <X size={24} />
                </button>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <h3 className="text-2xl font-medium text-black mb-2">Check Your Email</h3>
                    <p className="text-sm text-gray-600">
                      We've sent you a payment link to complete your €39 membership
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-3xl font-semibold text-black leading-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Members Bar + Events,
                      </h3>
                      <p className="text-lg text-black font-light">for creatives in Paris.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <img
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/5ca1dbb8b_Screenshot2025-10-17at42848PM.png"
                          alt="Tape"
                          className="w-full h-auto"
                        />
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="absolute top-1/2 left-0 right-0 -translate-y-1/2 bg-transparent border-none outline-none text-black px-10 w-full"
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
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

                    <div className="text-xs text-gray-600 leading-relaxed mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      By subscribing to this membership, you agree to our{" "}
                      <button className="underline hover:text-black">Terms of Service</button>
                      {" "}and{" "}
                      <button className="underline hover:text-black">Privacy Policy</button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
