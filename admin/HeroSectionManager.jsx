import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Save } from "lucide-react";

const pages = ["Home", "Fashion", "Art", "Cuisine", "Travel", "Music", "Beauty"];

export default function HeroSectionManager() {
  const [selectedPage, setSelectedPage] = useState("Home");
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState({
    page_name: "Home",
    media_type: "image",
    media_url: "",
    heading: "",
    subheading: "",
    button_text: "",
    button_link: "",
    product_carousel_enabled: false,
    product_carousel_image: "",
    product_carousel_label: "",
    product_carousel_title: "",
    product_carousel_subtitle: "",
    product_carousel_price: "",
    product_carousel_link: "",
    active: true,
  });

  const queryClient = useQueryClient();

  const { data: heroSections = [], isLoading } = useQuery({
    queryKey: ["hero-sections"],
    queryFn: () => base44.entities.HeroSection.list(),
  });

  const currentHero = heroSections.find(h => h.page_name === selectedPage);

  React.useEffect(() => {
    if (currentHero) {
      setFormData({
        page_name: currentHero.page_name,
        media_type: currentHero.media_type || "image",
        media_url: currentHero.media_url || "",
        heading: currentHero.heading || "",
        subheading: currentHero.subheading || "",
        button_text: currentHero.button_text || "",
        button_link: currentHero.button_link || "",
        product_carousel_enabled: currentHero.product_carousel_enabled || false,
        product_carousel_image: currentHero.product_carousel_image || "",
        product_carousel_label: currentHero.product_carousel_label || "",
        product_carousel_title: currentHero.product_carousel_title || "",
        product_carousel_subtitle: currentHero.product_carousel_subtitle || "",
        product_carousel_price: currentHero.product_carousel_price || "",
        product_carousel_link: currentHero.product_carousel_link || "",
        active: currentHero.active !== undefined ? currentHero.active : true,
      });
    } else {
      setFormData({
        page_name: selectedPage,
        media_type: "image",
        media_url: "",
        heading: "",
        subheading: "",
        button_text: "",
        button_link: "",
        product_carousel_enabled: false,
        product_carousel_image: "",
        product_carousel_label: "",
        product_carousel_title: "",
        product_carousel_subtitle: "",
        product_carousel_price: "",
        product_carousel_link: "",
        active: true,
      });
    }
  }, [selectedPage, currentHero]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HeroSection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-sections"] });
      alert("Hero section created successfully!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HeroSection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-sections"] });
      alert("Hero section updated successfully!");
    },
  });

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert("Please upload an image or video file");
      return;
    }

    setUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result && result.file_url) {
        if (fieldName === "media_url") {
          setFormData(prev => ({ 
            ...prev, 
            media_url: result.file_url,
            media_type: isVideo ? "video" : "image"
          }));
        } else {
          setFormData(prev => ({ ...prev, [fieldName]: result.file_url }));
        }
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

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert("Please upload an image or video file");
      return;
    }

    setUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result && result.file_url) {
        if (fieldName === "media_url") {
          setFormData(prev => ({ 
            ...prev, 
            media_url: result.file_url,
            media_type: isVideo ? "video" : "image"
          }));
        } else {
          setFormData(prev => ({ ...prev, [fieldName]: result.file_url }));
        }
        alert("File uploaded successfully!");
      }
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentHero) {
      updateMutation.mutate({ id: currentHero.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  const isHomePage = selectedPage === "Home";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">Hero Section Manager</h2>
      </div>

      <div className="bg-white/5 p-6 rounded-lg space-y-6">
        <div>
          <Label className="text-white mb-2">Select Page</Label>
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pages.map(page => (
                <SelectItem key={page} value={page}>{page}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Media Upload */}
          <div className="space-y-3">
            <Label className="text-white">Hero Image/Video</Label>
            
            {formData.media_url && (
              <div className="mb-4">
                {formData.media_type === "video" ? (
                  <video 
                    src={formData.media_url} 
                    controls
                    className="w-full max-h-60 object-cover rounded"
                  />
                ) : (
                  <img 
                    src={formData.media_url} 
                    alt="Hero preview"
                    className="w-full max-h-60 object-cover rounded"
                  />
                )}
              </div>
            )}

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "media_url")}
              className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center transition-colors hover:border-white/50"
            >
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload(e, "media_url")}
                className="hidden"
                id="media-upload"
                disabled={uploading.media_url}
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-white mb-2">
                  {uploading.media_url ? "Uploading..." : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-gray-400">
                  Images (PNG, JPG) or Videos (MP4, MOV)
                </p>
              </label>
            </div>

            <Input
              placeholder="Or paste media URL"
              value={formData.media_url}
              onChange={(e) => setFormData({...formData, media_url: e.target.value})}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          {/* Home Page Specific Fields */}
          {isHomePage && (
            <>
              <div>
                <Label className="text-white mb-2">Heading</Label>
                <Input
                  value={formData.heading}
                  onChange={(e) => setFormData({...formData, heading: e.target.value})}
                  placeholder="Innovation in Conscious Luxury Design"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-2">Subheading</Label>
                <Textarea
                  value={formData.subheading}
                  onChange={(e) => setFormData({...formData, subheading: e.target.value})}
                  placeholder="New discoveries from emerging and established luxury brands"
                  rows={3}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2">Button Text</Label>
                  <Input
                    value={formData.button_text}
                    onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                    placeholder="Discover"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2">Button Link</Label>
                  <Input
                    value={formData.button_link}
                    onChange={(e) => setFormData({...formData, button_link: e.target.value})}
                    placeholder="/Fashion"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* Product Carousel Section */}
          <div className="border-t border-white/20 pt-6 space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="product-carousel"
                checked={formData.product_carousel_enabled}
                onCheckedChange={(checked) => setFormData({...formData, product_carousel_enabled: checked})}
              />
              <Label htmlFor="product-carousel" className="text-white cursor-pointer">
                Enable Product Carousel
              </Label>
            </div>

            {formData.product_carousel_enabled && (
              <>
                <div className="space-y-3">
                  <Label className="text-white">Product Image</Label>
                  
                  {formData.product_carousel_image && (
                    <div className="mb-4">
                      <img 
                        src={formData.product_carousel_image} 
                        alt="Product preview"
                        className="w-full max-h-40 object-contain rounded bg-black/20"
                      />
                    </div>
                  )}

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, "product_carousel_image")}
                    className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center transition-colors hover:border-white/50"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "product_carousel_image")}
                      className="hidden"
                      id="product-image-upload"
                      disabled={uploading.product_carousel_image}
                    />
                    <label htmlFor="product-image-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-white text-sm mb-1">
                        {uploading.product_carousel_image ? "Uploading..." : "Click to upload product image"}
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG</p>
                    </label>
                  </div>

                  <Input
                    placeholder="Or paste image URL"
                    value={formData.product_carousel_image}
                    onChange={(e) => setFormData({...formData, product_carousel_image: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white mb-2">Label</Label>
                    <Input
                      value={formData.product_carousel_label}
                      onChange={(e) => setFormData({...formData, product_carousel_label: e.target.value})}
                      placeholder="Latest Issue"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2">Title</Label>
                    <Input
                      value={formData.product_carousel_title}
                      onChange={(e) => setFormData({...formData, product_carousel_title: e.target.value})}
                      placeholder="January 2025"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2">Subtitle</Label>
                  <Input
                    value={formData.product_carousel_subtitle}
                    onChange={(e) => setFormData({...formData, product_carousel_subtitle: e.target.value})}
                    placeholder="Get Digital Edition"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white mb-2">Price</Label>
                    <Input
                      value={formData.product_carousel_price}
                      onChange={(e) => setFormData({...formData, product_carousel_price: e.target.value})}
                      placeholder="€4.99"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2">Link URL</Label>
                    <Input
                      value={formData.product_carousel_link}
                      onChange={(e) => setFormData({...formData, product_carousel_link: e.target.value})}
                      placeholder="/Checkout"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <Button 
            type="submit" 
            className="bg-white text-black hover:bg-gray-200"
            disabled={Object.values(uploading).some(v => v) || !formData.media_url}
          >
            <Save className="w-4 h-4 mr-2" />
            {currentHero ? "Update Hero Section" : "Create Hero Section"}
          </Button>
        </form>
      </div>
    </div>
  );
}