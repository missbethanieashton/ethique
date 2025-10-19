import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Ban } from "lucide-react";

export default function AffiliateManager({ user }) {
  const queryClient = useQueryClient();
  const isMasterAdmin = user?.admin_role === "master_admin";

  const { data: affiliates = [] } = useQuery({
    queryKey: ["affiliates"],
    queryFn: () => base44.entities.Affiliate.list("-created_date"),
  });

  const updateAffiliateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Affiliate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-white">Affiliate Management</h2>

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
              {affiliates.map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-white">{affiliate.company_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{affiliate.contact_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{affiliate.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      affiliate.status === 'approved' 
                        ? 'bg-green-500/20 text-green-400'
                        : affiliate.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {affiliate.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isMasterAdmin && (
                      <div className="flex gap-2">
                        {affiliate.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => updateAffiliateMutation.mutate({ 
                                id: affiliate.id, 
                                data: { status: 'approved', approved_date: new Date().toISOString().split('T')[0] } 
                              })}
                              size="sm"
                              className="bg-green-600 text-white hover:bg-green-700"
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => updateAffiliateMutation.mutate({ 
                                id: affiliate.id, 
                                data: { status: 'rejected' } 
                              })}
                              size="sm"
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              <XCircle size={14} className="mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {affiliate.status === 'approved' && (
                          <Button
                            onClick={() => updateAffiliateMutation.mutate({ 
                              id: affiliate.id, 
                              data: { status: 'suspended' } 
                            })}
                            size="sm"
                            className="bg-orange-600 text-white hover:bg-orange-700"
                          >
                            <Ban size={14} className="mr-1" />
                            Suspend
                          </Button>
                        )}
                        {affiliate.status === 'suspended' && (
                          <Button
                            onClick={() => updateAffiliateMutation.mutate({ 
                              id: affiliate.id, 
                              data: { status: 'approved' } 
                            })}
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Reactivate
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