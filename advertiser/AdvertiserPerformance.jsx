import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, MousePointerClick, DollarSign, TrendingUp, Download, Mail } from "lucide-react";
import { format } from "date-fns";

export default function AdvertiserPerformance({ advertiser }) {
  const [dateRange, setDateRange] = useState("30");
  const [exporting, setExporting] = useState(false);

  const { data: performance = [] } = useQuery({
    queryKey: ["advertiser-performance", advertiser.id, dateRange],
    queryFn: () => base44.entities.AdPerformance.filter({ advertiser_id: advertiser.id }),
  });

  const { data: ads = [] } = useQuery({
    queryKey: ["advertiser-ads", advertiser.id],
    queryFn: () => base44.entities.Advertisement.filter({ advertiser_id: advertiser.id }),
  });

  // Calculate metrics
  const totalImpressions = performance.reduce((sum, p) => sum + (p.impressions || 0), 0);
  const totalClicks = performance.reduce((sum, p) => sum + (p.clicks || 0), 0);
  const totalRevenue = performance.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  // Performance over time
  const performanceData = performance.map(p => ({
    date: format(new Date(p.date), "MMM d"),
    impressions: p.impressions,
    clicks: p.clicks,
    revenue: p.revenue
  }));

  // Per-ad performance
  const adPerformance = ads.map(ad => ({
    name: ad.title.substring(0, 30) + "...",
    impressions: ad.impressions || 0,
    clicks: ad.clicks || 0,
    ctr: ad.ctr || 0
  }));

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // Generate PDF report
      alert("PDF export functionality would be implemented here using a PDF library");
    } finally {
      setExporting(false);
    }
  };

  const handleEmailReport = async () => {
    setExporting(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: advertiser.email,
        subject: `Éthique - Ad Performance Report ${format(new Date(), "MMM d, yyyy")}`,
        body: `
          <h2>Ad Performance Report</h2>
          <p>Company: ${advertiser.company_name}</p>
          <p>Date: ${format(new Date(), "MMMM d, yyyy")}</p>
          
          <h3>Overall Performance</h3>
          <ul>
            <li>Total Impressions: ${totalImpressions.toLocaleString()}</li>
            <li>Total Clicks: ${totalClicks.toLocaleString()}</li>
            <li>Average CTR: ${avgCTR}%</li>
            <li>Total Revenue: €${totalRevenue.toFixed(2)}</li>
          </ul>
          
          <p>Login to your dashboard for detailed analytics: ${window.location.origin}/advertiser</p>
        `
      });
      alert("Performance report sent to " + advertiser.email);
    } finally {
      setExporting(false);
    }
  };

  // Group performance by UTM source
  const utmSourceData = performance.reduce((acc, p) => {
    const key = p.utm_source || "Direct";
    if (!acc[key]) {
      acc[key] = { clicks: 0, conversions: 0, revenue: 0 };
    }
    acc[key].clicks += p.clicks || 0;
    acc[key].conversions += p.conversions || 0;
    acc[key].revenue += p.revenue || 0;
    return acc;
  }, {});

  const utmSourceEntries = Object.entries(utmSourceData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-white">Performance Overview</h2>
          <p className="text-sm text-gray-400 mt-1">Track your ad performance and ROI</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleEmailReport} disabled={exporting} className="bg-white/10 text-white hover:bg-white/20">
            <Mail size={16} className="mr-2" />
            Email Report
          </Button>
          <Button onClick={handleExportPDF} disabled={exporting} className="bg-white/10 text-white hover:bg-white/20">
            <Download size={16} className="mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye size={24} className="text-blue-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{totalImpressions.toLocaleString()}</h3>
          <p className="text-sm text-gray-400">Total Impressions</p>
        </div>

        <div className="bg-white/5 border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <MousePointerClick size={24} className="text-green-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{totalClicks.toLocaleString()}</h3>
          <p className="text-sm text-gray-400">Total Clicks</p>
        </div>

        <div className="bg-white/5 border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} className="text-purple-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{avgCTR}%</h3>
          <p className="text-sm text-gray-400">Average CTR</p>
        </div>

        <div className="bg-white/5 border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={24} className="text-yellow-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">€{totalRevenue.toFixed(2)}</h3>
          <p className="text-sm text-gray-400">Total Revenue</p>
        </div>
      </div>

      {/* Performance Over Time */}
      <div className="bg-white/5 border border-white/20 p-6">
        <h3 className="text-lg font-light text-white mb-4">Performance Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="date" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
            <Legend />
            <Line type="monotone" dataKey="impressions" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="clicks" stroke="#82ca9d" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Ad Performance */}
      <div className="bg-white/5 border border-white/20 p-6">
        <h3 className="text-lg font-light text-white mb-4">Performance by Ad</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={adPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="name" stroke="#ffffff60" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
            <Legend />
            <Bar dataKey="impressions" fill="#8884d8" />
            <Bar dataKey="clicks" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* UTM Performance */}
      <div className="bg-white/5 border border-white/20 p-6">
        <h3 className="text-lg font-light text-white mb-4">Traffic Sources (UTM)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-white text-sm font-medium">Source</th>
                <th className="px-4 py-3 text-right text-white text-sm font-medium">Clicks</th>
                <th className="px-4 py-3 text-right text-white text-sm font-medium">Conversions</th>
                <th className="px-4 py-3 text-right text-white text-sm font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {utmSourceEntries.map(([source, data]) => (
                <tr key={source} className="border-t border-white/10">
                  <td className="px-4 py-3 text-white">{source}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{data.clicks}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{data.conversions}</td>
                  <td className="px-4 py-3 text-right text-gray-300">€{data.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}