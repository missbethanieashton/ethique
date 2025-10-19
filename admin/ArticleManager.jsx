
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus, Upload, X, Eye, Copy, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function ArticleManager() {
  const [editingArticle, setEditingArticle] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [productCarousel, setProductCarousel] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [uploading, setUploading] = useState({});
  const [user, setUser] = useState(null);
  const [previewArticle, setPreviewArticle] = useState(null);
  // New state for filtering and reordering
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderedArticleList, setReorderedArticleList] = useState([]); // To hold the locally reordered list

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "Fashion",
    status: "draft",
    hero_image: "",
    hero_video: "",
    hero_image_format: "landscape",
    thumbnail_image: "",
    thumbnail_video: "",
    content_section_1: "",
    content_section_2: "",
    content_section_3: "",
    middle_section_type: "gallery",
    middle_section_video: "",
    gallery_images: [],
    carousel_images: [],
    backlink: "",
    read_time: "",
    page_views: 0,
    ctr: 0,
    shares_count: 0,
    published_date: "",
    author_id: "",
  });

  const queryClient = useQueryClient();
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  // Update reorderedArticleList when articles change or filters change, only if reorderMode is active.
  useEffect(() => {
    if (reorderMode) {
      setReorderedArticleList(
        articles
          .filter(article => categoryFilter === "all" || article.category === categoryFilter)
          .filter(article => statusFilter === "all" || article.status === statusFilter)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      );
    }
  }, [articles, categoryFilter, statusFilter, reorderMode]);


  const isMasterAdmin = user?.email === "bethanieashton@gmail.com" || user?.admin_role === "master_admin";

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.list("-created_date"), // Initial sort for display, will be overridden by local reorder if active
  });

  const { data: editorialTeam = [] } = useQuery({
    queryKey: ["editorialTeam"],
    queryFn: () => base44.entities.EditorialTeam.list("order"),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: () => base44.entities.Tag.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.entities.Article.create(data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setShowForm(false);
      setEditingArticle(null);
      resetForm();
      alert("Article created successfully!");
    },
    onError: (error) => {
      alert("Failed to create article: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const result = await base44.entities.Article.update(id, data);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      alert("Article updated successfully!");
      setShowForm(false);
      setEditingArticle(null);
      resetForm();
    },
    onError: (error) => {
      alert("Failed to update article: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Article.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (error) => {
      alert("Failed to delete article: " + error.message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Article.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      alert("Article published successfully!");
    },
    onError: (error) => {
      alert("Failed to publish article: " + error.message);
    },
  });

  const bulkPublishMutation = useMutation({
    mutationFn: async (articleIds) => {
      const allArticles = await base44.entities.Article.list();
      const toPublish = allArticles.filter(a => articleIds.includes(a.id));
      
      for (const article of toPublish) {
        await base44.entities.Article.update(article.id, { 
          ...article, 
          status: "published" 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setSelectedArticles([]);
      alert("Articles published successfully!");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (articleIds) => {
      for (const id of articleIds) {
        await base44.entities.Article.delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setSelectedArticles([]);
      alert("Articles deleted successfully!");
    },
  });

  // New reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (reorderedArticles) => {
      const updates = reorderedArticles.map((article) =>
        base44.entities.Article.update(article.id, { order: article.order }) // Send the updated 'order' field
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      alert("Article order saved successfully!");
      setReorderMode(false);
      setReorderedArticleList([]); // Clear local list
    },
    onError: (error) => {
      alert("Failed to save order: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      category: "Fashion",
      status: "draft",
      hero_image: "",
      hero_video: "",
      hero_image_format: "landscape",
      thumbnail_image: "",
      thumbnail_video: "",
      content_section_1: "",
      content_section_2: "",
      content_section_3: "",
      middle_section_type: "gallery",
      middle_section_video: "",
      gallery_images: [],
      carousel_images: [],
      backlink: "",
      read_time: "",
      page_views: 0,
      ctr: 0,
      shares_count: 0,
      published_date: "",
      author_id: "",
    });
    setProductCarousel([]);
    setSelectedTags([]);
    setUploading({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      title: formData.title,
      subtitle: formData.subtitle,
      category: formData.category,
      status: formData.status,
      hero_image: formData.hero_image,
      hero_video: formData.hero_video || "",
      hero_image_format: formData.hero_image_format,
      thumbnail_image: formData.thumbnail_image,
      thumbnail_video: formData.thumbnail_video || "",
      content_section_1: formData.content_section_1,
      content_section_2: formData.content_section_2 || "",
      content_section_3: formData.content_section_3 || "",
      middle_section_type: formData.middle_section_type,
      middle_section_video: formData.middle_section_video || "",
      carousel_images: formData.carousel_images,
      gallery_images: formData.gallery_images,
      product_carousel: productCarousel,
      tags: selectedTags,
      backlink: formData.backlink || "",
      read_time: parseInt(formData.read_time) || 0,
      page_views: parseInt(formData.page_views) || 0,
      ctr: parseFloat(formData.ctr) || 0,
      shares_count: parseInt(formData.shares_count) || 0,
      published_date: formData.published_date || "",
      author_id: formData.author_id,
      // order will be handled by reorderMutation, not directly from form
    };
    
    if (!editingArticle) {
      data.article_id = `ART-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      // For a new article, assign a default order, e.g., the max order + 1
      const maxOrder = articles.reduce((max, article) => Math.max(max, article.order || 0), 0);
      data.order = maxOrder + 1;
    } else {
      // Preserve existing order when updating an article
      data.order = editingArticle.order;
    }
    
    if (!isMasterAdmin && data.status === "published") {
      data.status = "awaiting_approval";
    }

    if (editingArticle && editingArticle.id) {
      updateMutation.mutate({ id: editingArticle.id, data: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [fieldName]: file_url }));
    } catch (error) {
      alert("Failed to upload file: " + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
      e.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (fieldName === "carousel") {
        setFormData(prev => ({
          ...prev,
          carousel_images: [...(prev.carousel_images || []), { url: file_url, caption: "" }].slice(0, 8)
        }));
      } else if (fieldName === "gallery") {
        setFormData(prev => ({
          ...prev,
          gallery_images: [...(prev.gallery_images || []), { url: file_url, source: "", caption: "" }].slice(0, 8)
        }));
      } else {
        setFormData(prev => ({ ...prev, [fieldName]: file_url }));
      }
    } catch (error) {
      alert("Failed to upload file: " + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMultipleCarouselUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentSize = formData.carousel_images ? formData.carousel_images.length : 0;
    if (files.length + currentSize > 8) {
      alert(`You can only upload ${8 - currentSize} more image(s)`);
      e.target.value = '';
      return;
    }

    setUploading(prev => ({ ...prev, carousel: true }));
    try {
      const uploadedImages = [];
      
      for (const file of files) {
        const result = await base44.integrations.Core.UploadFile({ file });
        if (result && result.file_url) {
          uploadedImages.push({
            url: result.file_url,
            caption: ""
          });
        }
      }

      setFormData(prev => ({
        ...prev,
        carousel_images: [...(prev.carousel_images || []), ...uploadedImages].slice(0, 8)
      }));
      
      alert(`${uploadedImages.length} image(s) uploaded!`);
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(prev => ({ ...prev, carousel: false }));
      if (e.target) e.target.value = '';
    }
  };

  const handleMultipleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentSize = formData.gallery_images ? formData.gallery_images.length : 0;
    if (files.length + currentSize > 8) {
      alert(`You can only upload ${8 - currentSize} more image(s)`);
      e.target.value = '';
      return;
    }

    setUploading(prev => ({ ...prev, gallery: true }));
    try {
      const uploadedImages = [];
      
      for (const file of files) {
        const result = await base44.integrations.Core.UploadFile({ file });
        if (result && result.file_url) {
          uploadedImages.push({
            url: result.file_url,
            source: "",
            caption: ""
          });
        }
      }

      setFormData(prev => ({
        ...prev,
        gallery_images: [...(prev.gallery_images || []), ...uploadedImages].slice(0, 8)
      }));
      
      alert(`${uploadedImages.length} image(s) uploaded!`);
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(prev => ({ ...prev, gallery: false }));
      if (e.target) e.target.value = '';
    }
  };

  const addProduct = () => {
    setProductCarousel([...productCarousel, { image: "", title: "", price: "", url: "", button_text: "Buy Now" }]);
  };

  const updateProduct = (index, field, value) => {
    const updated = [...productCarousel];
    updated[index][field] = value;
    setProductCarousel(updated);
  };

  const removeProduct = (index) => {
    setProductCarousel(productCarousel.filter((_, i) => i !== index));
  };

  const handleProductImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(prev => ({ ...prev, [`product-${index}`]: true }));
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateProduct(index, "image", file_url);
    } catch (error) {
      alert("Failed to upload image: " + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [`product-${index}`]: false }));
      e.target.value = '';
    }
  };

  const handleCarouselReorder = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.carousel_images || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData(prev => ({ ...prev, carousel_images: items }));
  };

  const moveCarouselImage = (index, direction) => {
    const items = Array.from(formData.carousel_images || []);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= items.length) return;
    
    const [movedItem] = items.splice(index, 1);
    items.splice(newIndex, 0, movedItem);
    
    setFormData(prev => ({ ...prev, carousel_images: items }));
  };

  const handleToggleSelect = (articleId) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length && filteredArticles.length > 0) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map(a => a.id));
    }
  };

  const handleBulkPublish = () => {
    if (!isMasterAdmin) {
      alert("Only Master Admin can publish articles");
      return;
    }
    if (selectedArticles.length === 0) {
      alert("No articles selected");
      return;
    }
    if (confirm(`Publish ${selectedArticles.length} article(s)?`)) {
      bulkPublishMutation.mutate(selectedArticles);
    }
  };

  const handleBulkDelete = () => {
    if (selectedArticles.length === 0) {
      alert("No articles selected");
      return;
    }
    if (confirm(`Delete ${selectedArticles.length} article(s)? This action cannot be undone.`)) {
      bulkDeleteMutation.mutate(selectedArticles);
    }
  };

  const handlePublish = (article) => {
    if (!isMasterAdmin) {
      alert("Only Master Admin can publish articles");
      return;
    }
    if (confirm(`Publish "${article.title}"?`)) {
      const now = new Date().toISOString().split('T')[0];
      publishMutation.mutate({ 
        id: article.id, 
        data: { ...article, status: "published", published_date: now } 
      });
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setShowForm(true);
    
    setFormData({
      title: article.title || "",
      subtitle: article.subtitle || "",
      category: article.category || "Fashion",
      status: article.status || "draft",
      hero_image: article.hero_image || "",
      hero_video: article.hero_video || "",
      hero_image_format: article.hero_image_format || "landscape",
      thumbnail_image: article.thumbnail_image || "",
      thumbnail_video: article.thumbnail_video || "",
      content_section_1: article.content_section_1 || "",
      content_section_2: article.content_section_2 || "",
      content_section_3: article.content_section_3 || "",
      middle_section_type: article.middle_section_type || "gallery",
      middle_section_video: article.middle_section_video || "",
      gallery_images: article.gallery_images || [],
      carousel_images: article.carousel_images || [],
      backlink: article.backlink || "",
      read_time: article.read_time || "",
      page_views: article.page_views || 0,
      ctr: article.ctr || 0,
      shares_count: article.shares_count || 0,
      published_date: article.published_date ? article.published_date.split('T')[0] : "",
      author_id: article.author_id || "",
    });
    setProductCarousel(article.product_carousel || []);
    setSelectedTags(article.tags || []);
    setUploading({});
  };

  const handlePreview = (article) => {
    setPreviewArticle(article);
  };

  const handleCopyId = (articleId) => {
    navigator.clipboard.writeText(articleId);
    alert("Article ID copied to clipboard!");
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  // Filtering logic
  const filteredArticles = articles
    .filter(article => categoryFilter === "all" || article.category === categoryFilter)
    .filter(article => statusFilter === "all" || article.status === statusFilter)
    .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by 'order' for both display and reordering

  // Handler for article drag-and-drop
  const handleArticleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(reorderedArticleList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values for the reordered list
    const updatedItemsWithOrder = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setReorderedArticleList(updatedItemsWithOrder); // Update local state for immediate visual feedback
  };

  const saveReorder = () => {
    if (reorderedArticleList.length === 0) {
      alert("No articles to reorder.");
      setReorderMode(false); // Exit reorder mode even if nothing to save
      return;
    }
    reorderMutation.mutate(reorderedArticleList);
  };

  return (
    <div className="space-y-6">
      <style>{`
        [role="checkbox"] {
          border: 2px solid white !important;
          background-color: transparent !important;
        }
        
        [role="checkbox"][data-state="checked"] {
          background-color: white !important;
          border-color: white !important;
        }
        
        [role="checkbox"]:hover {
          border-color: rgba(255, 255, 255, 0.8) !important;
        }

        .ql-editor {
          color: #000000 !important;
        }

        .ql-editor p,
        .ql-editor h1,
        .ql-editor h2,
        .ql-editor h3,
        .ql-editor ul,
        .ql-editor ol,
        .ql-editor li {
          color: #000000 !important;
        }

        .ql-editor.ql-blank::before {
          color: #666666 !important;
        }
      `}</style>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">Article Manager</h2>
        <div className="flex items-center gap-3">
          {selectedArticles.length > 0 && !reorderMode && ( // Show bulk actions only when not in reorder mode
            <>
              <span className="text-sm text-gray-400">
                {selectedArticles.length} selected
              </span>
              {isMasterAdmin && (
                <Button
                  onClick={handleBulkPublish}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  disabled={bulkPublishMutation.isPending}
                >
                  {bulkPublishMutation.isPending ? "Publishing..." : "Publish Selected"}
                </Button>
              )}
              <Button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                  disabled={bulkDeleteMutation.isPending}
                >
                  {bulkDeleteMutation.isPending ? "Deleting..." : "Delete Selected"}
                </Button>
              </>
            )}
            {reorderMode ? (
              <>
                <Button
                  onClick={() => {
                    setReorderMode(false);
                    setReorderedArticleList([]); // Clear local reorder list
                    queryClient.invalidateQueries({ queryKey: ["articles"] }); // Re-fetch to reset order display
                  }}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 border border-white/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveReorder}
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  disabled={reorderMutation.isPending}
                >
                  {reorderMutation.isPending ? "Saving..." : "Save Order"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setReorderMode(true);
                    setReorderedArticleList(filteredArticles); // Initialize local reorder list with filtered articles
                  }}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 border border-white/20"
                >
                  <GripVertical size={16} className="mr-2" />
                  Reorder Articles
                </Button>
                <Button
                  onClick={() => {
                    setShowForm(true);
                    setEditingArticle(null);
                    resetForm();
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/20"
                >
                  <Plus size={16} className="mr-2" />
                  New Article
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        {!reorderMode && ( // Hide filters in reorder mode
          <div className="flex items-center gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Fashion">Fashion</SelectItem>
                <SelectItem value="Art">Art</SelectItem>
                <SelectItem value="Cuisine">Cuisine</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="Beauty">Beauty</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                {isMasterAdmin && <SelectItem value="published">Published</SelectItem>}
              </SelectContent>
            </Select>

            {(categoryFilter !== "all" || statusFilter !== "all") && (
              <Button
                onClick={() => {
                  setCategoryFilter("all");
                  setStatusFilter("all");
                }}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Select All Checkbox - only visible when not in reorder mode */}
        {!reorderMode && filteredArticles.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded">
            <Checkbox
              id="select-all"
              checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm text-white cursor-pointer">
              Select All ({filteredArticles.length} articles)
            </label>
          </div>
        )}

        {/* Articles List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-white text-center py-8">Loading articles...</div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-white/50 text-center py-8">No articles found matching your criteria.</div>
          ) : reorderMode ? (
            <DragDropContext onDragEnd={handleArticleDragEnd}>
              <Droppable droppableId="articles">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {reorderedArticleList.map((article, index) => {
                      const author = editorialTeam.find(a => a.id === article.author_id);
                      return (
                        <Draggable key={article.id} draggableId={article.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white/5 border ${
                                snapshot.isDragging ? "border-purple-500 shadow-lg" : "border-white/10"
                              } p-4 rounded flex items-center gap-4`}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-white flex-shrink-0"
                                title="Drag to reorder"
                              >
                                <GripVertical size={20} />
                              </div>

                              {article.thumbnail_image && (
                                <img
                                  src={article.thumbnail_image}
                                  alt={article.title}
                                  className="w-20 h-20 object-cover rounded flex-shrink-0"
                                />
                              )}
                              
                              <div className="flex-1">
                                <h3 className="text-white font-medium">{article.title}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap mt-1">
                                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                    {article.category}
                                  </span>
                                  <span>•</span>
                                  <span className={`px-2 py-0.5 rounded text-xs ${
                                    article.status === "published" ? "bg-green-500/20 text-green-400" :
                                    article.status === "awaiting_approval" ? "bg-yellow-500/20 text-yellow-400" :
                                    "bg-gray-500/20 text-gray-400"
                                  }`}>
                                    {article.status}
                                  </span>
                                  <span>•</span>
                                  <span>Order: {article.order !== undefined ? article.order + 1 : 'N/A'}</span>
                                  {author?.full_name && (
                                    <>
                                      <span>•</span>
                                      <span>{author.full_name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            filteredArticles.map((article) => {
              const author = editorialTeam.find(a => a.id === article.author_id);
              
              return (
                <div
                  key={article.id}
                  className={`bg-white/5 border ${
                    selectedArticles.includes(article.id) ? "border-purple-500" : "border-white/10"
                  } p-4 rounded flex items-center gap-4`}
                >
                  <Checkbox
                    checked={selectedArticles.includes(article.id)}
                    onCheckedChange={() => handleToggleSelect(article.id)}
                  />
                  
                  <button
                    onClick={() => handleCopyId(article.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Copy Article ID"
                  >
                    <Copy size={16} />
                  </button>

                  {article.thumbnail_image && (
                    <img
                      src={article.thumbnail_image}
                      alt={article.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{article.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap mt-1">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {article.category}
                      </span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        article.status === "published" ? "bg-green-500/20 text-green-400" :
                        article.status === "awaiting_approval" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {article.status}
                      </span>
                      <span>•</span>
                      <span>{article.page_views || 0} views</span>
                      {author?.full_name && (
                        <>
                          <span>•</span>
                          <span>{author.full_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handlePreview(article)}
                      variant="ghost"
                      size="icon"
                      className="text-blue-400 hover:bg-blue-500/10"
                      title="Preview Article"
                    >
                      <Eye size={16} />
                    </Button>
                    {isMasterAdmin && article.status !== "published" && (
                      <Button
                        onClick={() => handlePublish(article)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        Publish
                      </Button>
                    )}
                    <Button
                      onClick={() => handleEdit(article)}
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm("Delete this article?")) {
                          deleteMutation.mutate(article.id);
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
              );
            })
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen p-4 md:p-8">
              <div className="max-w-4xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-lg">
                <div className="flex items-center justify-between p-6 pb-0">
                  <h2 className="text-2xl font-light text-white">
                    {editingArticle ? "Edit Article" : "Create New Article"}
                  </h2>
                  <Button
                    onClick={() => {
                      setShowForm(false);
                      setEditingArticle(null);
                      resetForm();
                    }}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <X size={24} />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  
                  {editingArticle && (
                    <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded mb-4">
                      <p className="text-blue-300 font-semibold">✏️ Editing Article: {editingArticle.title}</p>
                      <p className="text-blue-200 text-sm mt-1">ID: {editingArticle.id}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Title *</Label>
                      <Input
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Enter article title"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Status *</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Save as Draft</SelectItem>
                          <SelectItem value="awaiting_approval">Submit for Approval</SelectItem>
                          {isMasterAdmin && <SelectItem value="published">Published</SelectItem>}
                        </SelectContent>
                      </Select>
                      {!isMasterAdmin && (
                        <p className="text-xs text-yellow-400 mt-1">
                          Articles must be approved by Editor-in-Chief before publishing
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Subtitle</Label>
                    <Input
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Article subtitle or excerpt"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Category *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fashion">Fashion</SelectItem>
                          <SelectItem value="Art">Art</SelectItem>
                          <SelectItem value="Cuisine">Cuisine</SelectItem>
                          <SelectItem value="Travel">Travel</SelectItem>
                          <SelectItem value="Music">Music</SelectItem>
                          <SelectItem value="Beauty">Beauty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white">Author (Editorial Team) *</Label>
                      <Select 
                        value={formData.author_id} 
                        onValueChange={(value) => setFormData({ ...formData, author_id: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select author from editorial team" />
                        </SelectTrigger>
                        <SelectContent>
                          {editorialTeam.filter(member => member.active !== false).map(member => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.full_name} - {member.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white mb-3 block">Tags</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 bg-white/5 rounded">
                      {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`tag-${tag.id}`}
                            checked={selectedTags.includes(tag.id)}
                            onCheckedChange={() => toggleTag(tag.id)}
                          />
                          <Label htmlFor={`tag-${tag.id}`} className="text-white text-sm cursor-pointer">
                            {tag.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <Label className="text-white text-lg mb-4 block">Hero Media</Label>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-white mb-2 block">Hero Image URL *</Label>
                        <div 
                          className="border-2 border-dashed border-white/20 rounded p-4 bg-white/5 hover:bg-white/10 transition-colors"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, "hero_image")}
                        >
                          <Input
                            type="url"
                            required
                            value={formData.hero_image}
                            onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                            className="bg-white/10 border-white/20 text-white mb-2"
                            placeholder="https://... or drag & drop image"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "hero_image")}
                            className="hidden"
                            id="hero_image_upload"
                          />
                          <label htmlFor="hero_image_upload">
                            <Button
                              type="button"
                              className="bg-white/20 text-white hover:bg-white/30 w-full cursor-pointer"
                              disabled={uploading.hero_image}
                              onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('hero_image_upload').click();
                              }}
                            >
                              {uploading.hero_image ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload size={16} className="mr-2" />
                                  Upload Image
                                </>
                              )}
                            </Button>
                          </label>
                          {formData.hero_image && (
                            <img src={formData.hero_image} alt="Hero preview" className="w-full h-40 object-cover rounded mt-2" />
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-white mb-2 block">Hero Video URL (Optional)</Label>
                        <div 
                          className="border-2 border-dashed border-white/20 rounded p-4 bg-white/5 hover:bg-white/10 transition-colors"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, "hero_video")}
                        >
                          <Input
                            type="url"
                            value={formData.hero_video}
                            onChange={(e) => setFormData({ ...formData, hero_video: e.target.value })}
                            className="bg-white/10 border-white/20 text-white mb-2"
                            placeholder="https://... or drag & drop video"
                          />
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileUpload(e, "hero_video")}
                            className="hidden"
                            id="hero_video_upload"
                          />
                          <label htmlFor="hero_video_upload">
                            <Button
                              type="button"
                              className="bg-white/20 text-white hover:bg-white/30 w-full cursor-pointer"
                              disabled={uploading.hero_video}
                              onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('hero_video_upload').click();
                              }}
                            >
                              {uploading.hero_video ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload size={16} className="mr-2" />
                                  Upload Video
                                </>
                              )}
                            </Button>
                          </label>
                          {formData.hero_video && (
                            <video src={formData.hero_video} className="w-full h-40 object-cover rounded mt-2" controls />
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Hero Image Format</Label>
                      <Select 
                        value={formData.hero_image_format} 
                        onValueChange={(value) => setFormData({ ...formData, hero_image_format: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="square">Square (600x600)</SelectItem>
                          <SelectItem value="portrait">Portrait (3:4)</SelectItem>
                          <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <Label className="text-white text-lg mb-4 block">Thumbnail Media</Label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white mb-2 block">Thumbnail Image URL *</Label>
                        <div 
                          className="border-2 border-dashed border-white/20 rounded p-4 bg-white/5 hover:bg-white/10 transition-colors"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, "thumbnail_image")}
                        >
                          <Input
                            type="url"
                            required
                            value={formData.thumbnail_image}
                            onChange={(e) => setFormData({ ...formData, thumbnail_image: e.target.value })}
                            className="bg-white/10 border-white/20 text-white mb-2"
                            placeholder="https://... or drag & drop image"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "thumbnail_image")}
                            className="hidden"
                            id="thumbnail_image_upload"
                          />
                          <label htmlFor="thumbnail_image_upload">
                            <Button
                              type="button"
                              className="bg-white/20 text-white hover:bg-white/30 w-full cursor-pointer"
                              disabled={uploading.thumbnail_image}
                              onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('thumbnail_image_upload').click();
                              }}
                            >
                              {uploading.thumbnail_image ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload size={16} className="mr-2" />
                                  Upload Image
                                </>
                              )}
                            </Button>
                          </label>
                          {formData.thumbnail_image && (
                            <img src={formData.thumbnail_image} alt="Thumbnail preview" className="w-full h-40 object-cover rounded mt-2" />
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-white mb-2 block">Thumbnail Video URL (Optional)</Label>
                        <div 
                          className="border-2 border-dashed border-white/20 rounded p-4 bg-white/5 hover:bg-white/10 transition-colors"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, "thumbnail_video")}
                        >
                          <Input
                            type="url"
                            value={formData.thumbnail_video}
                            onChange={(e) => setFormData({ ...formData, thumbnail_video: e.target.value })}
                            className="bg-white/10 border-white/20 text-white mb-2"
                            placeholder="https://... or drag & drop video"
                          />
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileUpload(e, "thumbnail_video")}
                            className="hidden"
                            id="thumbnail_video_upload"
                          />
                          <label htmlFor="thumbnail_video_upload">
                            <Button
                              type="button"
                              className="bg-white/20 text-white hover:bg-white/30 w-full cursor-pointer"
                              disabled={uploading.thumbnail_video}
                              onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('thumbnail_video_upload').click();
                              }}
                            >
                              {uploading.thumbnail_video ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload size={16} className="mr-2" />
                                  Upload Video
                                </>
                              )}
                            </Button>
                          </label>
                          {formData.thumbnail_video && (
                            <video src={formData.thumbnail_video} className="w-full h-40 object-cover rounded mt-2" controls />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <Label className="text-white text-lg mb-4 block">Content Section 1 *</Label>
                    <div className="bg-white rounded">
                      <ReactQuill 
                        theme="snow" 
                        value={formData.content_section_1}
                        onChange={(value) => setFormData({ ...formData, content_section_1: value })}
                        modules={quillModules}
                        formats={quillFormats}
                        className="h-64 mb-12"
                        placeholder="Paste or type your content here..."
                      />
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-white/20 pt-4">
                    <Label className="text-white text-lg block">Image Carousel (Max 8, Portrait)</Label>
                    <p className="text-sm text-gray-400">4 images per view, 5 second auto-scroll</p>
                    
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleCarouselUpload}
                      className="hidden"
                      id="carousel-upload"
                    />
                    
                    <label
                      htmlFor="carousel-upload"
                      className="block w-full p-4 border-2 border-dashed border-white/20 rounded text-center cursor-pointer hover:border-white/40 transition-colors"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const files = Array.from(e.dataTransfer.files || []);
                        handleMultipleCarouselUpload({ target: { files } });
                      }}
                    >
                      {uploading.carousel ? (
                        <span className="text-gray-400">Uploading...</span>
                      ) : (
                        <span className="text-gray-400">Click or drag to select multiple images</span>
                      )}
                    </label>

                    {formData.carousel_images && formData.carousel_images.length > 0 && (
                      <DragDropContext onDragEnd={handleCarouselReorder}>
                        <Droppable droppableId="carousel-images">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-2 mt-3"
                            >
                              {formData.carousel_images.map((img, index) => (
                                <Draggable key={`carousel-image-${index}`} draggableId={`carousel-image-${index}`} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`flex items-center gap-3 bg-white/10 p-3 rounded border border-white/10 ${
                                        snapshot.isDragging ? "shadow-lg ring-2 ring-purple-500" : ""
                                      }`}
                                    >
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-white flex-shrink-0"
                                        title="Drag to reorder"
                                      >
                                        <GripVertical size={20} />
                                      </div>

                                      <img
                                        src={img.url}
                                        alt={`Carousel image ${index + 1}`}
                                        className="w-12 h-16 object-cover rounded flex-shrink-0"
                                      />

                                      <div className="flex-1">
                                        <Input
                                          placeholder="Caption (optional)"
                                          value={img.caption || ""}
                                          onChange={(e) => {
                                            const updated = [...formData.carousel_images];
                                            updated[index].caption = e.target.value;
                                            setFormData(prev => ({ ...prev, carousel_images: updated }));
                                          }}
                                          className="bg-white/5 border-white/20 text-white text-sm"
                                        />
                                      </div>

                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <Button
                                          type="button"
                                          onClick={() => moveCarouselImage(index, "up")}
                                          disabled={index === 0}
                                          variant="ghost"
                                          size="icon"
                                          className="text-gray-400 hover:text-white disabled:opacity-30"
                                          title="Move Up"
                                        >
                                          <ChevronUp size={16} />
                                        </Button>
                                        <Button
                                          type="button"
                                          onClick={() => moveCarouselImage(index, "down")}
                                          disabled={index === formData.carousel_images.length - 1}
                                          variant="ghost"
                                          size="icon"
                                          className="text-gray-400 hover:text-white disabled:opacity-30"
                                          title="Move Down"
                                        >
                                          <ChevronDown size={16} />
                                        </Button>
                                        <Button
                                          type="button"
                                          onClick={() => {
                                            setFormData(prev => ({
                                              ...prev,
                                              carousel_images: prev.carousel_images.filter((_, i) => i !== index)
                                            }));
                                          }}
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-400 hover:bg-red-500/10"
                                          title="Remove image"
                                        >
                                          <X size={16} />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                    <p className="text-xs text-gray-500">
                      {formData.carousel_images?.length || 0} / 8 images uploaded
                    </p>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <Label className="text-white text-lg mb-4 block">Content Section 2</Label>
                    <div className="bg-white rounded">
                      <ReactQuill 
                        theme="snow" 
                        value={formData.content_section_2}
                        onChange={(value) => setFormData({ ...formData, content_section_2: value })}
                        modules={quillModules}
                        formats={quillFormats}
                        className="h-64 mb-12"
                        placeholder="Paste or type your content here..."
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <Label className="text-white text-lg mb-4 block">Middle Section Type</Label>
                    <Select 
                      value={formData.middle_section_type || "none"} 
                      onValueChange={(value) => setFormData({ ...formData, middle_section_type: value })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="gallery">Image Gallery</SelectItem>
                        <SelectItem value="product_carousel">Product Carousel</SelectItem>
                        <SelectItem value="video">Full-Width Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.middle_section_type === "video" && (
                    <div className="space-y-3 border-t border-white/20 pt-4">
                      <Label className="text-white text-lg block">Middle Section Video URL (Full-width)</Label>
                      <Input
                        type="url"
                        value={formData.middle_section_video}
                        onChange={(e) => setFormData({ ...formData, middle_section_video: e.target.value })}
                        placeholder="Enter video URL (mp4)"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  )}

                  {formData.middle_section_type === "gallery" && (
                    <div className="border-t border-white/20 pt-4">
                      <Label className="text-white text-lg mb-2 block">Image Gallery (Max 8)</Label>
                      
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const files = Array.from(e.dataTransfer.files || []);
                          handleMultipleGalleryUpload({ target: { files } });
                        }}
                        className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center mb-4 hover:border-white/40 transition-colors"
                      >
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleMultipleGalleryUpload}
                          className="hidden"
                          id="gallery-upload"
                        />
                        <label htmlFor="gallery-upload" className="cursor-pointer">
                          <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-400">
                            {uploading.gallery ? "Uploading..." : "Click or drag multiple images (Max 8)"}
                          </p>
                        </label>
                      </div>

                      {formData.gallery_images && formData.gallery_images.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          {formData.gallery_images.map((img, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={img.url}
                                alt=""
                                className="w-full aspect-[3/4] object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newGallery = formData.gallery_images.filter((_, i) => i !== index);
                                  setFormData(prev => ({ ...prev, gallery_images: newGallery }));
                                }}
                                className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                              <div className="mt-2 space-y-1">
                                <Input
                                  value={img.source || ""}
                                  onChange={(e) => {
                                    const newGallery = [...formData.gallery_images];
                                    newGallery[index] = { ...newGallery[index], source: e.target.value };
                                    setFormData(prev => ({ ...prev, gallery_images: newGallery }));
                                  }}
                                  placeholder="Source"
                                  className="bg-white/10 border-white/20 text-white text-xs"
                                />
                                <Input
                                  value={img.caption || ""}
                                  onChange={(e) => {
                                    const newGallery = [...formData.gallery_images];
                                    newGallery[index] = { ...newGallery[index], caption: e.target.value };
                                    setFormData(prev => ({ ...prev, gallery_images: newGallery }));
                                  }}
                                  placeholder="Caption"
                                  className="bg-white/10 border-white/20 text-white text-xs"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {formData.middle_section_type === "product_carousel" && (
                    <div className="border-t border-white/20 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-white text-lg">Product Carousel</Label>
                        <Button
                          type="button"
                          onClick={addProduct}
                          className="bg-white/20 text-white hover:bg-white/30"
                        >
                          <Plus size={16} className="mr-2" />
                          Add Product
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {productCarousel.map((item, index) => (
                          <div key={index} className="bg-white/5 p-4 rounded space-y-3 border border-white/10">
                            <div className="flex items-center justify-between">
                              <Label className="text-white">Product {index + 1}</Label>
                              <Button
                                type="button"
                                onClick={() => removeProduct(index)}
                                className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                size="sm"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-white text-sm mb-2 block">Product Image *</Label>
                                <Input
                                  type="url"
                                  value={item.image}
                                  onChange={(e) => updateProduct(index, "image", e.target.value)}
                                  className="bg-white/10 border-white/20 text-white mb-2"
                                  placeholder="https://..."
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleProductImageUpload(e, index)}
                                  className="hidden"
                                  id={`product_upload_${index}`}
                                />
                                <label htmlFor={`product_upload_${index}`}>
                                  <Button
                                    type="button"
                                    className="bg-white/20 text-white hover:bg-white/30 w-full cursor-pointer"
                                    disabled={uploading[`product-${index}`]}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      document.getElementById(`product_upload_${index}`).click();
                                    }}
                                  >
                                    {uploading[`product-${index}`] ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Upload size={16} className="mr-2" />
                                        Upload
                                      </>
                                    )}
                                  </Button>
                                </label>
                                {item.image && (
                                  <img src={item.image} alt="" className="w-full h-32 object-cover rounded mt-2" />
                                )}
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <Label className="text-white text-sm">Product Title *</Label>
                                  <Input
                                    value={item.title}
                                    onChange={(e) => updateProduct(index, "title", e.target.value)}
                                    placeholder="Product name"
                                    className="bg-white/10 border-white/20 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-white text-sm">Price</Label>
                                  <Input
                                    value={item.price}
                                    onChange={(e) => updateProduct(index, "price", e.target.value)}
                                    placeholder="€99.99"
                                    className="bg-white/10 border-white/20 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-white text-sm">Purchase URL *</Label>
                                  <Input
                                    type="url"
                                    value={item.url}
                                    onChange={(e) => updateProduct(index, "url", e.target.value)}
                                    placeholder="https://..."
                                    className="bg-white/10 border-white/20 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-white text-sm">Button Text</Label>
                                  <Input
                                    value={item.button_text || "Buy Now"}
                                    onChange={(e) => updateProduct(index, "button_text", e.target.value)}
                                    placeholder="Buy Now"
                                    className="bg-white/10 border-white/20 text-white"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/20 pt-4">
                    <Label className="text-white text-lg mb-4 block">Content Section 3 (Final Section)</Label>
                    <div className="bg-white rounded">
                      <ReactQuill 
                        theme="snow" 
                        value={formData.content_section_3}
                        onChange={(value) => setFormData({ ...formData, content_section_3: value })}
                        modules={quillModules}
                        formats={quillFormats}
                        className="h-64 mb-12"
                        placeholder="Paste or type your content here..."
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <div>
                      <Label className="text-white">Backlink URL</Label>
                      <Input
                        type="url"
                        value={formData.backlink}
                        onChange={(e) => setFormData({ ...formData, backlink: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-white">Read Time (min)</Label>
                      <Input
                        type="number"
                        value={formData.read_time}
                        onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Page Views</Label>
                      <Input
                        type="number"
                        value={formData.page_views}
                        onChange={(e) => setFormData({ ...formData, page_views: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white">CTR (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.ctr}
                        onChange={(e) => setFormData({ ...formData, ctr: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Shares</Label>
                      <Input
                        type="number"
                        value={formData.shares_count}
                        onChange={(e) => setFormData({ ...formData, shares_count: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Published Date</Label>
                    <Input
                      type="date"
                      value={formData.published_date}
                      onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button 
                      type="submit" 
                      className="bg-green-600 text-white hover:bg-green-700 text-lg px-8 py-6"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {(createMutation.isPending || updateMutation.isPending) ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                          {editingArticle ? "UPDATING..." : "CREATING..."}
                        </>
                      ) : (
                        <>
                          {editingArticle ? "🔄 UPDATE ARTICLE" : "➕ CREATE ARTICLE"}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingArticle(null);
                        resetForm();
                      }}
                      className="bg-white/10 text-white hover:bg-white/20 px-8 py-6"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {previewArticle && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-black/90 backdrop-blur-sm p-4 rounded z-10">
                  <div>
                    <h2 className="text-2xl font-light text-white">Article Preview</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {previewArticle.status === "published" ? "Published" : "Preview Mode"}
                    </p>
                  </div>
                  <Button
                    onClick={() => setPreviewArticle(null)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <X size={24} />
                  </Button>
                </div>

                <div className="bg-[#0d0d0d] rounded-lg overflow-hidden">
                  <div className="relative w-full overflow-hidden bg-black py-20">
                    <div className="max-w-5xl mx-auto px-6">
                      <div className={`${
                        previewArticle.hero_image_format === "square" ? "aspect-square max-w-[600px] h-[600px] mx-auto" :
                        previewArticle.hero_image_format === "portrait" ? "aspect-[3/4] max-w-3xl h-[800px] mx-auto" :
                        "aspect-[16/9] w-full h-[600px]"
                      }`}>
                        {previewArticle.hero_video ? (
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls
                            className="w-full h-full object-cover"
                            onLoadedMetadata={(e) => e.target.play().catch(() => {})}
                          >
                            <source src={previewArticle.hero_video} type="video/mp4" />
                          </video>
                        ) : (
                          <img
                            src={previewArticle.hero_image}
                            alt={previewArticle.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="mt-8">
                        <span className="inline-block px-4 py-1 text-xs tracking-widest uppercase bg-purple-600/30 border border-purple-400/30 rounded-full mb-4">
                          {previewArticle.category}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-light mb-4 leading-tight text-white">
                          {previewArticle.title}
                        </h1>
                        {previewArticle.subtitle && (
                          <p className="text-xl md:text-2xl text-gray-300 font-light mb-6">
                            {previewArticle.subtitle}
                          </p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          {previewArticle.published_date && (
                            <span>{new Date(previewArticle.published_date).toLocaleDateString()}</span>
                          )}
                          {previewArticle.read_time && (
                            <span>{previewArticle.read_time} min read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-[1400px] mx-auto px-6 py-20">
                    <div className="grid lg:grid-cols-[1fr_300px] gap-12">
                      <div>
                        {previewArticle.content_section_1 && (
                          <div
                            dangerouslySetInnerHTML={{ __html: previewArticle.content_section_1 }}
                            className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed"
                            style={{ fontSize: "1.125rem", lineHeight: "2" }}
                          />
                        )}

                        {previewArticle.carousel_images && previewArticle.carousel_images.length > 0 && (
                          <div className="grid grid-cols-4 gap-0 my-12">
                            {previewArticle.carousel_images.slice(0, 4).map((image, idx) => (
                              <div key={idx} className="aspect-[3/4] overflow-hidden">
                                <img
                                  src={image.url}
                                  alt={image.caption || ""}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {previewArticle.content_section_2 && (
                          <div
                            dangerouslySetInnerHTML={{ __html: previewArticle.content_section_2 }}
                            className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed mt-12"
                            style={{ fontSize: "1.125rem", lineHeight: "2" }}
                          />
                        )}

                        {previewArticle.middle_section_type === "video" && previewArticle.middle_section_video && (
                          <div className="my-12 w-full">
                            <video
                              autoPlay
                              loop
                              muted
                              playsInline
                              controls
                              className="w-full h-auto object-cover"
                              onLoadedMetadata={(e) => e.target.play().catch(() => {})}
                            >
                              <source src={previewArticle.middle_section_video} type="video/mp4" />
                            </video>
                          </div>
                        )}

                        {previewArticle.middle_section_type === "gallery" && previewArticle.gallery_images && previewArticle.gallery_images.length > 0 && (
                          <div className="grid grid-cols-4 gap-0 my-12">
                            {previewArticle.gallery_images.map((image, idx) => (
                              <div key={idx} className="aspect-[3/4] overflow-hidden">
                                <img
                                  src={image.url}
                                  alt={image.caption || ""}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {previewArticle.middle_section_type === "product_carousel" && previewArticle.product_carousel && previewArticle.product_carousel.length > 0 && (
                          <div className="flex gap-4 overflow-x-auto my-12 scrollbar-hide">
                            {previewArticle.product_carousel.map((product, idx) => (
                              <div key={idx} className="flex-shrink-0 w-64 bg-white/5 border border-white/10">
                                <img
                                  src={product.image}
                                  alt={product.title}
                                  className="w-full aspect-square object-cover"
                                />
                                <div className="p-4">
                                  <h4 className="text-white font-medium mb-2">{product.title}</h4>
                                  <p className="text-gray-400 text-lg mb-3">{product.price}</p>
                                  <a
                                    href={product.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm"
                                  >
                                    {product.button_text || "Buy Now"}
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {previewArticle.content_section_3 && (
                          <div
                            dangerouslySetInnerHTML={{ __html: previewArticle.content_section_3 }}
                            className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed mt-12"
                            style={{ fontSize: "1.125rem", lineHeight: "2" }}
                          />
                        )}
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 p-4 text-center">
                          <p className="text-sm text-gray-400">Sidebar Ads & Categories</p>
                          <p className="text-xs text-gray-500 mt-2">Will appear here on live page</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
  );
}
