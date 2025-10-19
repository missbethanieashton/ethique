
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

const industries = [
  "Fashion & Luxury",
  "Art & Culture",
  "Food & Beverage",
  "Travel & Hospitality",
  "Music & Entertainment",
  "Automotive",
  "Technology",
  "Beauty & Wellness",
  "Real Estate",
  "Other"
];

const countries = [
  "United States", "United Kingdom", "France", "Italy", "Germany", "Spain",
  "Canada", "Australia", "Japan", "China", "United Arab Emirates", "Switzerland",
  "Netherlands", "Belgium", "Austria", "Other"
];

export default function AdvertisingPopup({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    industry: "",
    country: "",
    interested_in: "",
    budget: "",
    email: "",
    whatsapp: "",
    consent_marketing: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await base44.entities.Lead.create({
        ...formData,
        type: "Advertiser",
        status: "new"
      });

      await base44.integrations.Core.SendEmail({
        to: "media@one30m.com",
        subject: `New Advertising Inquiry - ${formData.company}`,
        body: `
New Advertising Inquiry

Name: ${formData.name}
Company: ${formData.company}
Industry: ${formData.industry}
Country: ${formData.country}

Interested In: ${formData.interested_in}
Budget: ${formData.budget}

Email: ${formData.email}
WhatsApp: ${formData.whatsapp}

Marketing Consent: ${formData.consent_marketing ? 'Yes' : 'No'}
        `
      });

      setSubmitted(true);
    } catch (error) {
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              <h2 className="text-2xl font-light text-white">Advertise With Us</h2>
              <button
                onClick={onClose}
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
                    <h3 className="text-3xl font-light text-white mb-4">Thank You!</h3>
                    <p className="text-gray-400 mb-8">
                      We've received your inquiry and will get back to you within 24 hours.
                    </p>
                    <Button
                      onClick={onClose}
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      Close
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-12">
                    {/* Left: Magazine Mockup */}
                    <div>
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/46457309f_Screenshot2025-10-11at122730AM.png"
                        alt="Éthique Magazine"
                        className="w-full max-w-md mx-auto"
                      />
                      <div className="mt-8 text-center">
                        <h3 className="text-xl font-light text-white mb-4">Featured Placements</h3>
                        <ul className="text-sm text-gray-400 space-y-2">
                          <li>✦ Cover Stories</li>
                          <li>✦ Native Advertising</li>
                          <li>✦ Editorial Features</li>
                          <li>✦ Shoppable Video Content</li>
                        </ul>
                      </div>
                    </div>

                    {/* Right: Contact Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <Input
                        placeholder="Full Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      />

                      <Input
                        placeholder="Company Name"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      />

                      <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })} required>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map(ind => (
                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })} required>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={formData.interested_in} onValueChange={(value) => setFormData({ ...formData, interested_in: value })} required>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Interested In" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Native Ads">Native Ads</SelectItem>
                          <SelectItem value="Editorial">Editorial</SelectItem>
                          <SelectItem value="Feature Story">Feature Story</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="space-y-2">
                        <Label className="text-white text-sm">Budget Range</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {["€250-750", "€750-1500", "€1500+"].map(budget => (
                            <button
                              key={budget}
                              type="button"
                              onClick={() => setFormData({ ...formData, budget })}
                              className={`py-3 text-sm border transition-all ${
                                formData.budget === budget
                                  ? 'bg-white text-black border-white'
                                  : 'bg-white/5 text-white border-white/20 hover:border-white/40'
                              }`}
                            >
                              {budget}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      />

                      <Input
                        placeholder="WhatsApp Number"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      />

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="consent"
                          checked={formData.consent_marketing}
                          onCheckedChange={(checked) => setFormData({ ...formData, consent_marketing: checked })}
                          className="mt-1 border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                        <Label htmlFor="consent" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                          I agree to receive marketing communications from Éthique Magazine. 
                          You can unsubscribe at any time.
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="illuminate-button w-full bg-white text-black hover:bg-white py-6 text-sm uppercase font-semibold border-2 border-white"
                        style={{ borderRadius: '0px', letterSpacing: '1px' }}
                      >
                        {submitting ? "Submitting..." : "Submit Inquiry"}
                      </Button>
                    </form>
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
