import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Users, Eye, MousePointerClick, Share2 } from "lucide-react";

export default function ReportingDashboard() {
  const [dateRange, setDateRange] = useState("30"); // days

  const { data: subscribers = [] } = useQuery({
    queryKey: ["subscribers"],
    queryFn: () => base44.entities.Subscriber.list("-subscription_date"),
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["articles-analytics"],
    queryFn: () => base44.entities.Article.list("-page_views"),
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ["analytics", dateRange],
    queryFn: () => base44.entities.Analytics.list("-date", parseInt(dateRange)),
  });

  // Calculate subscriber growth
  const currentMonthSubs = subscribers.filter(s => {
    const subDate = new Date(s.subscription_date);
    const now = new Date();
    return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear();
  }).length;

  const lastMonthSubs = subscribers.filter(s => {
    const subDate = new Date(s.subscription_date);
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return subDate.getMonth() === lastMonth.getMonth() && subDate.getFullYear() === lastMonth.getFullYear();
  }).length;

  const subGrowth = lastMonthSubs > 0 ? ((currentMonthSubs - lastMonthSubs) / lastMonthSubs * 100).toFixed(1) : 0;

  // Calculate total views and unique visitors
  const totalViews = articles.reduce((sum, a) => sum + (a.page_views || 0), 0);
  const avgCTR = articles.length > 0 ? (articles.reduce((sum, a) => sum + (a.ctr || 0), 0) / articles.length).toFixed(2) : 0;
  const totalShares = articles.reduce((sum, a) => sum + (a.shares_count || 0), 0);

  // Top articles data
  const topArticles = articles.slice(0, 10).map(a => ({
    name: a.title.substring(0, 30) + "...",
    views: a.page_views || 0,
    ctr: a.ctr || 0,
    shares: a.shares_count || 0
  }));

  // Subscriber growth data
  const subscriberData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthSubs = subscribers.filter(s => {
      const subDate = new Date(s.subscription_date);
      return subDate.getMonth() === date.getMonth() && subDate.getFullYear() === date.getFullYear();
    }).length;
    subscriberData.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      subscribers: monthSubs
    });
  }

  // Category distribution
  const categoryData = {};
  articles.forEach(a => {
    categoryData[a.category] = (categoryData[a.category] || 0) + (a.page_views || 0);
  });
  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">Analytics & Reporting</h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users size={24} className="text-blue-400" />
            {subGrowth > 0 ? (
              <TrendingUp size={20} className="text-green-400" />
            ) : (
              <TrendingDown size={20} className="text-red-400" />
            )}
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{subscribers.length}</h3>
          <p className="text-sm text-gray-400">Total Subscribers</p>
          <p className={`text-xs mt-2 ${subGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {subGrowth > 0 ? '+' : ''}{subGrowth}% vs last month
          </p>
        </div>

        <div className="bg-white/5 border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye size={24} className="text-purple-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{totalViews.toLocaleString()}</h3>
          <p className="text-sm text-gray-400">Total Page Views</p>
        </div>

        <div className="bg-white/5 border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <MousePointerClick size={24} className="text-green-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{avgCTR}%</h3>
          <p className="text-sm text-gray-400">Average CTR</p>
        </div>

        <div className="bg-white/5 border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Share2 size={24} className="text-pink-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{totalShares}</h3>
          <p className="text-sm text-gray-400">Total Shares</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriber Growth */}
        <div className="bg-white/5 border border-white/20 p-6">
          <h3 className="text-lg font-light text-white mb-4">Subscriber Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={subscriberData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="month" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
              <Legend />
              <Line type="monotone" dataKey="subscribers" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white/5 border border-white/20 p-6">
          <h3 className="text-lg font-light text-white mb-4">Views by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Articles */}
      <div className="bg-white/5 border border-white/20 p-6">
        <h3 className="text-lg font-light text-white mb-4">Top Performing Articles</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topArticles}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="name" stroke="#ffffff60" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
            <Legend />
            <Bar dataKey="views" fill="#8884d8" />
            <Bar dataKey="shares" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}