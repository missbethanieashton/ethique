
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react"; // Removed Linkedin, ExternalLink
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function EditorialTeamPopup({ isOpen, onClose }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const scrollRef = useRef(null);

  const { data: team = [], isLoading } = useQuery({
    queryKey: ["editorialTeam"],
    queryFn: () => base44.entities.EditorialTeam.list("order"),
    enabled: isOpen,
  });

  useEffect(() => {
    console.log("Editorial team data:", team);
    if (team.length > 0 && !selectedMember) {
      setSelectedMember(team[0]);
    }
  }, [team, selectedMember]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 z-50"
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: "10%" }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed inset-x-0 bottom-0 h-[90vh] bg-[#0d0d0d] border-t border-white/20 z-50 overflow-hidden"
      >
        <div className="sticky top-0 bg-[#0d0d0d] border-b border-white/10 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-light text-white">Editorial Team</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 transition-colors rounded-full"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="h-[calc(100%-70px)] md:h-[calc(100%-80px)] overflow-y-auto px-4 md:px-8 py-6 md:py-8 pb-20 md:pb-32">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : team.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                No team members found
              </div>
            ) : (
              <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8">
                <div className="w-full md:col-span-2">
                  <div className="relative group">
                    <button
                      onClick={() => scroll("left")}
                      className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"
                    >
                      <ChevronLeft size={20} className="text-white" />
                    </button>

                    <button
                      onClick={() => scroll("right")}
                      className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"
                    >
                      <ChevronRight size={20} className="text-white" />
                    </button>

                    <div
                      ref={scrollRef}
                      className="flex overflow-x-auto scrollbar-hide scroll-smooth gap-0"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {team.map((member) => {
                        console.log("Rendering member:", member.full_name, "Image:", member.profile_image);
                        return (
                          <button
                            key={member.id}
                            onClick={() => setSelectedMember(member)}
                            className="group/member relative flex-shrink-0 w-32 md:w-48 aspect-[3/4] overflow-hidden"
                            style={{ margin: 0, padding: 0 }}
                          >
                            {member.profile_video ? (
                              <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover transition-all duration-300 group-hover/member:scale-110"
                              >
                                <source src={member.profile_video} type="video/mp4" />
                              </video>
                            ) : member.profile_image ? (
                              <img
                                src={member.profile_image}
                                alt={member.full_name}
                                className="w-full h-full object-cover transition-all duration-300 group-hover/member:scale-110"
                                onError={(e) => {
                                  console.error("Image failed to load:", member.profile_image);
                                  e.target.style.display = 'none';
                                }}
                                onLoad={() => console.log("Image loaded successfully:", member.profile_image)}
                              />
                            ) : (
                              <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/50">
                                No Image
                              </div>
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/member:opacity-100 transition-opacity duration-300" />
                            
                            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 transform translate-y-full group-hover/member:translate-y-0 transition-transform duration-300">
                              <h4 className="text-white font-medium text-xs md:text-sm mb-1">{member.full_name}</h4>
                              <p className="text-gray-300 text-[10px] md:text-xs">{member.title}</p>
                            </div>

                            {selectedMember?.id === member.id && (
                              <div className="absolute inset-0 border-2 md:border-4 border-white pointer-events-none" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="w-full md:col-span-1">
                  {selectedMember && (
                    <motion.div
                      key={selectedMember.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/5 p-4 md:p-6 rounded-lg"
                    >
                      <h3 className="text-lg md:text-xl font-light text-white mb-2">
                        {selectedMember.full_name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">
                        {selectedMember.title}
                      </p>

                      {selectedMember.bio && (
                        <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-4 md:mb-6">
                          {selectedMember.bio}
                        </p>
                      )}

                      <div className="flex items-center gap-4">
                        {selectedMember.linkedin_url && (
                          <a
                            href={selectedMember.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                            title="LinkedIn"
                          >
                            <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                              <rect x="2" y="9" width="4" height="12"></rect>
                              <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                          </a>
                        )}

                        {selectedMember.portfolio_url && (
                          <a
                            href={selectedMember.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Portfolio"
                          >
                            <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                              <line x1="8" y1="21" x2="16" y2="21"></line>
                              <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                          </a>
                        )}

                        {selectedMember.instagram_link && (
                          <a
                            href={selectedMember.instagram_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Instagram"
                          >
                            <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
