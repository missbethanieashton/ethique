
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function CarouselManager() {
  const [editingCarousel, setEditingCarousel] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("tags");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const queryClient = useQueryClient();

  const { data: carousels = [] } = useQuery({
    queryKey: ["carousels"],
    queryFn: () => base44.entities.Carousel.list("order"),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: () => base44.entities.Tag.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.list(),
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Carousel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousels"] });
      setShowForm(false);
      setEditingCarousel(null);
      setSelectedTags([]);
      setSelectedCategories([]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Carousel.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousels"] });
      setShowForm(false);
      setEditingCarousel(null);
      setSelectedTags([]);
      setSelectedCategories([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Carousel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousels"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.active = formData.get("active") === "on";
    data.order = parseInt(data.order) || 0;
    data.max_items = parseInt(data.max_items) || 6;
    data.filter_tags = selectedTags;
    data.filter_categories = selectedCategories;
    
    if (editingCarousel) {
      updateMutation.mutate({ id: editingCarousel.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  React.useEffect(() => {
    if (editingCarousel) {
      setFilterType(editingCarousel.filter_type);
      setSelectedTags(editingCarousel.filter_tags || []);
      setSelectedCategories(editingCarousel.filter_categories || []);
    } else {
      // Reset form states when no carousel is being edited (e.g., for new creation)
      setFilterType("tags");
      setSelectedTags([]);
      setSelectedCategories([]);
    }
  }, [editingCarousel]);

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-white">Carousels</h2>
          <p className="text-sm text-gray-400 mt-1">Configure dynamic content carousels for different sections</p>
        </div>
        <Button
          onClick={() => {
            setEditingCarousel(null);
            setShowForm(!showForm);
          }}
          className="bg-white text-black hover:bg-gray-200"
        >
          <Plus size={16} className="mr-2" />
          Add Carousel
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/20 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Carousel Title *</Label>
              <Input
                name="title"
                placeholder="Featured Stories"
                required
                defaultValue={editingCarousel?.title}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
                  <Label className="text-white">Location *</Label>
                  <Select name="location" defaultValue={editingCarousel?.location || "home_hero"} required>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home_hero">Home - Hero Section</SelectItem>
                      <SelectItem value="home_featured">Home - Featured Section</SelectItem>
                      <SelectItem value="category_page">Category Page</SelectItem>
                      <SelectItem value="custom">Custom (Use carousel ID to embed anywhere)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 mt-1">
                    Custom location allows you to use the carousel ID to embed it in any page or component
                  </p>
                </div>
          </div>

          <div>
            <Label className="text-white">Filter Type *</Label>
            <Select 
              name="filter_type" 
              value={filterType}
              onValueChange={setFilterType}
              required
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tags">By Tags</SelectItem>
                <SelectItem value="categories">By Categories</SelectItem>
                <SelectItem value="featured">Featured Only</SelectItem>
                <SelectItem value="manual">Manual Selection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filterType === "tags" && (
            <div>
              <Label className="text-white mb-3 block">Select Tags</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-white/5 rounded">
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
          )}

          {filterType === "categories" && (
            <div>
              <Label className="text-white mb-3 block">Select Categories</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-white/5 rounded">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label htmlFor={`cat-${category.id}`} className="text-white text-sm cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Max Items</Label>
              <Input
                name="max_items"
                type="number"
                defaultValue={editingCarousel?.max_items || 6}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Display Order</Label>
              <Input
                name="order"
                type="number"
                defaultValue={editingCarousel?.order || 0}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              name="active"
              defaultChecked={editingCarousel?.active !== false}
            />
            <Label htmlFor="active" className="text-white">Active</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-white text-black hover:bg-gray-200">
              {editingCarousel ? "Update" : "Create"} Carousel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingCarousel(null);
              }}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {carousels.map((carousel) => (
          <div
            key={carousel.id}
            className="bg-white/5 border border-white/20 p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">{carousel.title}</h3>
              <p className="text-sm text-gray-400">
                {carousel.location} • {carousel.filter_type} • Max: {carousel.max_items} items • Order: {carousel.order}
              </p>
              {carousel.filter_type === "tags" && carousel.filter_tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {carousel.filter_tags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <span key={tagId} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: tag.color + "40", color: tag.color }}>
                        {tag.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              {carousel.filter_type === "categories" && carousel.filter_categories?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {carousel.filter_categories.map(catId => {
                    const category = categories.find(c => c.id === catId);
                    return category ? (
                      <span key={catId} className="text-xs px-2 py-1 bg-white/10 text-white rounded">
                        {category.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditingCarousel(carousel);
                  setShowForm(true);
                }}
                className="bg-white/10 text-white hover:bg-white/20"
                size="sm"
              >
                <Pencil size={16} />
              </Button>
              <Button
                onClick={() => {
                  if (confirm("Delete this carousel?")) {
                    deleteMutation.mutate(carousel.id);
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
