
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";

export default function AffiliatePopup({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    entity_type: "",
    affiliate_type: "",
    audience_size: "",
    content_theme: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Save to Lead entity
      await base44.entities.Lead.create({
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        company: formData.entity_type === "company" ? formData.name : "",
        type: "Subscriber",
        status: "new",
        notes: `Affiliate Application:\nType: ${formData.affiliate_type}\nAudience Size: ${formData.audience_size}\nContent Theme: ${formData.content_theme}\nEntity: ${formData.entity_type}`,
        consent_marketing: true
      });

      // Send notification email
      await base44.integrations.Core.SendEmail({
        to: "media@one30m.com",
        subject: "New Affiliate Application - Éthique",
        body: `
New Affiliate Application Received

Name: ${formData.name}
Email: ${formData.email}
WhatsApp: ${formData.whatsapp}
Entity Type: ${formData.entity_type}
Affiliate Type: ${formData.affiliate_type}
Audience Size: ${formData.audience_size}
Content Theme: ${formData.content_theme}

This lead has been added to your CRM.
        `
      });

      setSubmitted(true);
    } catch (error) {
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      whatsapp: "",
      entity_type: "",
      affiliate_type: "",
      audience_size: "",
      content_theme: "",
    });
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 z-50"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "10%" }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-x-0 bottom-0 h-[90vh] bg-[#0d0d0d] border-t border-white/20 z-50 overflow-hidden"
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

            <div className="sticky top-0 bg-[#0d0d0d] border-b border-white/10 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-light text-white">Become an Affiliate</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Earn 2-5% commission on every referral, paid monthly via Stripe
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 transition-colors rounded-full"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="h-[calc(100%-80px)] overflow-y-auto px-8 py-8 pb-32">
              <div className="max-w-6xl mx-auto">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <CheckCircle size={64} className="mx-auto mb-6 text-green-500" />
                    <h3 className="text-3xl font-light text-white mb-4">Application Received!</h3>
                    <p className="text-gray-400 mb-8">
                      Thank you for your interest in becoming an Éthique affiliate. 
                      Our team will review your application and get back to you within 48 hours.
                    </p>
                    <Button
                      onClick={handleClose}
                      className="bg-white text-black hover:bg-gray-200 px-8 py-6"
                    >
                      Close
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-12">
                    {/* Left Column - Form */}
                    <div>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-white mb-2 block">Full Name *</Label>
                            <Input
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Your full name"
                              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                            />
                          </div>

                          <div>
                            <Label className="text-white mb-2 block">Email Address *</Label>
                            <Input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="your@email.com"
                              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                            />
                          </div>

                          <div>
                            <Label className="text-white mb-2 block">WhatsApp Number *</Label>
                            <Input
                              required
                              value={formData.whatsapp}
                              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                              placeholder="+1 234 567 8900"
                              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                            />
                          </div>

                          <div>
                            <Label className="text-white mb-2 block">I am a *</Label>
                            <Select value={formData.entity_type} onValueChange={(value) => setFormData({ ...formData, entity_type: value })} required>
                              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Select one" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="company">Company</SelectItem>
                                <SelectItem value="individual">Individual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-white mb-2 block">Affiliate Type *</Label>
                            <Select value={formData.affiliate_type} onValueChange={(value) => setFormData({ ...formData, affiliate_type: value })} required>
                              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Select one" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="digital_magazine">Digital Magazine</SelectItem>
                                <SelectItem value="influencer">Influencer</SelectItem>
                                <SelectItem value="blog">Blog</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-white mb-2 block">Monthly Audience Size *</Label>
                            <Select value={formData.audience_size} onValueChange={(value) => setFormData({ ...formData, audience_size: value })} required>
                              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Select range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="100-1000">100 - 1,000</SelectItem>
                                <SelectItem value="1000-2500">1,000 - 2,500</SelectItem>
                                <SelectItem value="2500-5000">2,500 - 5,000</SelectItem>
                                <SelectItem value="5k-10k">5K - 10K</SelectItem>
                                <SelectItem value="10k-25k">10K - 25K</SelectItem>
                                <SelectItem value="25k-50k">25K - 50K</SelectItem>
                                <SelectItem value="50k-100k">50K - 100K</SelectItem>
                                <SelectItem value="100k+">100K+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="md:col-span-2">
                            <Label className="text-white mb-2 block">Content Theme/Relevance *</Label>
                            <Select value={formData.content_theme} onValueChange={(value) => setFormData({ ...formData, content_theme: value })} required>
                              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Select theme" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="consumer_products">Consumer Products</SelectItem>
                                <SelectItem value="fashion">Fashion</SelectItem>
                                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                <SelectItem value="beauty">Beauty</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-4 rounded">
                          <h4 className="text-white font-medium mb-2">Affiliate Program Details</h4>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            As an Éthique affiliate, you'll earn 2-5% commission on every successful referral. 
                            Commissions are calculated monthly and paid out via Stripe on the first Monday of each month.
                          </p>
                        </div>

                        <Button
                          type="submit"
                          disabled={submitting}
                          className="illuminate-button w-full bg-white text-black hover:bg-white px-12 py-6 text-sm uppercase font-semibold border-2 border-white"
                          style={{ borderRadius: '0px', letterSpacing: '1px' }}
                        >
                          {submitting ? "Submitting..." : "Submit Application"}
                        </Button>
                      </form>
                    </div>

                    {/* Right Column - Learn More */}
                    <div className="flex flex-col justify-center">
                      <div className="bg-white/5 border border-white/10 p-8 rounded space-y-6">
                        <h3 className="text-2xl font-light text-white mb-4">
                          Discover Our Technology
                        </h3>
                        
                        <p className="text-gray-300 leading-relaxed">
                          Want to learn more about our embeddable video articles, curating your own playlist with your branding on the video player, and just how watch-and-shop technology works?
                        </p>

                        <Button
                          onClick={() => window.open("http://getmaterialized.replit.app", "_blank")}
                          className="illuminate-button w-full bg-white text-black hover:bg-white px-12 py-6 text-sm uppercase font-semibold border-2 border-white"
                          style={{ borderRadius: '0px', letterSpacing: '1px' }}
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
