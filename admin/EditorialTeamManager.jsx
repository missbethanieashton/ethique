import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function EditorialTeamManager() {
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    title: "",
    bio: "",
    profile_image: "",
    profile_video: "",
    linkedin_url: "",
    portfolio_url: "",
    instagram_link: "",
    order: 0,
    active: true,
  });
  const [uploading, setUploading] = useState({});

  const queryClient = useQueryClient();

  const { data: team = [], isLoading } = useQuery({
    queryKey: ["editorialTeam"],
    queryFn: () => base44.entities.EditorialTeam.list("order"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EditorialTeam.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["editorialTeam"]);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EditorialTeam.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["editorialTeam"]);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EditorialTeam.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["editorialTeam"]);
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
    e.currentTarget.classList.add('bg-white/20');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-white/20');
  };

  const handleDrop = async (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-white/20');
    
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
    console.log("Submitting form data:", formData);
    
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (member) => {
    console.log("Editing member:", member);
    setEditingMember(member);
    setFormData({
      full_name: member.full_name || "",
      title: member.title || "",
      bio: member.bio || "",
      profile_image: member.profile_image || "",
      profile_video: member.profile_video || "",
      linkedin_url: member.linkedin_url || "",
      portfolio_url: member.portfolio_url || "",
      instagram_link: member.instagram_link || "",
      order: member.order || 0,
      active: member.active !== undefined ? member.active : true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormData({
      full_name: "",
      title: "",
      bio: "",
      profile_image: "",
      profile_video: "",
      linkedin_url: "",
      portfolio_url: "",
      instagram_link: "",
      order: 0,
      active: true,
    });
    setUploading({});
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">Editorial Team Profiles</h2>
        <Button
          onClick={resetForm}
          className="bg-white text-black hover:bg-gray-200"
        >
          <Plus size={16} className="mr-2" />
          Add New Member
        </Button>
      </div>

      <Card className="bg-white/5 border-white/10 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {editingMember && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded">
              <p className="text-blue-400 text-sm">Editing: {editingMember.full_name}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white">Full Name *</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g. Editor in Chief, Senior Editor"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Bio</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white mb-2 block">Profile Image *</Label>
              <div 
                className="border-2 border-dashed border-white/20 rounded p-4 bg-white/5 hover:bg-white/10 transition-colors"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "profile_image")}
              >
                <Input
                  value={formData.profile_image}
                  onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                  placeholder="Image URL or drag & drop a file here"
                  className="bg-white/5 border-white/20 text-white mb-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "profile_image")}
                  className="hidden"
                  id="profile_image_upload"
                />
                <Button 
                  type="button" 
                  disabled={uploading.profile_image} 
                  className="bg-white/10 w-full cursor-pointer text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('profile_image_upload').click();
                  }}
                >
                  <Upload size={16} className="mr-2" />
                  {uploading.profile_image ? "Uploading..." : "Click to Upload Image"}
                </Button>
                <p className="text-xs text-gray-400 mt-2 text-center">Click button or drag & drop file here</p>
              </div>
              {formData.profile_image && (
                <div className="mt-2">
                  <img src={formData.profile_image} alt="Preview" className="h-32 w-32 object-cover rounded" />
                  <p className="text-xs text-green-400 mt-1">Image uploaded successfully</p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-white mb-2 block">Profile Video (Optional)</Label>
              <div 
                className="border-2 border-dashed border-white/20 rounded p-4 bg-white/5 hover:bg-white/10 transition-colors"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "profile_video")}
              >
                <Input
                  value={formData.profile_video}
                  onChange={(e) => setFormData({ ...formData, profile_video: e.target.value })}
                  placeholder="Video URL or drag & drop a file here"
                  className="bg-white/5 border-white/20 text-white mb-2"
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, "profile_video")}
                  className="hidden"
                  id="profile_video_upload"
                />
                <Button 
                  type="button" 
                  disabled={uploading.profile_video} 
                  className="bg-white/10 w-full cursor-pointer text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('profile_video_upload').click();
                  }}
                >
                  <Upload size={16} className="mr-2" />
                  {uploading.profile_video ? "Uploading..." : "Click to Upload Video"}
                </Button>
                <p className="text-xs text-gray-400 mt-2 text-center">Click button or drag & drop file here</p>
              </div>
              {formData.profile_video && (
                <p className="text-xs text-green-400 mt-2">Video uploaded successfully</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label className="text-white">LinkedIn URL</Label>
              <Input
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Portfolio URL</Label>
              <Input
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                placeholder="https://..."
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Instagram URL</Label>
              <Input
                value={formData.instagram_link}
                onChange={(e) => setFormData({ ...formData, instagram_link: e.target.value })}
                placeholder="https://instagram.com/..."
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Order (0 for Editor in Chief)</Label>
            <Input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="bg-white text-black hover:bg-gray-200">
              {editingMember ? "Update" : "Create"} Profile
            </Button>
            {editingMember && (
              <Button type="button" onClick={resetForm} variant="outline" className="border-white/20 text-white">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        {team.map((member) => (
          <Card key={member.id} className="bg-white/5 border-white/10 p-4">
            <div className="flex items-center gap-4">
              {member.profile_image && (
                <img
                  src={member.profile_image}
                  alt={member.full_name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="text-white font-medium">{member.full_name}</h3>
                <p className="text-gray-400 text-sm">{member.title}</p>
                <p className="text-gray-500 text-xs">Order: {member.order}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(member)}
                  size="sm"
                  className="bg-white text-black hover:bg-gray-200"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    if (confirm("Delete this team member?")) {
                      deleteMutation.mutate(member.id);
                    }
                  }}
                  size="sm"
                  variant="outline"
                  className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}