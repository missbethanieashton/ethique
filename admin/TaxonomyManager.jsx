import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import TagManager from "./TagManager";
import CategoryManager from "./CategoryManager";

export default function TaxonomyManager() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-light text-white">Taxonomies</h2>
      </div>

      <Tabs defaultValue="tags" className="w-full">
        <TabsList className="grid grid-cols-2 bg-white/5 p-1 mb-6">
          <TabsTrigger value="tags" className="data-[state=active]:bg-white data-[state=active]:text-black">
            Tags
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:text-black">
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tags">
          <TagManager />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}