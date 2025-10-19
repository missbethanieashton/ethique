import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, GripVertical, Upload } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function FeaturedManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingFeatured, setEditingFeatured] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    type: "Fashion Designer",
    excerpt: "",
    thumbnail: "",
    video: "",
    article_id: "",
    location: "",
    order: 0,
  });

  const queryClient = useQueryClient();

  const { data: featured = [], isLoading } = useQuery({
    queryKey: ["featured"],
    queryFn: () => base44.entities.Featured.list("order"),
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["articles-list"],
    queryFn: async () => {
      const all = await base44.entities.Article.list();
      return all.filter(a => a.status === "published");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Featured.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured"] });
      setShowForm(false);
      setEditingFeatured(null);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Featured.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured"] });
      setShowForm(false);
      setEditingFeatured(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Featured.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured"] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedFeatured) => {
      const updates = reorderedFeatured.map((item, index) =>
        base44.entities.Featured.update(item.id, { order: index })
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured"] });
      alert("Featured order saved successfully!");
      setReorderMode(false);
    },
  });

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result && result.file_url) {
        setFormData(prev => ({ ...prev, [type]: result.file_url }));
      }
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
      if (e.target) e.target.value = '';
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(featured);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    queryClient.setQueryData(["featured"], updatedItems);
  };

  const saveReorder = () => {
    reorderMutation.mutate(featured);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingFeatured) {
      updateMutation.mutate({
        id: editingFeatured.id,
        data: formData
      });
    } else {
      const maxOrder = featured.length > 0 ? Math.max(...featured.map(f => f.order)) : -1;
      createMutation.mutate({ ...formData, order: maxOrder + 1 });
    }
  };

  const handleEdit = (feature) => {
    setEditingFeatured(feature);
    setFormData({
      title: feature.title || "",
      type: feature.type || "Fashion Designer",
      excerpt: feature.excerpt || "",
      thumbnail: feature.thumbnail || "",
      video: feature.video || "",
      article_id: feature.article_id || "",
      location: feature.location || "",
      order: feature.order || 0,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "Fashion Designer",
      excerpt: "",
      thumbnail: "",
      video: "",
      article_id: "",
      location: "",
      order: 0,
    });
    setEditingFeatured(null);
    setUploading({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">Featured Content Manager</h2>
        <div className="flex items-center gap-3">
          {reorderMode ? (
            <>
              <Button
                onClick={() => {
                  setReorderMode(false);
                  queryClient.invalidateQueries({ queryKey: ["featured"] });
                }}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={saveReorder}
                className="bg-white text-black hover:bg-gray-200"
                disabled={reorderMutation.isPending}
              >
                {reorderMutation.isPending ? "Saving..." : "Save Order"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setReorderMode(true)}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
                disabled={featured.length === 0}
              >
                <GripVertical size={16} className="mr-2" />
                Reorder Featured
              </Button>
              <Button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) {
                    setEditingFeatured(null);
                    resetForm();
                  } else {
                    resetForm();
                  }
                }}
                className="bg-white text-black hover:bg-gray-200"
              >
                <Plus size={16} className="mr-2" />
                {showForm ? "Cancel" : "Add Featured"}
              </Button>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/20 p-6 space-y-4 rounded-lg">
          {editingFeatured && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded">
              <p className="text-blue-400 text-sm">Editing: {editingFeatured.title}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2">Feature Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chef">Chef</SelectItem>
                  <SelectItem value="Fashion Designer">Fashion Designer</SelectItem>
                  <SelectItem value="Hotel">Hotel</SelectItem>
                  <SelectItem value="Fashion Icon">Fashion Icon</SelectItem>
                  <SelectItem value="Creators">Creators (Homepage Polaroid Section)</SelectItem>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-white">Excerpt (50 words) *</Label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              required
              rows={3}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Thumbnail Image *</Label>
            <Input
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              placeholder="Image URL"
              className="bg-white/5 border-white/20 text-white mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "thumbnail")}
              className="hidden"
              id="thumbnail_upload"
            />
            <Button
              type="button"
              disabled={uploading.thumbnail}
              className="bg-white/10 w-full text-white hover:bg-white/20"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('thumbnail_upload').click();
              }}
            >
              <Upload size={16} className="mr-2" />
              {uploading.thumbnail ? "Uploading..." : "Upload Image"}
            </Button>
            {formData.thumbnail && (
              <img src={formData.thumbnail} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
            )}
          </div>

          <div>
            <Label className="text-white mb-2 block">Video (Optional)</Label>
            <Input
              value={formData.video}
              onChange={(e) => setFormData({ ...formData, video: e.target.value })}
              placeholder="Video URL"
              className="bg-white/5 border-white/20 text-white mb-2"
            />
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload(e, "video")}
              className="hidden"
              id="video_upload"
            />
            <Button
              type="button"
              disabled={uploading.video}
              className="bg-white/10 w-full text-white hover:bg-white/20"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('video_upload').click();
              }}
            >
              <Upload size={16} className="mr-2" />
              {uploading.video ? "Uploading..." : "Upload Video"}
            </Button>
            {formData.video && (
              <video src={formData.video} className="mt-2 w-full max-w-xs h-32 object-cover rounded" controls />
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white mb-2">Article (Optional)</Label>
              <Select
                value={formData.article_id}
                onValueChange={(value) => setFormData({ ...formData, article_id: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select an article" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {articles.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === "Creators" && (
              <div>
                <Label className="text-white mb-2">Location (City)</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Paris"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="bg-white text-black hover:bg-gray-200"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingFeatured ? "Update" : "Create"} Featured
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingFeatured(null);
                resetForm();
              }}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="border border-white/10 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading featured items...</div>
        ) : featured.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No featured items yet.</div>
        ) : reorderMode ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="featured">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {featured.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-4 p-4 border-b border-white/10 ${
                            snapshot.isDragging ? "bg-white/10" : "bg-transparent hover:bg-white/5"
                          }`}
                        >
                          <div {...provided.dragHandleProps}>
                            <GripVertical size={20} className="text-gray-400 cursor-grab" />
                          </div>

                          <div className="w-16 h-16 flex-shrink-0">
                            {item.video ? (
                              <video
                                src={item.video}
                                className="w-full h-full object-cover rounded"
                                muted
                                playsInline
                                preload="metadata"
                              />
                            ) : (
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">{item.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                              <span className="px-2 py-0.5 bg-blue-600/30 border border-blue-400/30 rounded-full">
                                {item.type}
                              </span>
                              {item.location && <span className="text-gray-500">({item.location})</span>}
                            </div>
                          </div>

                          <div className="text-sm text-gray-400">
                            Order: {index + 1}
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
        ) : (
          <div>
            {featured.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border-b border-white/10 hover:bg-white/5"
              >
                <div className="w-16 h-16 flex-shrink-0">
                  {item.video ? (
                    <video
                      src={item.video}
                      className="w-full h-full object-cover rounded"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{item.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="px-2 py-0.5 bg-blue-600/30 border border-blue-400/30 rounded-full">
                      {item.type}
                    </span>
                    {item.location && <span className="text-gray-500">({item.location})</span>}
                    <span className="text-gray-500 truncate">{item.excerpt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(item)}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this featured item?")) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}