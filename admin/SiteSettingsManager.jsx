import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function SiteSettingsManager() {
  const [editingSetting, setEditingSetting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => base44.entities.SiteSettings.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SiteSettings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      setShowForm(false);
      setEditingSetting(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SiteSettings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      setShowForm(false);
      setEditingSetting(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SiteSettings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.active = formData.get("active") === "on";
    
    if (editingSetting) {
      updateMutation.mutate({ id: editingSetting.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">Site Settings Manager</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingSetting(null);
          }}
          className="bg-white text-black hover:bg-gray-200"
        >
          <Plus size={16} className="mr-2" />
          New Setting
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/20 p-6 space-y-4">
          <div>
            <Label className="text-white">Section Name *</Label>
            <Input
              name="section_name"
              required
              placeholder="e.g. hero, featured, membership"
              defaultValue={editingSetting?.section_name}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Heading</Label>
            <Input
              name="heading"
              defaultValue={editingSetting?.heading}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Subheading</Label>
            <Textarea
              name="subheading"
              defaultValue={editingSetting?.subheading}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Background Image URL</Label>
            <Input
              name="background_image"
              type="url"
              defaultValue={editingSetting?.background_image}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Background Video URL</Label>
            <Input
              name="background_video"
              type="url"
              defaultValue={editingSetting?.background_video}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <Label className="text-white">CTA Button Text</Label>
            <Input
              name="cta_text"
              defaultValue={editingSetting?.cta_text}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <Label className="text-white">CTA Button URL</Label>
            <Input
              name="cta_url"
              type="url"
              defaultValue={editingSetting?.cta_url}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              name="active"
              defaultChecked={editingSetting?.active !== false}
            />
            <Label htmlFor="active" className="text-white">Active</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-white text-black hover:bg-gray-200">
              {editingSetting ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingSetting(null);
              }}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="bg-white/5 border border-white/20 p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">{setting.section_name}</h3>
              <p className="text-sm text-gray-400">
                {setting.heading} • {setting.active ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditingSetting(setting);
                  setShowForm(true);
                }}
                className="bg-white/10 text-white hover:bg-white/20"
                size="sm"
              >
                <Pencil size={16} />
              </Button>
              <Button
                onClick={() => {
                  if (confirm("Delete this setting?")) {
                    deleteMutation.mutate(setting.id);
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