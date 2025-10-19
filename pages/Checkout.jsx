
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Checkout() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [processing, setProcessing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    try {
      await base44.integrations.Core.SendEmail({
        to: "media@one30m.com",
        subject: "New Digital Magazine Purchase - Éthique",
        body: `
New Digital Magazine Purchase

Customer Name: ${formData.name}
Customer Email: ${formData.email}
Amount: €4.99
Issue: January 2025

Please send the digital magazine to the customer's email address.
        `,
      });

      await base44.integrations.Core.SendEmail({
        to: formData.email,
        subject: "Your Éthique Digital Magazine - January 2025",
        from_name: "Éthique Magazine",
        body: `
Dear ${formData.name},

Thank you for your purchase!

You have successfully purchased the January 2025 digital edition of Éthique Magazine for €4.99.

Your digital magazine will be delivered to this email address within 24 hours.

If you have any questions, please contact us at media@one30m.com

Best regards,
The Éthique Team
        `,
      });

      setPurchased(true);
    } catch (err) {
      setError("Payment processing failed. Please try again.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (purchased) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <CheckCircle size={64} className="mx-auto mb-6 text-green-500" />
          <h2 className="text-3xl font-light mb-4">Purchase Complete</h2>
          <p className="text-gray-400 mb-2">
            Thank you for your purchase! Your digital magazine will be delivered to:
          </p>
          <p className="text-white font-semibold mb-8">{formData.email}</p>
          <p className="text-sm text-gray-500 mb-8">
            Please allow up to 24 hours for delivery. Check your spam folder if you don't see it.
          </p>
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-white text-black hover:bg-gray-200 px-8 py-6"
          >
            Return to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-32 px-6">
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

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light mb-4">Checkout</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Details */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"
                  alt="Magazine Cover"
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-light mb-2">Éthique Magazine</h3>
                  <p className="text-gray-400 mb-4">January 2025 Digital Edition</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold">€4.99</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-4">What's Included</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/b5e661108_MATERIALIZEDbulletpoints.png"
                      alt=""
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                    />
                    <span>Full digital magazine in PDF format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/b5e661108_MATERIALIZEDbulletpoints.png"
                      alt=""
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                    />
                    <span>Delivered within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/b5e661108_MATERIALIZEDbulletpoints.png"
                      alt=""
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                    />
                    <span>Read on any device</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Checkout Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-light mb-6">Delivery Information</h3>

                    <div className="space-y-4">
                      <Input
                        name="name"
                        required
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      />

                      <Input
                        name="email"
                        type="email"
                        required
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      />
                      <p className="text-xs text-gray-500">
                        Your digital magazine will be sent to this email
                      </p>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}

                  <div className="border-t border-white/10 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-400">Total</span>
                      <span className="text-2xl font-semibold">€4.99</span>
                    </div>

                    <Button
                      type="submit"
                      disabled={processing}
                      className="illuminate-button w-full bg-white text-black hover:bg-white px-12 py-6 text-sm uppercase font-semibold border-2 border-white"
                      style={{ borderRadius: '0px', letterSpacing: '1px' }}
                    >
                      {processing ? "Processing..." : "Complete Purchase"}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      By completing this purchase, you agree to our terms of service
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
