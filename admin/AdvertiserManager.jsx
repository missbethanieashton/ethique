import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Ban } from "lucide-react";

export default function AdvertiserManager({ user }) {
  const queryClient = useQueryClient();
  const isMasterAdmin = user?.admin_role === "master_admin";

  const { data: advertisers = [] } = useQuery({
    queryKey: ["advertisers"],
    queryFn: () => base44.entities.Advertiser.list("-created_date"),
  });

  const updateAdvertiserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Advertiser.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisers"] });
    },
  });

  const updateAdvertisementMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Advertisement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-white">Advertiser Management</h2>

      <div className="bg-white/5 border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {advertisers.map((advertiser) => (
                <tr key={advertiser.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-white">{advertiser.company_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{advertiser.contact_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{advertiser.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      advertiser.active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {advertiser.active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isMasterAdmin && (
                      <div className="flex gap-2">
                        {advertiser.active ? (
                          <Button
                            onClick={() => updateAdvertiserMutation.mutate({ 
                              id: advertiser.id, 
                              data: { active: false } 
                            })}
                            size="sm"
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            <Ban size={14} className="mr-1" />
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            onClick={() => updateAdvertiserMutation.mutate({ 
                              id: advertiser.id, 
                              data: { active: true } 
                            })}
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}