
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Retain Textarea for potential future use or if subtitle needs it
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"; // New import
import { Pencil, Trash2, Plus, Upload } from "lucide-react";

export default function MenuAdManager() {
  const [editingAd, setEditingAd] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState({}); // Keep existing flexible uploading state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    video_url: "",
    link_type: "article", // New field
    article_id: "",
    external_link: "", // New field
    order: 0,
    active: true,
  });
  const queryClient = useQueryClient();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["menu-ads"],
    queryFn: () => base44.entities.MenuAdvertisement.list("order"),
  });

  // New query to fetch articles for the select dropdown
  const { data: articles = [], isLoading: isLoadingArticles } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.list(), // Assuming 'Article' entity exists and has a 'list' method
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MenuAdvertisement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-ads"] });
      setShowForm(false);
      setEditingAd(null);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MenuAdvertisement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-ads"] });
      setShowForm(false);
      setEditingAd(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MenuAdvertisement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-ads"] });
    },
  });

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      console.log("Uploading file:", file.name);
      const result = await base44.integrations.Core.UploadFile({ file });
      console.log("Upload result:", result);
      
      if (result && result.file_url) {
        setFormData(prev => ({ ...prev, [type]: result.file_url }));
        alert("File uploaded successfully!");
      } else {
        throw new Error("No file URL returned");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + (error.message || "Unknown error"));
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('bg-gray-600'); // Adjusted to new color scheme
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-gray-600'); // Adjusted to new color scheme
  };

  const handleDrop = async (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-gray-600'); // Adjusted to new color scheme
    
    const file = e.dataTransfer.files?.[0];
    if (!file) {
      alert("No file detected in drop");
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      console.log("Uploading dropped file:", file.name);
      const result = await base44.integrations.Core.UploadFile({ file });
      console.log("Upload result:", result);
      
      if (result && result.file_url) {
        setFormData(prev => ({ ...prev, [type]: result.file_url }));
        alert("File uploaded successfully!");
      } else {
        throw new Error("No file URL returned");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + (error.message || "Unknown error"));
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation for link_type
    if (formData.link_type === "article" && !formData.article_id) {
      alert("Please select an article for article link type.");
      return;
    }
    if (formData.link_type === "external" && !formData.external_link) {
      alert("Please provide an external link URL.");
      return;
    }

    // Filter out article_id or external_link based on link_type
    const dataToSend = { ...formData };
    if (dataToSend.link_type === "article") {
      delete dataToSend.external_link;
    } else if (dataToSend.link_type === "external") {
      delete dataToSend.article_id;
    }

    if (editingAd) {
      updateMutation.mutate({ id: editingAd.id, data: dataToSend });
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || "",
      subtitle: ad.subtitle || "",
      image: ad.image || "",
      video_url: ad.video_url || "",
      link_type: ad.link_type || "article", // Include new field
      article_id: ad.article_id || "", // Include new field
      external_link: ad.external_link || "", // Include new field
      order: ad.order || 0,
      active: ad.active !== undefined ? ad.active : true,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      image: "",
      video_url: "",
      link_type: "article", // Reset new field
      article_id: "",
      external_link: "", // Reset new field
      order: 0,
      active: true,
    });
    setEditingAd(null);
    setUploading({}); // Reset uploading state
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">Menu Advertisement Manager</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingAd(null);
            resetForm();
          }}
          className="bg-white text-black hover:bg-gray-200"
        >
          <Plus size={16} className="mr-2" />
          New Menu Ad
        </Button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg"> {/* Updated form container styling */}
          <h3 className="text-lg font-medium text-white mb-4">
            {editingAd ? "Edit Menu Ad" : "Create Menu Ad"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {editingAd && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded">
                <p className="text-blue-400 text-sm">Editing: {editingAd.title}</p>
              </div>
            )}

            <div>
              <Label className="text-white">Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="bg-gray-700 border-gray-600 text-white" // Updated input styling
              />
            </div>

            <div>
              <Label className="text-white">Subtitle</Label>
              <Input // Changed from Textarea to Input as per outline
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white" // Updated input styling
              />
            </div>

            <div>
              <Label className="text-white mb-2 block">
                Image * {uploading.image && <span className="text-gray-400 text-sm">(Uploading...)</span>}
              </Label>
              <div 
                className="border-2 border-dashed border-gray-600 rounded p-4 bg-gray-700/50 hover:bg-gray-700 transition-colors" // Adjusted styling
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "image")}
              >
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Image URL or drag & drop a file here"
                  className="bg-gray-700 border-gray-600 text-white mb-2" // Adjusted styling
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "image")}
                  className="hidden"
                  id="image_upload"
                />
                <Button 
                  type="button" 
                  disabled={uploading.image} 
                  className="bg-gray-600 w-full cursor-pointer text-white hover:bg-gray-500" // Adjusted styling
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('image_upload').click();
                  }}
                >
                  <Upload size={16} className="mr-2" />
                  {uploading.image ? "Uploading..." : "Click to Upload Image"}
                </Button>
                <p className="text-xs text-gray-400 mt-2 text-center">Click button or drag & drop file here</p>
              </div>
              {formData.image && (
                <div className="mt-2">
                  <img src={formData.image} alt="Preview" className="h-32 w-auto object-cover rounded" />
                  <p className="text-xs text-green-400 mt-1">Image uploaded successfully</p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-white mb-2 block">
                Video URL (optional) {uploading.video_url && <span className="text-gray-400 text-sm">(Uploading...)</span>}
              </Label>
              <div 
                className="border-2 border-dashed border-gray-600 rounded p-4 bg-gray-700/50 hover:bg-gray-700 transition-colors" // Adjusted styling
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "video_url")}
              >
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="Video URL or drag & drop a file here"
                  className="bg-gray-700 border-gray-600 text-white mb-2" // Adjusted styling
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, "video_url")}
                  className="hidden"
                  id="video_upload"
                />
                <Button 
                  type="button" 
                  disabled={uploading.video_url} 
                  className="bg-gray-600 w-full cursor-pointer text-white hover:bg-gray-500" // Adjusted styling
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('video_upload').click();
                  }}
                >
                  <Upload size={16} className="mr-2" />
                  {uploading.video_url ? "Uploading..." : "Click to Upload Video"}
                </Button>
                <p className="text-xs text-gray-400 mt-2 text-center">Click button or drag & drop file here</p>
              </div>
              {formData.video_url && (
                <p className="text-xs text-green-400 mt-2">Video uploaded successfully</p>
              )}
            </div>

            <div>
              <Label className="text-white">Link Type</Label>
              <Select
                value={formData.link_type}
                onValueChange={(value) => setFormData({ ...formData, link_type: value, article_id: "", external_link: "" })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white"> {/* Updated styling */}
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white border-gray-600"> {/* Updated styling */}
                  <SelectItem value="article">Link to Article</SelectItem>
                  <SelectItem value="external">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.link_type === "article" ? (
              <div>
                <Label className="text-white">Article</Label>
                <Select
                  value={formData.article_id}
                  onValueChange={(value) => setFormData({ ...formData, article_id: value })}
                  disabled={isLoadingArticles} // Disable if articles are loading
                  required={formData.link_type === "article"}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white"> {/* Updated styling */}
                    <SelectValue placeholder={isLoadingArticles ? "Loading articles..." : "Select an article"} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-white border-gray-600"> {/* Updated styling */}
                    {articles.length === 0 && !isLoadingArticles ? (
                      <SelectItem disabled>No articles found</SelectItem>
                    ) : (
                      articles.map((article) => (
                        <SelectItem key={article.id} value={article.id}>
                          {article.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label className="text-white">External Link URL</Label>
                <Input
                  type="url"
                  value={formData.external_link}
                  onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                  placeholder="https://example.com"
                  className="bg-gray-700 border-gray-600 text-white" // Updated input styling
                  required={formData.link_type === "external"}
                />
              </div>
            )}

            <div>
              <Label className="text-white">Display Order *</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                required
                className="bg-gray-700 border-gray-600 text-white" // Updated input styling
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                className="border-gray-600 bg-gray-700 data-[state=checked]:bg-white data-[state=checked]:text-black" // Adjusted styling for checkbox
              />
              <Label htmlFor="active" className="text-white">Active</Label>
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="bg-white text-black hover:bg-gray-200"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingAd ? "Update" : "Create"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAd(null);
                  resetForm();
                }}
                className="bg-gray-600 text-white hover:bg-gray-500" // Adjusted styling
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="bg-white/5 border border-white/20 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4 flex-1">
              {ad.image && (
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <h3 className="text-lg font-medium text-white">{ad.title}</h3>
                <p className="text-sm text-gray-400">
                  Order: {ad.order} • {ad.active ? "Active" : "Inactive"} • Link: {ad.link_type === "article" ? `Article ID: ${ad.article_id}` : `External: ${ad.external_link}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleEdit(ad)}
                className="bg-white/10 text-white hover:bg-white/20"
                size="sm"
              >
                <Pencil size={16} />
              </Button>
              <Button
                onClick={() => {
                  if (confirm("Delete this menu ad?")) {
                    deleteMutation.mutate(ad.id);
                  }
                }}
                className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
                size="sm"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
