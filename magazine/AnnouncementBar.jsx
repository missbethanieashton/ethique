import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function AnnouncementBar({ pageName, articleId }) {
  const { data: announcementAd } = useQuery({
    queryKey: ["announcement-bar", pageName, articleId],
    queryFn: async () => {
      const ads = await base44.entities.Advertisement.list("order");
      return ads.find(ad => 
        ad.type === "announcement_bar" && 
        ad.active && 
        (
          ad.targeting === "all" ||
          (ad.targeting === "page" && ad.target_pages && ad.target_pages.includes(pageName)) ||
          (ad.targeting === "specific_article" && ad.target_article_id === articleId)
        )
      );
    },
  });

  if (!announcementAd || !announcementAd.announcement_text) return null;

  const handleClick = () => {
    if (announcementAd.announcement_link) {
      window.open(announcementAd.announcement_link, '_blank');
    }
  };

  return (
    <div 
      className={`w-full overflow-hidden py-3 ${announcementAd.announcement_link ? 'cursor-pointer' : ''}`}
      style={{ backgroundColor: announcementAd.announcement_background_color || '#000000' }}
      onClick={handleClick}
    >
      <style>{`
        .announcement-marquee {
          display: flex;
          overflow: hidden;
          user-select: none;
        }
        
        .announcement-content {
          display: flex;
          animation: announcement-scroll 25s linear infinite;
          will-change: transform;
        }
        
        @keyframes announcement-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        
        .announcement-item {
          white-space: nowrap;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        
        .announcement-marquee:hover .announcement-content {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="announcement-marquee">
        <div className="announcement-content">
          {[...Array(10)].map((_, i) => (
            <span 
              key={i} 
              className="announcement-item"
              style={{
                fontFamily: announcementAd.announcement_font_family || 'Glacial Indifference',
                fontSize: `${announcementAd.announcement_font_size || 16}px`,
                color: announcementAd.announcement_text_color || '#FFFFFF',
                letterSpacing: '0.5px'
              }}
            >
              {announcementAd.announcement_text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}