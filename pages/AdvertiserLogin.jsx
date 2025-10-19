import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building2, Lock } from "lucide-react";

export default function AdvertiserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const advertisers = await base44.entities.Advertiser.filter({ email });
      
      if (advertisers.length === 0) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      const advertiser = advertisers[0];
      
      // Note: In production, passwords should be hashed and verified securely
      // This is a simplified version for demonstration
      if (!advertiser.active) {
        setError("Your account has been deactivated. Contact support.");
        setLoading(false);
        return;
      }

      // Store advertiser session
      sessionStorage.setItem("advertiser_id", advertiser.id);
      sessionStorage.setItem("advertiser_email", advertiser.email);
      
      navigate(createPageUrl("AdvertiserDashboard"));
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/2ec706ef8_EthiquelogotransparentW.png" 
            alt="Éthique" 
            className="h-16 w-auto mx-auto mb-6 opacity-80"
          />
          <h1 className="text-3xl font-light text-white mb-2">Advertiser Portal</h1>
          <p className="text-gray-400">Login to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/5 border border-white/20 p-8 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-white">Email</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@company.com"
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-gray-200 py-6"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-gray-400 hover:text-white transition-colors"
              onClick={() => alert("Please contact support@ethiquemag.com to reset your password")}
            >
              Forgot password?
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Need an advertiser account? Contact us at{" "}
          <a href="mailto:support@ethiquemag.com" className="text-gray-400 hover:text-white">
            support@ethiquemag.com
          </a>
        </p>
      </div>
    </div>
  );
}