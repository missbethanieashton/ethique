import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus, Upload, Search, X } from "lucide-react";

export default function CategoryThumbnailManager() {
  const [editingThumbnail, setEditingThumbnail] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");
  const [showArticleSearch, setShowArticleSearch] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    article_id: "",
    order: 0,
    active: true,
  });

  const queryClient = useQueryClient();

  const { data: thumbnails = [], isLoading } = useQuery({
    queryKey: ["category-thumbnails"],
    queryFn: () => base44.entities.CategoryThumbnail.list("order"),
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CategoryThumbnail.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-thumbnails"] });
      setShowForm(false);
      setEditingThumbnail(null);
      resetForm();
      alert("Category thumbnail created successfully!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CategoryThumbnail.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-thumbnails"] });
      setShowForm(false);
      setEditingThumbnail(null);
      resetForm();
      alert("Category thumbnail updated successfully!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CategoryThumbnail.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-thumbnails"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.article_id) {
      alert("Please select an article");
      return;
    }

    if (editingThumbnail) {
      updateMutation.mutate({ id: editingThumbnail.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (thumbnail) => {
    setEditingThumbnail(thumbnail);
    setFormData({
      name: thumbnail.name || "",
      image: thumbnail.image || "",
      article_id: thumbnail.article_id || "",
      order: thumbnail.order || 0,
      active: thumbnail.active !== undefined ? thumbnail.active : true,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      image: "",
      article_id: "",
      order: 0,
      active: true,
    });
    setEditingThumbnail(null);
    setArticleSearch("");
    setShowArticleSearch(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result && result.file_url) {
        setFormData(prev => ({ ...prev, image: result.file_url }));
        alert("Image uploaded successfully!");
      }
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
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

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-white/20');
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result && result.file_url) {
        setFormData(prev => ({ ...prev, image: result.file_url }));
        alert("Image uploaded successfully!");
      }
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
    article.category.toLowerCase().includes(articleSearch.toLowerCase())
  );

  const selectedArticle = articles.find(a => a.id === formData.article_id);

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-white">Homepage Category Thumbnails</h2>
          <p className="text-sm text-gray-400 mt-1">Manage the category thumbnail grid on the homepage</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingThumbnail(null);
            resetForm();
          }}
          className="bg-white text-black hover:bg-gray-200"
        >
          <Plus size={16} className="mr-2" />
          New Thumbnail
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/20 p-6 rounded-lg space-y-6">
          {editingThumbnail && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded">
              <p className="text-blue-400 text-sm">Editing: {editingThumbnail.name}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white mb-2">Thumbnail Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Fashion, Art, Cuisine"
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2">Display Order *</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white mb-2">Thumbnail Image *</Label>
            
            {formData.image && (
              <div className="mb-4">
                <img 
                  src={formData.image} 
                  alt="Preview"
                  className="w-full max-h-60 object-cover rounded"
                />
              </div>
            )}

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center transition-colors hover:border-white/50"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-white mb-2">
                  {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-gray-400">
                  Square images work best (800x800px recommended)
                </p>
              </label>
            </div>

            <Input
              placeholder="Or paste image URL"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="bg-white/10 border-white/20 text-white mt-3"
            />
          </div>

          <div>
            <Label className="text-white mb-2">Linked Article *</Label>
            <p className="text-xs text-gray-400 mb-3">
              When users click this thumbnail, they'll be taken to this article
            </p>

            {selectedArticle ? (
              <div className="bg-white/10 border border-white/20 rounded p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedArticle.thumbnail_image && (
                    <img
                      src={selectedArticle.thumbnail_image}
                      alt={selectedArticle.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="text-white font-medium">{selectedArticle.title}</p>
                    <p className="text-sm text-gray-400">{selectedArticle.category}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, article_id: "" });
                    setShowArticleSearch(true);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-500/10"
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => setShowArticleSearch(true)}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20"
              >
                <Search size={16} className="mr-2" />
                Select Article
              </Button>
            )}

            {showArticleSearch && (
              <div className="mt-3 border border-white/20 rounded-lg p-4 bg-black/40">
                <div className="flex items-center gap-2 mb-3">
                  <Search size={16} className="text-gray-400" />
                  <Input
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Search articles..."
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowArticleSearch(false)}
                    variant="ghost"
                    size="icon"
                    className="text-gray-400"
                  >
                    <X size={16} />
                  </Button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredArticles.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No articles found</p>
                  ) : (
                    filteredArticles.map((article) => (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, article_id: article.id });
                          setShowArticleSearch(false);
                          setArticleSearch("");
                        }}
                        className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center gap-3 text-left transition-colors"
                      >
                        {article.thumbnail_image && (
                          <img
                            src={article.thumbnail_image}
                            alt={article.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{article.title}</p>
                          <p className="text-xs text-gray-400">{article.category}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active" className="text-white cursor-pointer">Active</Label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingThumbnail(null);
                resetForm();
              }}
              className="bg-white text-black hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
            >
              {editingThumbnail ? "Update" : "Create"} Thumbnail
            </Button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {thumbnails.map((thumbnail) => {
          const article = articles.find(a => a.id === thumbnail.article_id);
          
          return (
            <div
              key={thumbnail.id}
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden"
            >
              <div className="aspect-square relative">
                <img
                  src={thumbnail.image}
                  alt={thumbnail.name}
                  className="w-full h-full object-cover"
                />
                {!thumbnail.active && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Inactive</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{thumbnail.name}</h3>
                    <p className="text-xs text-gray-400">Order: {thumbnail.order}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleEdit(thumbnail)}
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm("Delete this thumbnail?")) {
                          deleteMutation.mutate(thumbnail.id);
                        }
                      }}
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                {article && (
                  <div className="text-xs text-gray-400 mt-2 p-2 bg-white/5 rounded">
                    <p className="font-medium text-white mb-1">Links to:</p>
                    <p className="truncate">{article.title}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {thumbnails.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
          <p className="text-gray-400 mb-4">No category thumbnails yet</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-white/10 hover:bg-white/20 border border-white/20"
          >
            <Plus size={16} className="mr-2" />
            Create First Thumbnail
          </Button>
        </div>
      )}
    </div>
  );
}