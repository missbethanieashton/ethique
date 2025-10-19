import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { TrendingUp, MousePointerClick, DollarSign, Eye } from "lucide-react";

export default function AffiliatePerformance({ affiliate }) {
  const { data: carousels = [] } = useQuery({
    queryKey: ["affiliateCarousels", affiliate.id],
    queryFn: async () => {
      const all = await base44.entities.AffiliateCarousel.list();
      return all.filter(c => c.affiliate_id === affiliate.id);
    },
  });

  const totalImpressions = carousels.reduce((sum, c) => sum + (c.total_impressions || 0), 0);
  const totalClicks = carousels.reduce((sum, c) => sum + (c.total_clicks || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;
  const estimatedRevenue = (totalClicks * (affiliate.commission_rate || 2) * 0.1).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="text-blue-400" size={24} />
            <h3 className="text-sm text-gray-400">Total Impressions</h3>
          </div>
          <p className="text-3xl font-light text-white">{totalImpressions.toLocaleString()}</p>
        </Card>

        <Card className="bg-white/5 border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <MousePointerClick className="text-green-400" size={24} />
            <h3 className="text-sm text-gray-400">Total Clicks</h3>
          </div>
          <p className="text-3xl font-light text-white">{totalClicks.toLocaleString()}</p>
        </Card>

        <Card className="bg-white/5 border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-purple-400" size={24} />
            <h3 className="text-sm text-gray-400">Click-Through Rate</h3>
          </div>
          <p className="text-3xl font-light text-white">{ctr}%</p>
        </Card>

        <Card className="bg-white/5 border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-yellow-400" size={24} />
            <h3 className="text-sm text-gray-400">Est. Revenue</h3>
          </div>
          <p className="text-3xl font-light text-white">€{estimatedRevenue}</p>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10 p-6">
        <h3 className="text-lg font-light text-white mb-4">Carousel Performance</h3>
        <div className="space-y-3">
          {carousels.map((carousel) => (
            <div key={carousel.id} className="flex items-center justify-between bg-white/5 p-4 rounded">
              <div>
                <p className="text-white font-medium">{carousel.carousel_name}</p>
                <p className="text-gray-500 text-sm">{carousel.layout} • {carousel.num_articles} articles</p>
              </div>
              <div className="text-right">
                <p className="text-white">{carousel.total_clicks || 0} clicks</p>
                <p className="text-gray-500 text-sm">{carousel.total_impressions || 0} impressions</p>
              </div>
            </div>
          ))}
          {carousels.length === 0 && (
            <p className="text-gray-500 text-center py-8">No carousels yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}