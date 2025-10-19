import React from "react";
import CategoryTemplate from "../components/category/CategoryTemplate";
import { createPageUrl } from "@/utils";

export default function Music() {
  const heroSlides = [
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920"
    }
  ];

  const productBox = {
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/46457309f_Screenshot2025-10-11at122730AM.png",
    label: "Latest Issue",
    title: "January 2025",
    subtitle: "Get Digital Edition",
    price: "€4.99",
    cta: "Buy Now",
    link: createPageUrl("Checkout")
  };

  return (
    <CategoryTemplate 
      category="Music" 
      heroSlides={heroSlides}
      productBox={productBox}
    />
  );
}