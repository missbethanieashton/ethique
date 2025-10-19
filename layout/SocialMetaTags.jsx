import React, { useEffect } from "react";

export default function SocialMetaTags({ title, description, image }) {
  const defaultTitle = "ÉTHIQUE - Where Culture and Technology Collide. The World's First Shoppable Video Magazine";
  const defaultDescription = "Discover curated luxury fashion, art, cuisine, travel, and music. Experience the future of digital magazines.";
  const defaultImage = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/2ec706ef8_EthiquelogotransparentW.png";

  const seoTitle = title || defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;

  useEffect(() => {
    // Update title
    document.title = seoTitle;

    // Update or create meta tags
    const updateMetaTag = (property, content, isProperty = true) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, property);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Basic Meta Tags
    updateMetaTag('description', seoDescription, false);
    
    // Open Graph / Facebook
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:title', seoTitle);
    updateMetaTag('og:description', seoDescription);
    updateMetaTag('og:image', seoImage);
    updateMetaTag('og:url', window.location.href);
    
    // Twitter
    updateMetaTag('twitter:card', 'summary_large_image', false);
    updateMetaTag('twitter:title', 'summary_large_image', false);
    updateMetaTag('twitter:description', seoDescription, false);
    updateMetaTag('twitter:image', seoImage, false);
    
    // Additional SEO
    updateMetaTag('keywords', 'luxury fashion, art magazine, shoppable video, digital magazine, culture, technology, haute couture, travel, cuisine, music', false);
    updateMetaTag('author', 'Éthique Magazine', false);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);

    // Add structured data
    let structuredData = document.querySelector('script[type="application/ld+json"]');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ÉTHIQUE Magazine",
      "description": "Where Culture and Technology Collide. The World's First Shoppable Video Magazine",
      "url": window.location.origin,
      "logo": defaultImage,
      "sameAs": [
        "https://www.instagram.com/join.materialized",
        "https://www.linkedin.com/showcase/ethique",
        "https://www.tiktok.com/@join.materialized"
      ],
      "potentialAction": {
        "@type": "SearchAction",
        "target": window.location.origin + "/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    });
  }, [seoTitle, seoDescription, seoImage]);

  return null;
}