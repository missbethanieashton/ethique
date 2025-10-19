import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function CategoryManager() {
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.list("order"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Category.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowForm(false);
      setEditingCategory(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Category.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowForm(false);
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Category.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.active = formData.get("active") === "on";
    data.order = parseInt(data.order) || 0;
    
    // Auto-generate slug from name if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">Category Manager</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingCategory(null);
          }}
          className="bg-white text-black hover:bg-gray-200"
        >
          <Plus size={16} className="mr-2" />
          New Category
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/20 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Category Name *</Label>
              <Input
                name="name"
                required
                defaultValue={editingCategory?.name}
                className="bg-white/10 border-white/20 text-white"
                placeholder="e.g. Fashion, Art, Cuisine"
              />
            </div>

            <div>
              <Label className="text-white">Slug *</Label>
              <Input
                name="slug"
                defaultValue={editingCategory?.slug}
                className="bg-white/10 border-white/20 text-white"
                placeholder="e.g. fashion, art, cuisine"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Description</Label>
            <Textarea
              name="description"
              rows={3}
              defaultValue={editingCategory?.description}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Brief description of this category..."
            />
          </div>

          <div>
            <Label className="text-white">Hero Image URL</Label>
            <Input
              name="hero_image"
              type="url"
              defaultValue={editingCategory?.hero_image}
              className="bg-white/10 border-white/20 text-white"
              placeholder="https://..."
            />
          </div>

          <div>
            <Label className="text-white">Hero Video URL</Label>
            <Input
              name="hero_video"
              type="url"
              defaultValue={editingCategory?.hero_video}
              className="bg-white/10 border-white/20 text-white"
              placeholder="https://..."
            />
          </div>

          <div>
            <Label className="text-white">Icon</Label>
            <Input
              name="icon"
              defaultValue={editingCategory?.icon}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Icon name or URL"
            />
          </div>

          <div>
            <Label className="text-white">Display Order</Label>
            <Input
              name="order"
              type="number"
              defaultValue={editingCategory?.order || 0}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              name="active"
              defaultChecked={editingCategory?.active !== false}
            />
            <Label htmlFor="active" className="text-white">Active</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-white text-black hover:bg-gray-200">
              {editingCategory ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingCategory(null);
              }}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white/5 border border-white/20 p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {category.hero_image && (
                  <img
                    src={category.hero_image}
                    alt={category.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium text-white">{category.name}</h3>
                  <p className="text-sm text-gray-400">{category.slug} • Order: {category.order}</p>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditingCategory(category);
                  setShowForm(true);
                }}
                className="bg-white/10 text-white hover:bg-white/20"
                size="sm"
              >
                <Pencil size={16} />
              </Button>
              <Button
                onClick={() => {
                  if (confirm("Delete this category?")) {
                    deleteMutation.mutate(category.id);
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