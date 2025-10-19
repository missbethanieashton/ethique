import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CarouselBuilder from "../components/affiliate/CarouselBuilder";
import AffiliatePerformance from "../components/affiliate/AffiliatePerformance";
import AffiliateCarousels from "../components/affiliate/AffiliateCarousels";

export default function AffiliateDashboard() {
  const [affiliate, setAffiliate] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("affiliate_user");
    if (stored) {
      setAffiliate(JSON.parse(stored));
    } else {
      window.location.href = "/affiliatelogin";
    }
  }, []);

  if (!affiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-32 px-6 bg-[#0d0d0d]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light text-white">Affiliate Dashboard</h1>
            <p className="text-gray-400 mt-2">{affiliate.company_name}</p>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("affiliate_user");
              window.location.href = "/affiliatelogin";
            }}
            className="text-gray-400 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>

        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid grid-cols-3 gap-2 bg-white/5 p-2 mb-8">
            <TabsTrigger value="builder" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Carousel Builder
            </TabsTrigger>
            <TabsTrigger value="carousels" className="data-[state=active]:bg-white data-[state=active]:text-black">
              My Carousels
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <CarouselBuilder affiliate={affiliate} />
          </TabsContent>

          <TabsContent value="carousels">
            <AffiliateCarousels affiliate={affiliate} />
          </TabsContent>

          <TabsContent value="performance">
            <AffiliatePerformance affiliate={affiliate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}