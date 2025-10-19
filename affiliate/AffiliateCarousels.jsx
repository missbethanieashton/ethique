import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Trash2, Check } from "lucide-react";

export default function AffiliateCarousels({ affiliate }) {
  const [copiedId, setCopiedId] = React.useState(null);
  const queryClient = useQueryClient();

  const { data: carousels = [], isLoading } = useQuery({
    queryKey: ["affiliateCarousels", affiliate.id],
    queryFn: async () => {
      const all = await base44.entities.AffiliateCarousel.list("-created_date");
      return all.filter(c => c.affiliate_id === affiliate.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AffiliateCarousel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["affiliateCarousels"]);
    },
  });

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="grid gap-4">
      {carousels.length === 0 ? (
        <Card className="bg-white/5 border-white/10 p-12 text-center">
          <p className="text-gray-400">No carousels created yet. Use the Carousel Builder to create your first one.</p>
        </Card>
      ) : (
        carousels.map((carousel) => (
          <Card key={carousel.id} className="bg-white/5 border-white/10 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white mb-2">{carousel.carousel_name}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                  <span>Layout: {carousel.layout}</span>
                  <span>•</span>
                  <span>{carousel.num_articles} articles</span>
                  <span>•</span>
                  <span>Category: {carousel.filter_category}</span>
                  <span>•</span>
                  <span>{carousel.total_impressions || 0} impressions</span>
                  <span>•</span>
                  <span>{carousel.total_clicks || 0} clicks</span>
                </div>
                <pre className="bg-black/20 p-3 rounded text-xs text-gray-300 overflow-x-auto font-mono">
                  {carousel.embed_code}
                </pre>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  onClick={() => handleCopy(carousel.embed_code, carousel.id)}
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  {copiedId === carousel.id ? <Check size={16} /> : <Copy size={16} />}
                </Button>
                <Button
                  onClick={() => {
                    if (confirm("Delete this carousel?")) {
                      deleteMutation.mutate(carousel.id);
                    }
                  }}
                  size="sm"
                  variant="outline"
                  className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}