import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search } from "lucide-react";

export default function CRMManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const queryClient = useQueryClient();

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list("-created_date"),
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ["subscribers"],
    queryFn: () => base44.entities.Subscriber.list("-subscription_date"),
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const exportToCSV = () => {
    const csvData = [
      ["Name", "Company", "Email", "Type", "Country", "Status", "Date"],
      ...leads.map(lead => [
        lead.name || "",
        lead.company || "",
        lead.email || "",
        lead.type || "",
        lead.country || "",
        lead.status || "",
        lead.created_date || ""
      ])
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ethique-crm-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || lead.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">CRM & Lead Management</h2>
        <Button
          onClick={exportToCSV}
          className="bg-white text-black hover:bg-gray-200"
        >
          <Download size={16} className="mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/20 p-4">
          <h3 className="text-2xl font-bold text-white">{leads.length}</h3>
          <p className="text-sm text-gray-400">Total Leads</p>
        </div>
        <div className="bg-white/5 border border-white/20 p-4">
          <h3 className="text-2xl font-bold text-white">{leads.filter(l => l.type === "Advertiser").length}</h3>
          <p className="text-sm text-gray-400">Advertisers</p>
        </div>
        <div className="bg-white/5 border border-white/20 p-4">
          <h3 className="text-2xl font-bold text-white">{leads.filter(l => l.type === "Submission").length}</h3>
          <p className="text-sm text-gray-400">Submissions</p>
        </div>
        <div className="bg-white/5 border border-white/20 p-4">
          <h3 className="text-2xl font-bold text-white">{subscribers.length}</h3>
          <p className="text-sm text-gray-400">Subscribers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Advertiser">Advertisers</SelectItem>
            <SelectItem value="Submission">Submissions</SelectItem>
            <SelectItem value="Subscriber">Subscribers</SelectItem>
            <SelectItem value="General">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CRM Table */}
      <div className="bg-white/5 border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-white">{lead.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{lead.company || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{lead.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                      {lead.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{lead.country || "-"}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={lead.status}
                      onValueChange={(value) => updateLeadMutation.mutate({ id: lead.id, data: { status: value } })}
                    >
                      <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <a href={`mailto:${lead.email}`} className="text-blue-400 hover:text-blue-300">
                      Email
                    </a>
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