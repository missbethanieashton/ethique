
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Plus, Upload, Search, X, Check } from "lucide-react";

const pages = ["Home", "Fashion", "Art", "Cuisine", "Travel", "Music", "Beauty"];

export default function AdManager() {
  const [editingAd, setEditingAd] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState({});
  const [articleSearch, setArticleSearch] = useState("");
  const [showArticleSearch, setShowArticleSearch] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    link: "",
    type: "sidebar",
    banner_background_image: "",
    banner_heading: "",
    banner_subtitle: "",
    banner_button_text: "",
    banner_button_url: "",
    banner_footer_text: "",
    announcement_text: "",
    announcement_link: "",
    announcement_background_color: "#000000",
    announcement_font_family: "Glacial Indifference",
    announcement_font_size: 16,
    announcement_text_color: "#FFFFFF",
    targeting: "all",
    target_pages: [],
    target_article_id: "",
    active: true,
    order: 0,
  });

  const queryClient = useQueryClient();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["advertisements"],
    queryFn: () => base44.entities.Advertisement.list("order"),
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Advertisement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
      setShowForm(false);
      setEditingAd(null);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Advertisement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
      setShowForm(false);
      setEditingAd(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Advertisement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
    },
  });

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert("Please upload an image (PNG, JPG, GIF) or video (MP4) file");
      return;
    }

    setUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result && result.file_url) {
        setFormData(prev => ({ ...prev, [fieldName]: result.file_url }));
        alert("File uploaded successfully!");
      }
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
      if (e.target) e.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('bg-white/20');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-white/20');
  };

  const handleDrop = async (e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-white/20');
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert("Please upload an image (PNG, JPG, GIF) or video (MP4) file");
      return;
    }

    setUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result && result.file_url) {
        setFormData(prev => ({ ...prev, [fieldName]: result.file_url }));
        alert("File uploaded successfully!");
      }
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      image: "",
      link: "",
      type: "sidebar",
      banner_background_image: "",
      banner_heading: "",
      banner_subtitle: "",
      banner_button_text: "",
      banner_button_url: "",
      banner_footer_text: "",
      announcement_text: "",
      announcement_link: "",
      announcement_background_color: "#000000",
      announcement_font_family: "Glacial Indifference",
      announcement_font_size: 16,
      announcement_text_color: "#FFFFFF",
      targeting: "all",
      target_pages: [],
      target_article_id: "",
      active: true,
      order: 0,
    });
    setArticleSearch("");
    setShowArticleSearch(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAd) {
      updateMutation.mutate({ id: editingAd.id, data: formData });
    } else {
      const maxOrder = ads.length > 0 ? Math.max(...ads.map(a => a.order || 0)) : -1;
      createMutation.mutate({ ...formData, order: maxOrder + 1 });
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || "",
      image: ad.image || "",
      link: ad.link || "",
      type: ad.type || "sidebar",
      banner_background_image: ad.banner_background_image || "",
      banner_heading: ad.banner_heading || "",
      banner_subtitle: ad.banner_subtitle || "",
      banner_button_text: ad.banner_button_text || "",
      banner_button_url: ad.banner_button_url || "",
      banner_footer_text: ad.banner_footer_text || "",
      announcement_text: ad.announcement_text || "",
      announcement_link: ad.announcement_link || "",
      announcement_background_color: ad.announcement_background_color || "#000000",
      announcement_font_family: ad.announcement_font_family || "Glacial Indifference",
      announcement_font_size: ad.announcement_font_size || 16,
      announcement_text_color: ad.announcement_text_color || "#FFFFFF",
      targeting: ad.targeting || "all",
      target_pages: ad.target_pages || [],
      target_article_id: ad.target_article_id || "",
      active: ad.active !== undefined ? ad.active : true,
      order: ad.order || 0,
    });
    setShowForm(true);
    if (ad.targeting === "specific_article" && ad.target_article_id) {
      setShowArticleSearch(true);
    }
  };

  const handleTogglePage = (page) => {
    setFormData(prev => ({
      ...prev,
      target_pages: prev.target_pages.includes(page)
        ? prev.target_pages.filter(p => p !== page)
        : [...prev.target_pages, page]
    }));
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
    article.category.toLowerCase().includes(articleSearch.toLowerCase())
  );

  const selectedArticle = formData.target_article_id 
    ? articles.find(a => a.id === formData.target_article_id)
    : null;

  const getAdTypeLabel = (type) => {
    switch(type) {
      case "sidebar": return "Sidebar Thumbnail";
      case "full_width_banner": return "Full Width Banner";
      case "announcement_bar": return "Announcement Bar";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">Advertisement Manager</h2>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingAd(null);
            resetForm();
          }}
          className="bg-white/10 hover:bg-white/20 border border-white/20"
        >
          <Plus size={16} className="mr-2" />
          New Advertisement
        </Button>
      </div>

      {/* Ads List */}
      <div className="space-y-4">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="bg-white/5 border border-white/10 p-4 rounded flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {ad.image && (
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div>
                <h3 className="text-white font-medium">{ad.title}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                    {getAdTypeLabel(ad.type)}
                  </span>
                  <span>•</span>
                  <span>{ad.targeting}</span>
                  <span>•</span>
                  <span className={ad.active ? "text-green-400" : "text-red-400"}>
                    {ad.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleEdit(ad)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <Pencil size={16} />
              </Button>
              <Button
                onClick={() => {
                  if (confirm("Delete this advertisement?")) {
                    deleteMutation.mutate(ad.id);
                  }
                }}
                variant="ghost"
                size="icon"
                className="text-red-400 hover:bg-red-500/10"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Ad Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 overflow-y-auto py-8">
          <div className="bg-[#1a1a1a] border border-white/20 rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-light text-white">
                {editingAd ? "Edit Advertisement" : "New Advertisement"}
              </h3>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setEditingAd(null);
                  resetForm();
                }}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label className="text-white mb-2">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>

              {/* Ad Type */}
              <div>
                <Label className="text-white mb-2">Advertisement Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sidebar">Sidebar Thumbnail</SelectItem>
                    <SelectItem value="full_width_banner">Full Width Banner</SelectItem>
                    <SelectItem value="announcement_bar">Announcement Bar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sidebar Thumbnail Fields */}
              {formData.type === "sidebar" && (
                <>
                  <div>
                    <Label className="text-white mb-2">Ad Image/GIF/Video</Label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'image')}
                      className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors"
                    >
                      <input
                        type="file"
                        accept="image/*,video/mp4"
                        onChange={(e) => handleFileUpload(e, 'image')}
                        className="hidden"
                        id="ad-image-upload"
                      />
                      <label htmlFor="ad-image-upload" className="cursor-pointer">
                        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-400">
                          {uploading.image ? "Uploading..." : "Click or drag image/GIF/video here"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports: PNG, JPG, GIF, MP4
                        </p>
                      </label>
                    </div>
                    {formData.image && (
                      <div className="mt-4">
                        {formData.image.includes('.mp4') || formData.image.includes('video') ? (
                          <video
                            src={formData.image}
                            className="w-full max-h-64 object-contain rounded"
                            controls
                          />
                        ) : (
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full max-h-64 object-contain rounded"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-white mb-2">Link URL</Label>
                    <Input
                      value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}

              {/* Full Width Banner Fields */}
              {formData.type === "full_width_banner" && (
                <>
                  <div>
                    <Label className="text-white mb-2">Banner Background Image/Video</Label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'banner_background_image')}
                      className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors"
                    >
                      <input
                        type="file"
                        accept="image/*,video/mp4"
                        onChange={(e) => handleFileUpload(e, 'banner_background_image')}
                        className="hidden"
                        id="banner-bg-upload"
                      />
                      <label htmlFor="banner-bg-upload" className="cursor-pointer">
                        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-400">
                          {uploading.banner_background_image ? "Uploading..." : "Click or drag background media here"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports: PNG, JPG, GIF, MP4
                        </p>
                      </label>
                    </div>
                    {formData.banner_background_image && (
                      <div className="mt-4">
                        {formData.banner_background_image.includes('.mp4') || formData.banner_background_image.includes('video') ? (
                          <video
                            src={formData.banner_background_image}
                            className="w-full max-h-64 object-contain rounded"
                            controls
                          />
                        ) : (
                          <img
                            src={formData.banner_background_image}
                            alt="Preview"
                            className="w-full max-h-64 object-contain rounded"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-white mb-2">Banner Heading</Label>
                    <Input
                      value={formData.banner_heading}
                      onChange={(e) => setFormData({...formData, banner_heading: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2">Banner Subtitle</Label>
                    <Textarea
                      value={formData.banner_subtitle}
                      onChange={(e) => setFormData({...formData, banner_subtitle: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2">Button Text</Label>
                    <Input
                      value={formData.banner_button_text}
                      onChange={(e) => setFormData({...formData, banner_button_text: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2">Button URL</Label>
                    <Input
                      value={formData.banner_button_url}
                      onChange={(e) => setFormData({...formData, banner_button_url: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2">Text Below Button</Label>
                    <Input
                      value={formData.banner_footer_text}
                      onChange={(e) => setFormData({...formData, banner_footer_text: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </>
              )}

              {/* Announcement Bar Fields */}
              {formData.type === "announcement_bar" && (
                <>
                  <div>
                    <Label className="text-white mb-2">Announcement Text</Label>
                    <Textarea
                      value={formData.announcement_text}
                      onChange={(e) => setFormData({...formData, announcement_text: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      rows={2}
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2">Link URL (optional)</Label>
                    <Input
                      value={formData.announcement_link}
                      onChange={(e) => setFormData({...formData, announcement_link: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2">Background Color</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="color"
                        value={formData.announcement_background_color}
                        onChange={(e) => setFormData({...formData, announcement_background_color: e.target.value})}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        value={formData.announcement_background_color}
                        onChange={(e) => setFormData({...formData, announcement_background_color: e.target.value})}
                        className="bg-white/10 border-white/20 text-white flex-1"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white mb-2">Font Family</Label>
                    <Select
                      value={formData.announcement_font_family}
                      onValueChange={(value) => setFormData({...formData, announcement_font_family: value})}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Glacial Indifference">Glacial Indifference</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                        <SelectItem value="Lacquer">Lacquer</SelectItem>
                        <SelectItem value="WATERLILY">WATERLILY</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white mb-2">Font Size (px)</Label>
                    <Input
                      type="number"
                      value={formData.announcement_font_size}
                      onChange={(e) => setFormData({...formData, announcement_font_size: parseInt(e.target.value) || 16})}
                      className="bg-white/10 border-white/20 text-white"
                      min="10"
                      max="48"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2">Text Color</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="color"
                        value={formData.announcement_text_color}
                        onChange={(e) => setFormData({...formData, announcement_text_color: e.target.value})}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        value={formData.announcement_text_color}
                        onChange={(e) => setFormData({...formData, announcement_text_color: e.target.value})}
                        className="bg-white/10 border-white/20 text-white flex-1"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Targeting */}
              <div>
                <Label className="text-white mb-2">Targeting</Label>
                <Select
                  value={formData.targeting}
                  onValueChange={(value) => {
                    setFormData({...formData, targeting: value, target_article_id: "", target_pages: []});
                    setShowArticleSearch(value === "specific_article");
                  }}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages</SelectItem>
                    <SelectItem value="page">Specific Pages</SelectItem>
                    <SelectItem value="specific_article">Specific Article</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page Selection */}
              {formData.targeting === "page" && (
                <div>
                  <Label className="text-white mb-2">Select Pages</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {pages.map((page) => (
                      <div key={page} className="flex items-center space-x-2">
                        <Checkbox
                          id={`page-${page}`}
                          checked={formData.target_pages.includes(page)}
                          onCheckedChange={() => handleTogglePage(page)}
                        />
                        <label
                          htmlFor={`page-${page}`}
                          className="text-sm text-white cursor-pointer"
                        >
                          {page}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Article Search */}
              {formData.targeting === "specific_article" && (
                <div>
                  <Label className="text-white mb-2">Search Article</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      value={articleSearch}
                      onChange={(e) => setArticleSearch(e.target.value)}
                      className="bg-white/10 border-white/20 text-white pl-10"
                      placeholder="Search by title or category..."
                    />
                  </div>

                  {/* Selected Article */}
                  {selectedArticle && (
                    <div className="mt-3 p-3 bg-white/10 border border-white/20 rounded flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {selectedArticle.thumbnail_image && (
                          <img
                            src={selectedArticle.thumbnail_image}
                            alt={selectedArticle.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">{selectedArticle.title}</p>
                          <p className="text-gray-400 text-xs">{selectedArticle.category}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setFormData({...formData, target_article_id: ""})}
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  )}

                  {/* Article Search Results */}
                  {articleSearch && !formData.target_article_id && (
                    <div className="mt-3 max-h-64 overflow-y-auto bg-white/5 border border-white/20 rounded">
                      {filteredArticles.length > 0 ? (
                        filteredArticles.map((article) => (
                          <button
                            key={article.id}
                            type="button"
                            onClick={() => {
                              setFormData({...formData, target_article_id: article.id});
                              setArticleSearch("");
                            }}
                            className="w-full p-3 hover:bg-white/10 transition-colors flex items-center gap-3 text-left"
                          >
                            {article.thumbnail_image && (
                              <img
                                src={article.thumbnail_image}
                                alt={article.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="text-white text-sm font-medium">{article.title}</p>
                              <p className="text-gray-400 text-xs">{article.category}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm p-4 text-center">No articles found</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                />
                <label htmlFor="active" className="text-sm text-white cursor-pointer">
                  Active
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAd(null);
                    resetForm();
                  }}
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-200 border-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-white/10 hover:bg-white/20 border border-white/20"
                >
                  <Check size={16} className="mr-2" />
                  {editingAd ? "Update" : "Create"} Advertisement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
