import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, RefreshCw } from "lucide-react";

export default function AdvertiserInventory({ advertiser }) {
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["advertiser-products", advertiser.id],
    queryFn: () => base44.entities.ProductInventory.filter({ advertiser_id: advertiser.id }),
  });

  const syncInventory = async () => {
    if (!advertiser.api_key || !advertiser.inventory_endpoint) {
      alert("Please configure your API settings first");
      return;
    }

    setSyncing(true);
    try {
      // Call external API to sync inventory
      alert("Inventory sync would happen here using your API credentials");
      queryClient.invalidateQueries({ queryKey: ["advertiser-products"] });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-white mb-2">Product Inventory</h2>
          <p className="text-sm text-gray-400">Manage products for heatmap integration</p>
        </div>
        <Button
          onClick={syncInventory}
          disabled={syncing}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          <RefreshCw size={16} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? "Syncing..." : "Sync Inventory"}
        </Button>
      </div>

      {/* API Configuration */}
      <div className="bg-white/5 border border-white/20 p-6 space-y-4">
        <h3 className="text-lg font-medium text-white">API Configuration</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">API Endpoint</Label>
            <Input
              value={advertiser.inventory_endpoint || ""}
              placeholder="https://api.yourstore.com/products"
              className="bg-white/10 border-white/20 text-white"
              readOnly
            />
          </div>
          <div>
            <Label className="text-white">API Key</Label>
            <Input
              value={advertiser.api_key ? "••••••••" : ""}
              placeholder="Your API key"
              className="bg-white/10 border-white/20 text-white"
              readOnly
            />
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Contact support to update your API credentials
        </p>
      </div>

      {/* Product List */}
      <div className="bg-white/5 border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Products ({products.length})</h3>
        {products.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No products in inventory</p>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 bg-white/5 p-4 rounded">
                <img src={product.product_image} alt={product.product_name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="text-white font-medium">{product.product_name}</h4>
                  <p className="text-sm text-gray-400">{product.product_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{product.currency}{product.price}</p>
                  <p className="text-xs text-gray-400">{product.in_stock ? "In Stock" : "Out of Stock"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}