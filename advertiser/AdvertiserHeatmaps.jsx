import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Eye, MousePointerClick, DollarSign } from "lucide-react";

export default function AdvertiserHeatmaps({ advertiser }) {
  const { data: hotspots = [] } = useQuery({
    queryKey: ["advertiser-hotspots", advertiser.id],
    queryFn: () => base44.entities.ImageHotspot.filter({ advertiser_id: advertiser.id }),
  });

  const totalClicks = hotspots.reduce((sum, h) => sum + (h.clicks || 0), 0);
  const totalConversions = hotspots.reduce((sum, h) => sum + (h.conversions || 0), 0);
  const totalRevenue = hotspots.reduce((sum, h) => sum + (h.revenue || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-white mb-2">Product Heatmaps</h2>
        <p className="text-sm text-gray-400">Track product clicks and conversions in articles</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <MousePointerClick size={24} className="text-blue-400" />
            <h3 className="text-2xl font-bold text-white">{totalClicks}</h3>
          </div>
          <p className="text-sm text-gray-400">Total Hotspot Clicks</p>
        </div>

        <div className="bg-white/5 border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye size={24} className="text-green-400" />
            <h3 className="text-2xl font-bold text-white">{totalConversions}</h3>
          </div>
          <p className="text-sm text-gray-400">Total Conversions</p>
        </div>

        <div className="bg-white/5 border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={24} className="text-yellow-400" />
            <h3 className="text-2xl font-bold text-white">€{totalRevenue.toFixed(2)}</h3>
          </div>
          <p className="text-sm text-gray-400">Total Revenue</p>
        </div>
      </div>

      {/* Hotspot List */}
      <div className="bg-white/5 border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Active Hotspots</h3>
        {hotspots.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No product hotspots yet</p>
        ) : (
          <div className="space-y-4">
            {hotspots.map((hotspot) => (
              <div key={hotspot.id} className="bg-white/5 p-4 rounded flex items-start gap-4">
                <img src={hotspot.image_url} alt="Article" className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <p className="text-white font-medium mb-2">Article: {hotspot.article_id}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Clicks</p>
                      <p className="text-white font-semibold">{hotspot.clicks}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Conversions</p>
                      <p className="text-white font-semibold">{hotspot.conversions}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Revenue</p>
                      <p className="text-white font-semibold">€{(hotspot.revenue || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}