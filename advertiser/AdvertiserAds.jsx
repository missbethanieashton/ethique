import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { format } from "date-fns";

export default function AdvertiserAds({ advertiser }) {
  const [uploading, setUploading] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: ads = [] } = useQuery({
    queryKey: ["advertiser-ads", advertiser.id],
    queryFn: () => base44.entities.Advertisement.filter({ advertiser_id: advertiser.id }),
  });

  const updateAdMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Advertisement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertiser-ads"] });
      alert("Ad updated successfully");
    },
  });

  const handleFileUpload = async (e, adId) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateAdMutation.mutate({ id: adId, data: { image: file_url } });
    } catch (error) {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-white mb-2">My Advertisements</h2>
        <p className="text-sm text-gray-400">Manage your ad creative and settings</p>
        <p className="text-xs text-gray-500 mt-1">
          Note: Visual settings are controlled globally by Éthique and cannot be changed
        </p>
      </div>

      {ads.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No advertisements yet. Contact support to create your first ad.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white/5 border border-white/20 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-medium text-white">{ad.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {ad.start_date && `Running from ${format(new Date(ad.start_date), "MMM d, yyyy")}`}
                    {ad.end_date && ` to ${format(new Date(ad.end_date), "MMM d, yyyy")}`}
                    {ad.continuous && " (Continuous)"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{(ad.ctr || 0).toFixed(2)}%</p>
                  <p className="text-xs text-gray-400">Click Rate</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2 block">Ad Image</Label>
                  <img src={ad.image} alt={ad.title} className="w-full aspect-video object-cover mb-2" />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, ad.id)}
                      className="hidden"
                      id={`ad-upload-${ad.id}`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => document.getElementById(`ad-upload-${ad.id}`).click()}
                      disabled={uploading}
                      className="bg-white/10 hover:bg-white/20"
                    >
                      <Upload size={14} className="mr-2" />
                      {uploading ? "Uploading..." : "Change Image"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-white">Destination URL</Label>
                    <Input
                      value={ad.link || ""}
                      onChange={(e) => updateAdMutation.mutate({ id: ad.id, data: { link: e.target.value } })}
                      placeholder="https://your-site.com"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="bg-white/10 p-3 rounded">
                    <p className="text-xs text-gray-400 mb-1">Performance</p>
                    <p className="text-white"><span className="font-semibold">{(ad.impressions || 0).toLocaleString()}</span> impressions</p>
                    <p className="text-white"><span className="font-semibold">{(ad.clicks || 0).toLocaleString()}</span> clicks</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}