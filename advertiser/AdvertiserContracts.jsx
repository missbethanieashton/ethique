import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function AdvertiserContracts({ advertiser }) {
  const { data: contracts = [] } = useQuery({
    queryKey: ["advertiser-contracts", advertiser.id],
    queryFn: () => base44.entities.Contract.filter({ advertiser_id: advertiser.id }),
  });

  const statusColors = {
    draft: "text-gray-400",
    pending_ethique_signature: "text-yellow-400",
    pending_advertiser_signature: "text-orange-400",
    fully_executed: "text-green-400",
    expired: "text-red-400"
  };

  const statusIcons = {
    draft: <Clock size={20} />,
    pending_ethique_signature: <Clock size={20} />,
    pending_advertiser_signature: <Clock size={20} />,
    fully_executed: <CheckCircle size={20} />,
    expired: <FileText size={20} />
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-white mb-2">Contracts</h2>
        <p className="text-sm text-gray-400">View and manage your advertising contracts</p>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p>No contracts yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <div key={contract.id} className="bg-white/5 border border-white/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-medium text-white">Contract #{contract.contract_number}</h3>
                    <span className={`flex items-center gap-2 text-sm ${statusColors[contract.status]}`}>
                      {statusIcons[contract.status]}
                      {contract.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Period: {format(new Date(contract.start_date), "MMM d, yyyy")} - {format(new Date(contract.end_date), "MMM d, yyyy")}
                  </p>
                </div>
                {contract.pdf_url && (
                  <Button
                    onClick={() => window.open(contract.pdf_url, "_blank")}
                    className="bg-white/10 hover:bg-white/20 text-white"
                    size="sm"
                  >
                    <Download size={14} className="mr-2" />
                    Download PDF
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 p-4 rounded">
                  <p className="text-xs text-gray-400 mb-2">Commission Rate</p>
                  <p className="text-2xl font-bold text-white">{contract.affiliate_commission_rate}%</p>
                </div>
                <div className="bg-white/5 p-4 rounded">
                  <p className="text-xs text-gray-400 mb-2">Payment Terms</p>
                  <p className="text-white">{contract.payment_terms || "Net 30"}</p>
                </div>
              </div>

              {contract.status === "pending_advertiser_signature" && (
                <Button className="w-full bg-white text-black hover:bg-gray-200">
                  Sign Contract
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}