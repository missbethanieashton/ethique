import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        
        // Check if user has admin access
        if (user.admin_role && user.admin_role !== "none") {
          // Redirect to admin dashboard
          navigate(createPageUrl("AdminDashboard"));
        } else {
          setChecking(false);
        }
      } catch (error) {
        // Not authenticated, show login button
        setChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = () => {
    // Redirect to base44 authentication with return URL to admin dashboard
    const returnUrl = window.location.origin + createPageUrl("AdminDashboard");
    base44.auth.redirectToLogin(returnUrl);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-12">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/2ec706ef8_EthiquelogotransparentW.png"
            alt="Éthique"
            className="h-16 w-auto mx-auto mb-8 opacity-80"
          />
          <h1 className="text-3xl font-light text-white mb-4">Admin Portal</h1>
          <p className="text-gray-400">Sign in to access the dashboard</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <button
            onClick={handleLogin}
            className="w-full bg-white text-black hover:bg-gray-200 px-6 py-4 text-sm uppercase font-semibold transition-all duration-300"
            style={{ letterSpacing: '1px' }}
          >
            Sign In
          </button>

          <p className="text-xs text-gray-500 text-center mt-6">
            Access is restricted to authorized team members only
          </p>
        </div>

        <div className="mt-8 text-center">
          <a
            href={createPageUrl("Home")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Magazine
          </a>
        </div>
      </motion.div>
    </div>
  );
}