import React from "react";
import CategoryTemplate from "../components/category/CategoryTemplate";
import { createPageUrl } from "@/utils";

export default function Beauty() {
  const heroSlides = [
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1920"
    },
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920"
    }
  ];

  const productBox = {
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/46457309f_Screenshot2025-10-11at122730AM.png",
    label: "Featured",
    title: "January 2025",
    subtitle: "Get Digital Edition",
    price: "€4.99",
    cta: "Buy Now",
    link: createPageUrl("Checkout")
  };

  return (
    <CategoryTemplate 
      category="Beauty" 
      heroSlides={heroSlides}
      productBox={productBox}
    />
  );
}