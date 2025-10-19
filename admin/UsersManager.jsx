import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Key } from "lucide-react";

export default function UsersManager() {
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(u => u.admin_role && u.admin_role !== "none");
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (data) => base44.entities.User.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowForm(false);
      setEditingUser(null);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowForm(false);
      setEditingUser(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => base44.entities.User.update(id, { admin_role: "none", admin_permissions: [] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const password = formData.get("password");
    if (password && !validatePassword(password)) {
      alert("Password must be at least 8 characters, include 1 uppercase letter and 1 symbol");
      return;
    }

    const permissions = [];
    if (formData.get("perm_articles")) permissions.push("articles");
    if (formData.get("perm_featured")) permissions.push("featured");
    if (formData.get("perm_authors")) permissions.push("authors");
    if (formData.get("perm_taxonomies")) permissions.push("taxonomies");
    if (formData.get("perm_carousels")) permissions.push("carousels");
    if (formData.get("perm_ads")) permissions.push("ads");
    if (formData.get("perm_menu_ads")) permissions.push("menu_ads");
    if (formData.get("perm_performance")) permissions.push("performance");
    if (formData.get("perm_crm")) permissions.push("crm");
    if (formData.get("perm_users")) permissions.push("users");

    const data = {
      email: formData.get("email"),
      full_name: formData.get("full_name"),
      admin_role: formData.get("admin_role"),
      admin_permissions: permissions,
      last_reset_date: new Date().toISOString().split('T')[0]
    };

    if (password) {
      data.password_hash = password; // In production, hash this
    }

    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    return true;
  };

  const resetPassword = (user) => {
    const newPassword = prompt("Enter new password (min 8 chars, 1 uppercase, 1 symbol):");
    if (!newPassword) return;
    
    if (!validatePassword(newPassword)) {
      alert("Password must be at least 8 characters, include 1 uppercase letter and 1 symbol");
      return;
    }

    updateUserMutation.mutate({ 
      id: user.id, 
      data: { password_hash: newPassword } 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-white">User Management</h2>
          <p className="text-sm text-gray-400 mt-1">Manage admin users and permissions</p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null);
            setShowForm(!showForm);
          }}
          className="bg-white text-black hover:bg-gray-200"
        >
          <Plus size={16} className="mr-2" />
          Add Admin User
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/20 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Full Name *</Label>
              <Input
                name="full_name"
                required
                defaultValue={editingUser?.full_name}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Email *</Label>
              <Input
                name="email"
                type="email"
                required
                defaultValue={editingUser?.email}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Role *</Label>
              <Select name="admin_role" defaultValue={editingUser?.admin_role || "author"} required>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="editor_in_chief">Editor in Chief</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="master_admin">Master Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Password {!editingUser && "*"}</Label>
              <Input
                name="password"
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                required={!editingUser}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white mb-3 block">Permissions</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: "articles", label: "Articles" },
                { value: "featured", label: "Featured" },
                { value: "authors", label: "Authors" },
                { value: "taxonomies", label: "Taxonomies" },
                { value: "carousels", label: "Carousels" },
                { value: "ads", label: "Ads" },
                { value: "menu_ads", label: "Menu Ads" },
                { value: "performance", label: "Performance" },
                { value: "crm", label: "CRM" },
                { value: "users", label: "Users" }
              ].map(perm => (
                <div key={perm.value} className="flex items-center space-x-2">
                  <Checkbox
                    name={`perm_${perm.value}`}
                    defaultChecked={editingUser?.admin_permissions?.includes(perm.value)}
                    className="border-white/20"
                  />
                  <Label className="text-white text-sm">{perm.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-white text-black hover:bg-gray-200">
              {editingUser ? "Update" : "Create"} User
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingUser(null);
              }}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white/5 border border-white/20 p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">{user.full_name}</h3>
              <p className="text-sm text-gray-400">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-white/10 rounded">{user.admin_role}</span>
                {user.admin_permissions?.map(perm => (
                  <span key={perm} className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => resetPassword(user)}
                className="bg-white/10 text-white hover:bg-white/20"
              >
                <Key size={14} />
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingUser(user);
                  setShowForm(true);
                }}
                className="bg-white/10 text-white hover:bg-white/20"
              >
                <Edit size={14} />
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (confirm("Remove admin access for this user?")) {
                    deleteUserMutation.mutate(user.id);
                  }
                }}
                className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}