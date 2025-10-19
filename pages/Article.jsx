
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

import ArticlePaywall from "../components/magazine/ArticlePaywall";
import SocialShare from "../components/magazine/SocialShare";
import ArticleSidebar from "../components/magazine/ArticleSidebar";
import AIRecommendations from "../components/magazine/AIRecommendations";
import SocialMetaTags from "../components/magazine/SocialMetaTags";
import ArticleCarousel from "../components/magazine/ArticleCarousel";
import ArticleGallery from "../components/magazine/ArticleGallery";
import ArticleProductCarousel from "../components/magazine/ArticleProductCarousel";
import AnnouncementBar from "../components/magazine/AnnouncementBar";

export default function Article() {
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get("id");
  const [showPaywall, setShowPaywall] = useState(false);
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", articleId],
    queryFn: async () => {
      const articles = await base44.entities.Article.list();
      return articles.find((a) => a.id === articleId);
    },
    enabled: !!articleId,
  });

  const { data: author } = useQuery({
    queryKey: ["editorialTeamMember", article?.author_id],
    queryFn: async () => {
      if (!article?.author_id) return null;
      const team = await base44.entities.EditorialTeam.list();
      return team.find((m) => m.id === article.author_id);
    },
    enabled: !!article?.author_id,
  });

  const { data: fullWidthBannerAd } = useQuery({
    queryKey: ["full-width-banner-article", articleId],
    queryFn: async () => {
      const ads = await base44.entities.Advertisement.list("order");
      return ads.find(ad => 
        ad.type === "full_width_banner" && 
        ad.active && 
        (
          ad.targeting === "all" ||
          (ad.targeting === "specific_article" && ad.target_article_id === articleId)
        )
      );
    },
    enabled: !!articleId,
  });

  const { data: relatedArticles = [] } = useQuery({
    queryKey: ["related-articles", article?.category, articleId],
    queryFn: async () => {
      if (!article) return [];
      const allArticles = await base44.entities.Article.list("-created_date");
      return allArticles.filter(a => 
        a.category === article.category && 
        a.id !== articleId && 
        a.status === "published"
      ).slice(0, 5);
    },
    enabled: !!article,
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData) => base44.auth.updateMe(userData),
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUser"]);
    },
  });

  useEffect(() => {
    const checkArticleAccess = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (!articleId) return;

        const articlesViewed = currentUser.articles_viewed || [];
        const lastReset = currentUser.last_reset_date;
        const now = new Date();
        const resetDate = lastReset ? new Date(lastReset) : null;

        const shouldReset =
          !resetDate ||
          (now.getTime() - resetDate.getTime()) > (7 * 24 * 60 * 60 * 1000);

        if (shouldReset) {
          await updateUserMutation.mutateAsync({
            articles_viewed: [articleId],
            last_reset_date: now.toISOString(),
          });
          setShowPaywall(false);
        } else if (articlesViewed.includes(articleId)) {
          setShowPaywall(false);
        } else if (articlesViewed.length >= 3) {
          setShowPaywall(true);
        } else {
          await updateUserMutation.mutateAsync({
            articles_viewed: [...articlesViewed, articleId],
          });
          setShowPaywall(false);
        }
      } catch (error) {
        setUser(null);
        setShowPaywall(false);
      }
    };

    checkArticleAccess();
  }, [articleId, updateUserMutation]);

  if (isLoading || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Don't show articles that are not published
  if (article.status !== "published") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-light mb-4">Article Not Available</h1>
          <p className="text-gray-400">This article is not yet published.</p>
        </div>
      </div>
    );
  }

  const heroImageClasses = {
    square: "aspect-square max-w-[600px] h-[600px] mx-auto",
    portrait: "aspect-[3/4] max-w-3xl h-[800px] mx-auto",
    landscape: "aspect-[16/9] w-full h-[600px]"
  };

  const extractDomain = (url) => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="relative">
      <SocialMetaTags
        title={`${article.title} - Éthique Magazine`}
        description={article.subtitle || article.title}
        image={article.hero_image}
      />
      
      {/* Announcement Bar - Top */}
      <AnnouncementBar pageName="Article" articleId={articleId} />
      
      {/* Hero Image */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full overflow-hidden bg-black py-20"
      >
        <div className="max-w-5xl mx-auto px-6">
          {/* Hero Image/Video */}
          <div className={heroImageClasses[article.hero_image_format || "landscape"]}>
            {article.hero_video ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-full object-cover"
                onLoadedMetadata={(e) => e.target.play().catch(() => {})}
              >
                <source src={article.hero_video} type="video/mp4" />
              </video>
            ) : (
              <img
                src={article.hero_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Title and Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8"
          >
            <span className="inline-block px-4 py-1 text-xs tracking-widest uppercase bg-purple-600/30 border border-purple-400/30 rounded-full mb-4">
              {article.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-light mb-4 leading-tight">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="text-xl md:text-2xl text-gray-300 font-light mb-6">
                {article.subtitle}
              </p>
            )}
            <div className="flex items-center gap-6 text-sm text-gray-400 flex-wrap">
              {author && (
                <span>Words by {author.full_name}</span>
              )}
              {article.read_time && (
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{article.read_time} min read</span>
                </div>
              )}
              {article.published_date && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{format(new Date(article.published_date), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Article Content with Sidebar */}
      <section className="relative max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-[1fr_300px] gap-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={`relative ${showPaywall ? "relative" : ""}`}
          >
            {/* Content Section 1 */}
            {article.content_section_1 && (
              <div
                dangerouslySetInnerHTML={{ __html: article.content_section_1 }}
                className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed"
                style={{ fontSize: "1.125rem", lineHeight: "2" }}
              />
            )}

            {/* Carousel Section */}
            {article.carousel_images && article.carousel_images.length > 0 && (
              <ArticleCarousel images={article.carousel_images} />
            )}

            {/* Content Section 2 */}
            {article.content_section_2 && (
              <div
                dangerouslySetInnerHTML={{ __html: article.content_section_2 }}
                className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed mt-12"
                style={{ fontSize: "1.125rem", lineHeight: "2" }}
              />
            )}

            {/* Middle Section */}
            {article.middle_section_type === "video" && article.middle_section_video && (
              <div className="my-12 w-full">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full aspect-video object-cover"
                  onLoadedMetadata={(e) => {
                    e.target.play().catch(() => {});
                  }}
                >
                  <source src={article.middle_section_video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {article.middle_section_type === "gallery" && article.gallery_images && article.gallery_images.length > 0 && (
              <ArticleGallery images={article.gallery_images} />
            )}

            {article.middle_section_type === "product_carousel" && article.product_carousel && article.product_carousel.length > 0 && (
              <ArticleProductCarousel products={article.product_carousel} />
            )}

            {/* Content Section 3 */}
            {article.content_section_3 && (
              <div
                dangerouslySetInnerHTML={{ __html: article.content_section_3 }}
                className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed mt-12"
                style={{ fontSize: "1.125rem", lineHeight: "2" }}
              />
            )}

            {!showPaywall && article.backlink && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <a
                  href={article.backlink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {extractDomain(article.backlink)}
                </a>
              </div>
            )}

            {showPaywall && (
              <div className="absolute inset-0 top-[20%]">
                <div
                  className="absolute inset-0 backdrop-blur-xl"
                  style={{
                    maskImage: "linear-gradient(to bottom, transparent, black 20%)",
                    WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%)",
                  }}
                />
              </div>
            )}

            {!showPaywall && <SocialShare article={article} />}
          </motion.div>

          <ArticleSidebar currentArticle={article} relatedArticles={relatedArticles} />
        </div>

        {!showPaywall && <AIRecommendations user={user} currentArticleId={articleId} />}
      </section>

      {/* Full-Width Banner Ad - Bottom of Article */}
      {fullWidthBannerAd && !showPaywall && (
        <section className="relative w-full py-16 my-16 overflow-hidden bg-[#1a1a1a]">
          <div className="absolute inset-0">
            {fullWidthBannerAd.banner_background_image && (
              <img
                src={fullWidthBannerAd.banner_background_image}
                alt="Advertisement"
                className="w-full h-full object-cover opacity-10"
              />
            )}
          </div>

          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/2ec706ef8_EthiquelogotransparentW.png" 
              alt="Éthique" 
              className="h-12 w-auto mx-auto mb-6 opacity-60"
            />

            {fullWidthBannerAd.banner_heading && (
              <h2 className="text-3xl md:text-4xl mb-6 uppercase tracking-wider font-light">
                {fullWidthBannerAd.banner_heading}
              </h2>
            )}

            {fullWidthBannerAd.banner_subtitle && (
              <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto mb-8">
                {fullWidthBannerAd.banner_subtitle}
              </p>
            )}

            {fullWidthBannerAd.banner_button_text && fullWidthBannerAd.banner_button_url && (
              <a
                href={fullWidthBannerAd.banner_button_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-black hover:bg-gray-200 px-10 py-4 text-sm uppercase font-semibold border-2 border-white transition-all duration-300"
                style={{ letterSpacing: '1px' }}
              >
                {fullWidthBannerAd.banner_button_text}
              </a>
            )}

            {fullWidthBannerAd.banner_footer_text && (
              <p className="text-xs text-gray-600 mt-6 uppercase tracking-wider">
                {fullWidthBannerAd.banner_footer_text}
              </p>
            )}
          </div>
        </section>
      )}

      <AnimatePresence>
        {showPaywall && <ArticlePaywall onClose={() => setShowPaywall(false)} />}
      </AnimatePresence>
    </div>
  );
}
