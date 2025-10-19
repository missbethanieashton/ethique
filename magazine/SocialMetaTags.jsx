import React, { useEffect } from "react";

export default function SocialMetaTags({ 
  title = "Éthique Magazine - Where Culture and Technology Collide",
  description = "ETHIQUE - Where culture and tech collide.. the world's first shoppable video magazine.",
  image = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/c4d004b5c_EthiqueBrandKit.png",
  url = typeof window !== 'undefined' ? window.location.href : ''
}) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to set or update meta tags
    const setMetaTag = (property, content, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Open Graph tags
    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:image', image);
    setMetaTag('og:url', url);
    setMetaTag('og:type', 'article');
    setMetaTag('og:site_name', 'Éthique Magazine');

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', title, true);
    setMetaTag('twitter:description', description, true);
    setMetaTag('twitter:image', image, true);
    setMetaTag('twitter:site', '@ethiquemag', true);

    // Standard meta tags for SEO
    setMetaTag('description', description, true);
    setMetaTag('keywords', 'fashion magazine, art culture, luxury lifestyle, shoppable video, digital magazine, fashion week, cuisine, travel, music, luxury brands', true);
    setMetaTag('author', 'Éthique Magazine', true);
    
    // Additional SEO meta tags
    setMetaTag('robots', 'index, follow', true);
    setMetaTag('language', 'English', true);

    // Cleanup function
    return () => {
      // Optionally remove tags on unmount if needed
    };
  }, [title, description, image, url]);

  return null;
}