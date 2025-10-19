import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdvertiserPerformance from "../components/advertiser/AdvertiserPerformance";
import AdvertiserAds from "../components/advertiser/AdvertiserAds";
import AdvertiserContracts from "../components/advertiser/AdvertiserContracts";
import AdvertiserInventory from "../components/advertiser/AdvertiserInventory";
import AdvertiserHeatmaps from "../components/advertiser/AdvertiserHeatmaps";

export default function AdvertiserDashboard() {
  const [advertiser, setAdvertiser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const advertiserId = sessionStorage.getItem("advertiser_id");
      
      if (!advertiserId) {
        navigate(createPageUrl("AdvertiserLogin"));
        return;
      }

      try {
        const advertisers = await base44.entities.Advertiser.filter({ id: advertiserId });
        
        if (advertisers.length === 0 || !advertisers[0].active) {
          sessionStorage.clear();
          navigate(createPageUrl("AdvertiserLogin"));
          return;
        }

        setAdvertiser(advertisers[0]);
      } catch (error) {
        navigate(createPageUrl("AdvertiserLogin"));
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate(createPageUrl("AdvertiserLogin"));
  };

  if (loading || !advertiser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-32 px-6 bg-[#0d0d0d]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light text-white">Advertiser Dashboard</h1>
            <p className="text-gray-400 mt-2">Welcome, {advertiser.company_name}</p>
          </div>
          <Button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </Button>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid grid-cols-5 gap-2 bg-white/5 p-2 mb-8">
            <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Performance
            </TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-white data-[state=active]:text-black">
              My Ads
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Product Inventory
            </TabsTrigger>
            <TabsTrigger value="heatmaps" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Product Heatmaps
            </TabsTrigger>
            <TabsTrigger value="contracts" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Contracts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <AdvertiserPerformance advertiser={advertiser} />
          </TabsContent>

          <TabsContent value="ads">
            <AdvertiserAds advertiser={advertiser} />
          </TabsContent>

          <TabsContent value="inventory">
            <AdvertiserInventory advertiser={advertiser} />
          </TabsContent>

          <TabsContent value="heatmaps">
            <AdvertiserHeatmaps advertiser={advertiser} />
          </TabsContent>

          <TabsContent value="contracts">
            <AdvertiserContracts advertiser={advertiser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}