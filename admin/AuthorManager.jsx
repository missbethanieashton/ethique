
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Upload } from "lucide-react";

export default function AuthorManager() {
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState({});
  const queryClient = useQueryClient();

  const { data: authors = [], isLoading } = useQuery({
    queryKey: ["admin-authors"],
    queryFn: () => base44.entities.Author.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Author.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-authors"] });
      setShowForm(false);
      setEditingAuthor(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Author.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-authors"] });
      setShowForm(false);
      setEditingAuthor(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Author.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-authors"] });
    },
  });

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const input = document.querySelector(`input[name="${fieldName}"]`);
      if (input) {
        input.value = file_url;
      }
      
      alert("File uploaded successfully!");
    } catch (error) {
      alert("Failed to upload file");
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      full_name: formData.get("full_name"),
      profile_photo: formData.get("profile_photo") || undefined,
      profile_video: formData.get("profile_video") || undefined,
      city: formData.get("city") || undefined,
      bio: formData.get("bio") || undefined,
      portfolio_link: formData.get("portfolio_link") || undefined,
      linkedin_link: formData.get("linkedin_link") || undefined,
      instagram_link: formData.get("instagram_link") || undefined,
      active: formData.get("active") === "on",
    };

    if (editingAuthor) {
      updateMutation.mutate({ id: editingAuthor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">Authors</h2>
        <Button
          onClick={() => {
            setEditingAuthor(null);
            setShowForm(!showForm);
          }}
          className="bg-white text-black hover:bg-gray-200"
        >
          <Plus size={16} className="mr-2" />
          Add Author
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/20 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Full Name *</Label>
              <Input
                name="full_name"
                placeholder="Author name"
                required
                defaultValue={editingAuthor?.full_name}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label className="text-white">City</Label>
              <Input
                name="city"
                placeholder="Paris, France"
                defaultValue={editingAuthor?.city}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Profile Photo URL or Upload</Label>
            <div className="space-y-2">
              <Input
                name="profile_photo"
                placeholder="https://example.com/photo.jpg"
                defaultValue={editingAuthor?.profile_photo}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "profile_photo")}
                  className="hidden"
                  id="author-photo-upload"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById("author-photo-upload").click()}
                  disabled={uploading.profile_photo}
                  className="bg-white/10 hover:bg-white/20 border border-white/20"
                >
                  <Upload size={16} className="mr-2" />
                  {uploading.profile_photo ? "Uploading..." : "Upload Photo"}
                </Button>
                <span className="text-xs text-gray-500">Or paste URL above</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-white">Profile Video URL or Upload (optional)</Label>
            <div className="space-y-2">
              <Input
                name="profile_video"
                placeholder="https://example.com/video.mp4"
                defaultValue={editingAuthor?.profile_video}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, "profile_video")}
                  className="hidden"
                  id="author-video-upload"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById("author-video-upload").click()}
                  disabled={uploading.profile_video}
                  className="bg-white/10 hover:bg-white/20 border border-white/20"
                >
                  <Upload size={16} className="mr-2" />
                  {uploading.profile_video ? "Uploading..." : "Upload Video"}
                </Button>
                <span className="text-xs text-gray-500">Or paste URL above</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-white">Bio</Label>
            <Textarea
              name="bio"
              placeholder="Short bio about the author"
              rows={3}
              defaultValue={editingAuthor?.bio}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Portfolio Link</Label>
              <Input
                name="portfolio_link"
                placeholder="https://portfolio.com"
                defaultValue={editingAuthor?.portfolio_link}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label className="text-white">LinkedIn</Label>
              <Input
                name="linkedin_link"
                placeholder="https://linkedin.com/in/..."
                defaultValue={editingAuthor?.linkedin_link}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label className="text-white">Instagram</Label>
              <Input
                name="instagram_link"
                placeholder="https://instagram.com/..."
                defaultValue={editingAuthor?.instagram_link}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch name="active" defaultChecked={editingAuthor?.active !== false} />
            <Label className="text-white">Active</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-white text-black hover:bg-gray-200">
              {editingAuthor ? "Update" : "Create"} Author
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingAuthor(null);
              }}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {authors.map((author) => (
            <div key={author.id} className="bg-white/5 border border-white/20 p-4 space-y-3">
              {author.profile_photo && (
                <img src={author.profile_photo} alt={author.full_name} className="w-full aspect-square object-cover rounded" />
              )}
              <div>
                <h3 className="text-white font-medium">{author.full_name}</h3>
                {author.city && <p className="text-xs text-gray-400 mt-1">{author.city}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingAuthor(author);
                    setShowForm(true);
                  }}
                  className="bg-white/10 hover:bg-white/20"
                >
                  <Edit size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Delete this author?")) {
                      deleteMutation.mutate(author.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
