import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus, Tag } from "lucide-react";

export default function TagManager() {
  const [editingTag, setEditingTag] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: () => base44.entities.Tag.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Tag.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setShowForm(false);
      setEditingTag(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tag.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setShowForm(false);
      setEditingTag(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Tag.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.active = formData.get("active") === "on";
    
    // Auto-generate slug from name if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    
    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">Tag Manager</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingTag(null);
          }}
          className="bg-white text-black hover:bg-gray-200"
        >
          <Plus size={16} className="mr-2" />
          New Tag
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/20 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Tag Name *</Label>
              <Input
                name="name"
                required
                defaultValue={editingTag?.name}
                className="bg-white/10 border-white/20 text-white"
                placeholder="e.g. SS26, Paris Fashion Week"
              />
            </div>

            <div>
              <Label className="text-white">Slug *</Label>
              <Input
                name="slug"
                defaultValue={editingTag?.slug}
                className="bg-white/10 border-white/20 text-white"
                placeholder="e.g. ss26, paris-fashion-week"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Description</Label>
            <Textarea
              name="description"
              rows={2}
              defaultValue={editingTag?.description}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Brief description of this tag..."
            />
          </div>

          <div>
            <Label className="text-white">Color (Hex Code)</Label>
            <Input
              name="color"
              type="color"
              defaultValue={editingTag?.color || "#6366f1"}
              className="bg-white/10 border-white/20 text-white h-12"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              name="active"
              defaultChecked={editingTag?.active !== false}
            />
            <Label htmlFor="active" className="text-white">Active</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-white text-black hover:bg-gray-200">
              {editingTag ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingTag(null);
              }}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="bg-white/5 border border-white/20 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: tag.color }}
              />
              <div>
                <h3 className="text-base font-medium text-white">{tag.name}</h3>
                <p className="text-xs text-gray-400">{tag.slug}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditingTag(tag);
                  setShowForm(true);
                }}
                className="bg-white/10 text-white hover:bg-white/20"
                size="sm"
              >
                <Pencil size={16} />
              </Button>
              <Button
                onClick={() => {
                  if (confirm("Delete this tag?")) {
                    deleteMutation.mutate(tag.id);
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