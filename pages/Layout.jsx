

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import MenuCarousel from "./components/layout/MenuCarousel";
import PolicyPopup from "./components/layout/PolicyPopup";
import SearchModal from "./components/layout/SearchModal";
import { PrivacyPolicyContent, TermsContent, CookiePolicyContent } from "./components/layout/PolicyContent";
import SocialMetaTags from "./components/layout/SocialMetaTags";
import AdvertisingPopup from "./components/layout/AdvertisingPopup";
import AffiliatePopup from "./components/layout/AffiliatePopup";
import EditorialTeamPopup from "./components/layout/EditorialTeamPopup";

const categories = ["Fashion", "Art", "Cuisine", "Travel", "Music", "Beauty"];

export default function Layout({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [menuAds, setMenuAds] = useState([]);
  const [activePolicy, setActivePolicy] = useState(null);
  const [showAdvertising, setShowAdvertising] = useState(false);
  const [showAffiliate, setShowAffiliate] = useState(false);
  const [showEditorialTeam, setShowEditorialTeam] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [soundcloudWidget, setSoundcloudWidget] = useState(null);
  const location = useLocation();

  // Scroll to top on location change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchMenuAds = async () => {
      try {
        const ads = await base44.entities.MenuAdvertisement.list("order");
        setMenuAds(ads.filter((ad) => ad.active));
      } catch (error) {
        console.error("Failed to fetch menu ads:", error);
      }
    };
    fetchMenuAds();
  }, []);

  // Effect to load SoundCloud Widget API and initialize the widget
  useEffect(() => {
    const initializeWidget = () => {
      if (window.SC && window.SC.Widget) {
        const iframe = document.getElementById('soundcloud-player');
        if (iframe) {
          const widget = new window.SC.Widget(iframe);
          setSoundcloudWidget(widget);

          widget.bind(window.SC.Widget.Events.READY, () => {
            console.log('SoundCloud widget ready');
            // Ensure the player is muted and paused initially to respect autoplay policies
            widget.setVolume(0);
            widget.pause();
          });

          // Bind events to keep audioPlaying state in sync with widget's actual state
          widget.bind(window.SC.Widget.Events.PLAY, () => setAudioPlaying(true));
          widget.bind(window.SC.Widget.Events.PAUSE, () => setAudioPlaying(false));
          widget.bind(window.SC.Widget.Events.FINISH, () => setAudioPlaying(false));
        }
      }
    };

    // Dynamically load the SoundCloud Widget API script if not already present
    const scriptId = 'soundcloud-api-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.id = scriptId;
      script.async = true;
      script.onload = initializeWidget; // Initialize once script is loaded
      document.body.appendChild(script);
    } else {
      initializeWidget(); // If script already exists (e.g., hot reload), initialize directly
    }

    // Cleanup function: remove event listeners when component unmounts
    return () => {
      if (soundcloudWidget) {
        soundcloudWidget.unbind(window.SC.Widget.Events.PLAY);
        soundcloudWidget.unbind(window.SC.Widget.Events.PAUSE);
        soundcloudWidget.unbind(window.SC.Widget.Events.FINISH);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Effect to control widget playback based on audioPlaying state
  useEffect(() => {
    if (soundcloudWidget) {
      if (audioPlaying) {
        soundcloudWidget.play();
        soundcloudWidget.setVolume(100); // Unmute when playing
      } else {
        soundcloudWidget.pause();
        soundcloudWidget.setVolume(0); // Mute when paused/stopped
      }
    }
  }, [audioPlaying, soundcloudWidget]); // Re-run when audioPlaying or widget changes

  const isCategoryPage = categories.includes(currentPageName);
  const announcementBarHeight = 40;

  const toggleAudio = () => {
    // This will trigger the second useEffect to control the widget
    setAudioPlaying((prev) => !prev);
  };

  const handleNavClick = () => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <SocialMetaTags />
      
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
        @import url('https://fonts.cdnfonts.com/css/waterlily');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lacquer&display=swap');

        * {
          cursor: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/b5e661108_MATERIALIZEDbulletpoints.png') 16 16, auto;
        }

        a, button, [role="button"] {
          cursor: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/b5e661108_MATERIALIZEDbulletpoints.png') 16 16, pointer;
        }

        body {
          font-family: 'Glacial Indifference', sans-serif;
          background: #0d0d0d;
        }

        h1 {
          font-family: 'WATERLILY', serif;
        }

        h2 {
          font-family: 'Glacial Indifference', sans-serif;
          font-weight: 700;
        }

        p, span, a, li {
          font-family: 'Glacial Indifference', sans-serif;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .afrah-text {
          font-family: 'Playfair Display', serif;
          font-weight: 400;
          letter-spacing: 0.05em;
        }

        .lacquer-text {
          font-family: 'Lacquer', system-ui;
          font-weight: 400;
          letter-spacing: 0.05em;
        }

        .chrome-ball {
          transition: transform 0.3s ease;
        }

        .chrome-ball:hover {
          transform: scale(1.1) rotate(10deg);
        }

        .menu-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
        }

        .menu-circular-text {
          position: absolute;
          width: 100%;
          height: 100%;
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .menu-circular-text text {
          font-family: 'Lacquer', system-ui;
          font-size: 11px;
          letter-spacing: 5px;
          text-transform: uppercase;
          fill: white;
        }

        .lips-icon {
          mix-blend-mode: screen;
          filter: brightness(1.2) contrast(1.1);
          transition: all 0.4s ease;
        }

        .lips-icon:hover {
          transform: scale(1.15) rotate(5deg);
          filter: brightness(1.4) contrast(1.2) drop-shadow(0 0 20px rgba(255, 0, 80, 0.6));
          animation: kissAnimation 0.6s ease-in-out;
        }

        @keyframes kissAnimation {
          0%, 100% {
            transform: scale(1.15) rotate(5deg);
          }
          25% {
            transform: scale(1.25) rotate(-3deg);
          }
          50% {
            transform: scale(1.2) rotate(5deg);
          }
          75% {
            transform: scale(1.25) rotate(-3deg);
          }
        }

        @keyframes audioBar1 {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }

        @keyframes audioBar2 {
          0%, 100% { height: 16px; }
          50% { height: 32px; }
        }

        @keyframes audioBar3 {
          0%, 100% { height: 12px; }
          50% { height: 28px; }
        }

        @keyframes audioBar4 {
          0%, 100% { height: 20px; }
          50% { height: 36px; }
        }

        @keyframes audioBar5 {
          0%, 100% { height: 10px; }
          50% { height: 22px; }
        }

        .audio-bar {
          width: 3px;
          background: white;
          border-radius: 2px;
          transition: all 0.3s ease;
          opacity: 0.8;
        }

        .audio-bar.active:nth-child(1) {
          animation: audioBar1 0.8s ease-in-out infinite;
        }

        .audio-bar.active:nth-child(2) {
          animation: audioBar2 1s ease-in-out infinite;
        }

        .audio-bar.active:nth-child(3) {
          animation: audioBar3 0.9s ease-in-out infinite;
        }

        .audio-bar.active:nth-child(4) {
          animation: audioBar4 1.1s ease-in-out infinite;
        }

        .audio-bar.active:nth-child(5) {
          animation: audioBar5 0.85s ease-in-out infinite;
        }

        .audio-bar.muted {
          height: 4px !important;
          opacity: 0.3;
          animation: none !important;
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/2ec706ef8_EthiquelogotransparentW.png"
                alt="Éthique"
                className="h-8 md:h-12 w-auto" />

            </Link>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:block p-2 hover:bg-white/5 rounded transition-colors">

                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>

              <div className="hidden md:flex items-center gap-1 h-10 px-2">
                <div className={`audio-bar ${audioPlaying ? 'active' : 'muted'}`}></div>
                <div className={`audio-bar ${audioPlaying ? 'active' : 'muted'}`}></div>
                <div className={`audio-bar ${audioPlaying ? 'active' : 'muted'}`}></div>
                <div className={`audio-bar ${audioPlaying ? 'active' : 'muted'}`}></div>
                <div className={`audio-bar ${audioPlaying ? 'active' : 'muted'}`}></div>
              </div>

              <Link
                to={createPageUrl("Wishlist")}
                className="p-1 md:p-2 rounded transition-colors">

                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/e5997ff9a_EthiqueBrandKit.png"
                  alt="Saved Articles"
                  className="w-10 h-10 md:w-16 md:h-16 object-contain lips-icon" />

              </Link>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="menu-wrapper hover:opacity-80 transition-opacity scale-75 md:scale-100">

                <svg className="menu-circular-text" viewBox="0 0 100 100">
                  <defs>
                    <path
                      id="circlePath"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />

                  </defs>
                  <text>
                    <textPath href="#circlePath" startOffset="0%">
                      MENU • MENU • MENU • 
                    </textPath>
                  </text>
                </svg>

                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/56fd32504_MATERIALIZEDbulletpoints.png"
                  alt="Menu"
                  className="chrome-ball w-10 h-10 object-contain relative z-10" />

              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Persistent SoundCloud Player - Always mounted, hidden off-screen */}
      <div className="fixed" style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '1px', height: '1px', overflow: 'hidden', pointerEvents: 'none' }}>
        <iframe
          id="soundcloud-player"
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2094507619&color=%23000000&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false">
        </iframe>
      </div>

      {/* Full-Width Overlay Menu */}
      <AnimatePresence>
        {menuOpen &&
        <>
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-40"
            style={{ top: '60vh' }} />


            <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed top-14 md:top-20 left-0 right-0 z-40 bg-[#0d0d0d] border-b border-white/10"
            style={{
              height: '60vh',
              maxHeight: '60vh',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}>

              <div className="max-w-[1800px] mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-8 md:pb-2">

                <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                  
                  {/* Explore Section - 1/6 width on desktop */}
                  <div className="mb-6 md:mb-0 md:col-span-1">
                    <h3
                    className="lacquer-text text-sm md:text-base text-white mb-3 md:mb-4 border-b border-white/30 pb-2 inline-block uppercase">

                      Explore
                    </h3>
                    <div className="space-y-2">
                      {[
                    { name: "Fashion", page: "Fashion" },
                    { name: "Art", page: "Art" },
                    { name: "Cuisine", page: "Cuisine" },
                    { name: "Travel", page: "Travel" },
                    { name: "Music", page: "Music" },
                    { name: "Beauty", page: "Beauty" }].
                    map((category) =>
                    <Link
                      key={category.name}
                      to={createPageUrl(category.page)}
                      onClick={handleNavClick}
                      className="block text-sm font-light hover:text-gray-400 transition-colors">

                          {category.name}
                        </Link>
                    )}
                    </div>
                  </div>

                  {/* Series Section - 1/6 width on desktop */}
                  <div className="mb-6 md:mb-0 md:col-span-1">
                    <h3
                    className="lacquer-text text-sm md:text-base text-white mb-3 md:mb-4 border-b border-white/30 pb-2 inline-block uppercase">

                      Series
                    </h3>
                    <div className="space-y-2">
                      {['Inside the Atelier', 'Pearls Of Paris', 'Backstage Tango'].map((series) =>
                    <div
                      key={series}
                      className="block text-sm font-light text-gray-600 cursor-not-allowed">

                          {series}
                        </div>
                    )}
                    </div>
                  </div>

                  {/* Menu Carousel Section - 1/3 width (2/6) - Hidden on mobile */}
                  <div className="hidden md:block md:col-span-2 mb-6 md:mb-0">
                    <MenuCarousel ads={menuAds} />
                  </div>

                  {/* Listen Section - 1/3 width (2/6) - Desktop - Visual reference only */}
                  <div className="hidden md:block md:col-span-2 mb-6 md:mb-0">
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                      <h3
                      className="lacquer-text text-sm md:text-base text-white border-b border-white/30 pb-2 inline-block uppercase">

                        Listen
                      </h3>
                      <button
                      onClick={toggleAudio}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title={audioPlaying ? "Mute" : "Unmute"}>

                        {audioPlaying ?
                      <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L7 7H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h3l5 5V2zm5.5 10c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM16 12c0 .74-.17 1.43-.46 2.05l1.46 1.46C17.64 14.46 18 13.28 18 12c0-1.28-.36-2.46-1-3.51l-1.46 1.46c.29.62.46 1.31.46 2.05z" />
                          </svg> :

                      <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L7 7H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h3l5 5V2zm4.54 9l3.53-3.53L18.94 6.34 15.41 9.87l-3.53-3.53-1.13 1.13 3.53 3.53-3.53 3.53 1.13 1.13 3.53-3.53 3.53 3.53 1.13-1.13z" />
                          </svg>
                      }
                      </button>
                    </div>
                    
                    <div className="mb-4 bg-white/5 rounded p-4 text-center">
                      <p className="text-sm text-gray-400 mb-2">🎵 Audio Player</p>
                      <p className="text-xs text-gray-500">Playing in background</p>
                      <a
                      href="https://soundcloud.com/bethanie-ashton/sets/ethique-mag"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-white transition-colors mt-2 inline-block">

                        View on SoundCloud →
                      </a>
                    </div>
                  </div>

                  {/* Listen Section - Mobile only */}
                  <div className="md:hidden mb-6">
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                      <h3
                      className="lacquer-text text-sm md:text-base text-white border-b border-white/30 pb-2 inline-block uppercase">

                        Listen
                      </h3>
                      <button
                      onClick={toggleAudio}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title={audioPlaying ? "Mute" : "Unmute"}>

                        {audioPlaying ?
                      <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L7 7H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h3l5 5V2zm5.5 10c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM16 12c0 .74-.17 1.43-.46 2.05l1.46 1.46C17.64 14.46 18 13.28 18 12c0-1.28-.36-2.46-1-3.51l-1.46 1.46c.29.62.46 1.31.46 2.05z" />
                          </svg> :

                      <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L7 7H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h3l5 5V2zm4.54 9l3.53-3.53L18.94 6.34 15.41 9.87l-3.53-3.53-1.13 1.13 3.53 3.53-3.53 3.53 1.13 1.13 3.53-3.53 3.53 3.53 1.13-1.13z" />
                          </svg>
                      }
                      </button>
                    </div>
                    
                    <div className="mb-4 bg-white/5 rounded p-4 text-center">
                      <p className="text-sm text-gray-400 mb-2">🎵 Audio Player</p>
                      <p className="text-xs text-gray-500">Playing in background</p>
                      <a
                      href="https://soundcloud.com/bethanie-ashton/sets/ethique-mag"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-white transition-colors mt-2 inline-block">

                        View on SoundCloud →
                      </a>
                    </div>
                  </div>

                </div>

                {/* Social Media Icons - Desktop - Below content */}
                <div className="hidden md:flex items-center justify-end gap-4 md:gap-6 mt-4">
                  <a
                    href="https://substack.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 8V2L2 2V8" />
                      <path d="M22 8L12 14L2 8" />
                      <path d="M2 8V22L12 16L22 22V8" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/join.materialized"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/showcase/ethique"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@join.materialized"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                </div>

                {/* Social Media Icons - Mobile Only */}
                <div className="md:hidden flex items-center justify-center gap-6 mt-6">
                  <a
                    href="https://substack.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 8V2L2 2V8" />
                      <path d="M22 8L12 14L2 8" />
                      <path d="M2 8V22L12 16L22 22V8" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/join.materialized"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/showcase/ethique"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@join.materialized"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                </div>

              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <AnimatePresence>
        {isCategoryPage &&
        <motion.div
          initial={{ opacity: 0, y: -announcementBarHeight }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -announcementBarHeight }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-0 right-0 z-30 bg-white/5 backdrop-blur-sm text-center py-3">

            <p className="text-white/90 my-12 text-base uppercase tracking-wider lacquer-text md:text-lg">
              Discover curated content from the world of {currentPageName}
            </p>
          </motion.div>
        }
      </AnimatePresence>

      <main className={`pt-14 md:pt-20 ${isCategoryPage ? `md:pt-[calc(5rem+${announcementBarHeight}px)] pt-[calc(3.5rem+${announcementBarHeight}px)]` : ''}`}>
        {children}
      </main>

      <footer className="border-t border-white/10 bg-[#0a0a0a] mt-20">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="flex justify-center mb-16 w-full">
            <Link to={createPageUrl("Home")} onClick={() => window.scrollTo(0, 0)} className="relative w-full max-w-4xl">
              <style>{`
                @keyframes sparkle {
                  0%, 100% {
                    opacity: 0;
                    transform: scale(0);
                  }
                  50% {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
                
                .sparkle-container {
                  position: relative;
                  display: inline-block;
                }
                
                .sparkle-container::before,
                .sparkle-container::after {
                  content: '';
                  position: absolute;
                  width: 4px;
                  height: 4px;
                  background: white;
                  border-radius: 50%;
                  animation: sparkle 1.5s ease-in-out infinite;
                  pointer-events: none;
                  box-shadow: 0 0 6px white;
                }
                
                .sparkle-container::before {
                  top: 20%;
                  left: 15%;
                  animation-delay: 0s;
                }
                
                .sparkle-container::after {
                  top: 60%;
                  right: 25%;
                  animation-delay: 0.5s;
                }
                
                .sparkle {
                  position: absolute;
                  width: 3px;
                  height: 3px;
                  background: white;
                  border-radius: 50%;
                  animation: sparkle 1.5s ease-in-out infinite;
                  pointer-events: none;
                  box-shadow: 0 0 6px white;
                }
                
                .sparkle:nth-child(1) {
                  top: 10%;
                  left: 30%;
                  animation-delay: 0.2s;
                }
                
                .sparkle:nth-child(2) {
                  top: 40%;
                  left: 50%;
                  animation-delay: 0.7s;
                }
                
                .sparkle:nth-child(3) {
                  top: 70%;
                  left: 20%;
                  animation-delay: 1s;
                  width: 5px;
                  height: 5px;
                }
                
                .sparkle:nth-child(4) {
                  top: 30%;
                  right: 15%;
                  animation-delay: 0.3s;
                }
                
                .sparkle:nth-child(5) {
                  top: 80%;
                  right: 40%;
                  animation-delay: 0.9s;
                  width: 4px;
                  height: 4px;
                }
                
                .sparkle:nth-child(6) {
                  top: 15%;
                  right: 35%;
                  animation-delay: 1.2s;
                }
                
                .sparkle:nth-child(7) {
                  top: 50%;
                  left: 10%;
                  animation-delay: 0.4s;
                }
                
                .sparkle:nth-child(8) {
                  top: 65%;
                  right: 10%;
                  animation-delay: 0.8s;
                  width: 5px;
                  height: 5px;
                }
              `}</style>
              
              <div className="sparkle-container relative">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/2ec706ef8_EthiquelogotransparentW.png"
                  alt="Éthique"
                  className="w-full h-auto opacity-80"
                />
                <span className="sparkle"></span>
                <span className="sparkle"></span>
                <span className="sparkle"></span>
                <span className="sparkle"></span>
                <span className="sparkle"></span>
                <span className="sparkle"></span>
                <span className="sparkle"></span>
                <span className="sparkle"></span>
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mb-16">
            <a href="https://substack.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 8V2L2 2V8" />
                <path d="M22 8L12 14L2 8" />
                <path d="M2 8V22L12 16L22 22V8" />
              </svg>
            </a>
            <a href="https://www.instagram.com/join.materialized" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://www.linkedin.com/showcase/ethique" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@join.materialized" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
          </div>

          <div className="flex items-start justify-center gap-16 md:gap-32 mb-16">
            <div>
              <h4 className="text-gray-400 text-sm mb-6">Publishing</h4>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowEditorialTeam(true)}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                  style={{ fontSize: '14px', fontFamily: 'Glacial Indifference, sans-serif', fontWeight: '400' }}
                >
                  Editorial Team
                </button>
                <Link 
                  to={createPageUrl("Submissions")} 
                  onClick={() => window.scrollTo(0, 0)} 
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontSize: '14px', fontFamily: 'Glacial Indifference, sans-serif', fontWeight: '400' }}
                >
                  Submissions
                </Link>
                <button
                  onClick={() => setShowAdvertising(true)}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                  style={{ fontSize: '14px', fontFamily: 'Glacial Indifference, sans-serif', fontWeight: '400' }}
                >
                  Advertise
                </button>
                <a
                  href="http://getmaterialized.replit.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontSize: '14px', fontFamily: 'Glacial Indifference, sans-serif', fontWeight: '400' }}
                >
                  Technology
                </a>
                <button
                  onClick={() => setShowAffiliate(true)}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                  style={{ fontSize: '14px', fontFamily: 'Glacial Indifference, sans-serif', fontWeight: '400' }}
                >
                  Affiliates
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-gray-400 text-sm mb-6">Legal</h4>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setActivePolicy("privacy");
                    window.scrollTo(0, 0);
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                  style={{ fontSize: '14px', fontFamily: 'Glacial Indifference, sans-serif', fontWeight: '400' }}
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => {
                    setActivePolicy("terms");
                    window.scrollTo(0, 0);
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                  style={{ fontSize: '14px', fontFamily: 'Glacial Indifference, sans-serif', fontWeight: '400' }}
                >
                  Terms & Conditions
                </button>
                <button
                  onClick={() => {
                    setActivePolicy("cookies");
                    window.scrollTo(0, 0);
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                  style={{ fontSize: '14px', fontFamily: 'Glacial Indifference, sans-serif', fontWeight: '400' }}
                >
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span>© 2025 Éthique Magazine</span>
                <span className="hidden md:inline">•</span>
                <span>Editor-in-Chief: Bethanie Ashton</span>
                <span className="hidden md:inline">•</span>
                <span>Published by ONE30M</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <PolicyPopup
        isOpen={activePolicy === "privacy"}
        onClose={() => setActivePolicy(null)}
        title="Privacy Policy"
        content={<PrivacyPolicyContent />}
      />

      <PolicyPopup
        isOpen={activePolicy === "terms"}
        onClose={() => setActivePolicy(null)}
        title="Terms & Conditions"
        content={<TermsContent />}
      />

      <PolicyPopup
        isOpen={activePolicy === "cookies"}
        onClose={() => setActivePolicy(null)}
        title="Cookie Policy"
        content={<CookiePolicyContent />}
      />

      <AdvertisingPopup isOpen={showAdvertising} onClose={() => setShowAdvertising(false)} />
      
      <AffiliatePopup isOpen={showAffiliate} onClose={() => setShowAffiliate(false)} />
      
      <EditorialTeamPopup isOpen={showEditorialTeam} onClose={() => setShowEditorialTeam(false)} />
    </div>
  );
}

