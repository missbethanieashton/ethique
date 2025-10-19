import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";

export default function CarouselBuilder({ affiliate }) {
  const [config, setConfig] = useState({
    carousel_name: "",
    layout: "horizontal",
    num_articles: 6,
    filter_category: "all",
    filter_tags: [],
    filter_author: "",
    sort_by: "newest",
    utm_source: affiliate.company_name.toLowerCase().replace(/\s/g, "_"),
    utm_campaign: "",
  });
  const [copied, setCopied] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const queryClient = useQueryClient();

  const { data: articles = [] } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.list("-created_date"),
  });

  const { data: authors = [] } = useQuery({
    queryKey: ["authors"],
    queryFn: () => base44.entities.Author.list(),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: () => base44.entities.Tag.list(),
  });

  const createCarouselMutation = useMutation({
    mutationFn: (data) => base44.entities.AffiliateCarousel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["affiliateCarousels"]);
      alert("Carousel saved successfully!");
    },
  });

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      affiliate_id: affiliate.id,
      layout: config.layout,
      num: config.num_articles,
      category: config.filter_category,
      sort: config.sort_by,
      utm_source: config.utm_source,
      utm_medium: "affiliate",
      utm_campaign: config.utm_campaign || config.carousel_name,
    });

    if (config.filter_author) params.append("author", config.filter_author);
    if (config.filter_tags.length > 0) params.append("tags", config.filter_tags.join(","));

    const embedUrl = `${baseUrl}/embed/carousel?${params.toString()}`;
    
    const code = `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="${config.layout === 'horizontal' ? '400' : '600'}" 
  frameborder="0" 
  scrolling="no"
  style="border: none; overflow: hidden;"
></iframe>`;

    setGeneratedCode(code);
    return code;
  };

  const handleSave = () => {
    const embedCode = generateEmbedCode();
    createCarouselMutation.mutate({
      ...config,
      affiliate_id: affiliate.id,
      embed_code: embedCode,
    });
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredArticles = articles
    .filter(a => config.filter_category === "all" || a.category === config.filter_category)
    .filter(a => !config.filter_author || a.author === config.filter_author)
    .filter(a => config.filter_tags.length === 0 || (a.tags && a.tags.some(t => config.filter_tags.includes(t))))
    .sort((a, b) => {
      if (config.sort_by === "newest") return new Date(b.created_date) - new Date(a.created_date);
      if (config.sort_by === "oldest") return new Date(a.created_date) - new Date(b.created_date);
      if (config.sort_by === "most_popular") return (b.page_views || 0) - (a.page_views || 0);
      return 0;
    })
    .slice(0, config.num_articles);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Configuration Form */}
      <Card className="bg-white/5 border-white/10 p-6">
        <h2 className="text-xl font-light text-white mb-6">Configure Carousel</h2>

        <div className="space-y-6">
          <div>
            <Label className="text-white">Carousel Name *</Label>
            <Input
              value={config.carousel_name}
              onChange={(e) => setConfig({ ...config, carousel_name: e.target.value })}
              placeholder="e.g. Homepage Fashion Carousel"
              className="bg-white/5 border-white/20 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Layout</Label>
            <Select value={config.layout} onValueChange={(value) => setConfig({ ...config, layout: value })}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal Carousel</SelectItem>
                <SelectItem value="vertical">Vertical Stack</SelectItem>
                <SelectItem value="single">Single Article Frame</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Number of Articles</Label>
            <Input
              type="number"
              min="1"
              max="12"
              value={config.num_articles}
              onChange={(e) => setConfig({ ...config, num_articles: parseInt(e.target.value) })}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Category Filter</Label>
            <Select value={config.filter_category} onValueChange={(value) => setConfig({ ...config, filter_category: value })}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Fashion">Fashion</SelectItem>
                <SelectItem value="Art">Art</SelectItem>
                <SelectItem value="Cuisine">Cuisine</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Sort By</Label>
            <Select value={config.sort_by} onValueChange={(value) => setConfig({ ...config, sort_by: value })}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most_popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">UTM Campaign Name</Label>
            <Input
              value={config.utm_campaign}
              onChange={(e) => setConfig({ ...config, utm_campaign: e.target.value })}
              placeholder="e.g. summer_2025"
              className="bg-white/5 border-white/20 text-white"
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={generateEmbedCode} className="bg-white/10 hover:bg-white/20 text-white">
              Generate Code
            </Button>
            <Button onClick={handleSave} className="bg-white text-black hover:bg-gray-200">
              Save Carousel
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview & Embed Code */}
      <div className="space-y-6">
        <Card className="bg-white/5 border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-light text-white">Embed Code</h3>
            {generatedCode && (
              <Button
                onClick={handleCopy}
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            )}
          </div>

          {generatedCode ? (
            <Textarea
              value={generatedCode}
              readOnly
              rows={8}
              className="bg-black/20 border-white/10 text-gray-300 text-xs font-mono"
            />
          ) : (
            <p className="text-gray-500 text-sm">Generate code to see embed snippet</p>
          )}
        </Card>

        <Card className="bg-white/5 border-white/10 p-6">
          <h3 className="text-lg font-light text-white mb-4">Preview</h3>
          <p className="text-gray-400 text-sm mb-4">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} will be displayed
          </p>
          <div className="space-y-2">
            {filteredArticles.slice(0, 3).map((article) => (
              <div key={article.id} className="flex items-center gap-3 bg-white/5 p-3 rounded">
                <img src={article.hero_image} alt={article.title} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{article.title}</p>
                  <p className="text-gray-500 text-xs">ID: {article.id}</p>
                </div>
              </div>
            ))}
            {filteredArticles.length > 3 && (
              <p className="text-gray-500 text-xs text-center pt-2">
                + {filteredArticles.length - 3} more articles
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}