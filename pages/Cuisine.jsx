import React from "react";
import CategoryTemplate from "../components/category/CategoryTemplate";
import { createPageUrl } from "@/utils";

export default function Cuisine() {
  const heroSlides = [
    {
      type: "image",
      url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/d7c4c05c1_TaraKhattarlebanesechef.jpg"
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
      category="Cuisine" 
      heroSlides={heroSlides}
      productBox={productBox}
    />
  );
}