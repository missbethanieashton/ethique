import React from "react";

export default function AnnouncementBar() {
  const text = "WHERE CULTURE AND TECHNOLOGY COLLIDE";
  const text2 = "THE WORLD'S FIRST SHOPPABLE VIDEO MAGAZINE";
  
  return (
    <div className="w-full overflow-hidden bg-black/40 backdrop-blur-sm py-2 md:py-3 mt-5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lacquer&display=swap');
        
        .marquee {
          display: flex;
          overflow: hidden;
          user-select: none;
        }
        
        .marquee-content {
          display: flex;
          animation: scroll 60s linear infinite;
          will-change: transform;
        }
        
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        
        .marquee-item {
          font-family: 'Lacquer', system-ui;
          font-weight: 400;
          letter-spacing: 1px;
          white-space: nowrap;
          padding: 0 1rem;
          color: white;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        @media (min-width: 768px) {
          .marquee-item {
            font-size: 1.125rem;
            padding: 0 2rem;
            gap: 1.5rem;
          }
        }
        
        .chrome-separator {
          width: 12px;
          height: 12px;
          object-fit: contain;
          flex-shrink: 0;
        }
        
        @media (min-width: 768px) {
          .chrome-separator {
            width: 16px;
            height: 16px;
          }
        }
        
        .marquee:hover .marquee-content {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="marquee">
        <div className="marquee-content">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="marquee-item">
              {text}
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/7b4dc08a3_MATERIALIZEDbulletpoints.png"
                alt=""
                className="chrome-separator"
              />
              {text2}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}