"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, formatTime } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Element, Page } from "@/components/PageEditor";

interface WeddingCard {
  id: string;
  title: string;
  description?: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  venueAddress?: string;
  rsvpDeadline: string;
  maxGuests: number;
  customQuestion?: string;
  customQuestionType?: string;
  customQuestionOptions?: string;
  rsvpFormConfig?: string;
  registries?: string;
  musicUrl?: string;
  musicConfig?: string;
  eventDetailsConfig?: string;
  design: string | { pages: Page[] };
  isPublished: boolean;
}

export default function InvitationPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();

  const [card, setCard] = useState<WeddingCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pages, setPages] = useState<Page[]>([]);

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    numberOfGuests: 1,
    attending: true,
    customAnswer: "",
    message: "",
    dietaryRestrictions: "",
  });

  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showMusicPrompt, setShowMusicPrompt] = useState(true);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const rsvpFormRef = React.useRef<HTMLDivElement>(null);

  // Calculate responsive scale factor based on viewport width (must be before any returns)
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    fetchCard();
  }, [slug]);

  useEffect(() => {
    const updateWidth = () => {
      const viewportWidth = window.innerWidth;
      const padding = 32; // 16px on each side
      if (viewportWidth < 640) {
        setContainerWidth(Math.min(viewportWidth - padding, 600));
      } else {
        setContainerWidth(600);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Start music function
  const startMusic = () => {
    if (audioRef.current) {
      audioRef.current.volume = musicConfig.volume;
      audioRef.current.loop = musicConfig.loop;
      audioRef.current.muted = false;
      audioRef.current.play().then(() => {
        setAudioPlaying(true);
        setShowMusicPrompt(false);
      }).catch(err => {
        console.error("Audio playback error:", err);
      });
    }
  };

  const fetchCard = async () => {
    try {
      const response = await fetch(`/api/cards/slug/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setCard(data);

        // Parse design
        let designData;
        if (typeof data.design === "string") {
          try {
            designData = JSON.parse(data.design);
          } catch {
            designData = { pages: [] };
          }
        } else {
          designData = data.design;
        }

        if (designData.pages && designData.pages.length > 0) {
          setPages(designData.pages);
        }
      } else {
        toast({
          title: "Not Found",
          description: "This invitation does not exist",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardSlug: slug,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your RSVP has been submitted successfully",
        });
        setShowRSVP(false);
        setFormData({
          guestName: "",
          guestEmail: "",
          guestPhone: "",
          numberOfGuests: 1,
          attending: true,
          customAnswer: "",
          message: "",
          dietaryRestrictions: "",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit RSVP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit RSVP",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Smooth scroll to RSVP form
  const scrollToRSVP = () => {
    setShowRSVP(true);
    setTimeout(() => {
      rsvpFormRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  // Render element content
  const renderElementContent = (element: Element) => {
    if (!card) return null;

    switch (element.type) {
      case "couple-names":
        return `${card.brideName} & ${card.groomName}`;
      case "date":
        return formatDate(new Date(card.weddingDate));
      case "venue":
        return card.venue;
      case "image":
        return element.imageUrl ? (
          <img
            src={element.imageUrl}
            alt="Card image"
            className="w-full h-full rounded"
            style={{
              objectFit: element.objectFit || "cover",
            }}
          />
        ) : null;
      case "rsvp-button":
        return (
          <button
            onClick={scrollToRSVP}
            disabled={isPastDeadline}
            className="w-full h-full flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: element.styles?.backgroundColor || "#9333ea",
              color: element.styles?.color || "#ffffff",
            }}
          >
            <span
              style={{
                fontWeight: element.styles?.fontWeight || "600",
                fontFamily: element.styles?.fontFamily || "Inter",
              }}
            >
              {isPastDeadline ? "RSVP Closed" : (element.content || "RSVP Now")}
            </span>
          </button>
        );
      case "registry-link":
        return (
          <a
            href={element.registryUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-full flex items-center justify-center transition-opacity hover:opacity-90"
            style={{
              backgroundColor: element.styles?.backgroundColor || "#ec4899",
              color: element.styles?.color || "#ffffff",
            }}
          >
            <span
              style={{
                fontWeight: element.styles?.fontWeight || "600",
                fontFamily: element.styles?.fontFamily || "Inter",
              }}
            >
              {element.content || "View Registry"}
            </span>
          </a>
        );
      case "text":
      default:
        return element.content || "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">💑</div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!card || !card.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold mb-2">Invitation Not Found</h1>
          <p className="text-gray-600">
            This invitation does not exist or is not yet published
          </p>
        </div>
      </div>
    );
  }

  const isPastDeadline = new Date() > new Date(card.rsvpDeadline);
  const currentPage = pages[currentPageIndex];
  const hasMultiplePages = pages.length > 1;

  // Parse RSVP form configuration
  const formConfig = card.rsvpFormConfig
    ? JSON.parse(card.rsvpFormConfig)
    : {
        showPhone: true,
        phoneRequired: false,
        showDietaryRestrictions: true,
        showMessage: true,
        nameLabel: "Your Name",
        emailLabel: "Email Address",
        phoneLabel: "Phone Number",
        numberOfGuestsLabel: "Number of Guests",
        dietaryRestrictionsLabel: "Dietary Restrictions / Allergies",
        messageLabel: "Message for the Couple",
      };

  // Parse registries
  const registries = card.registries
    ? JSON.parse(card.registries)
    : [];

  // Parse event details config
  const eventDetailsConfig = card.eventDetailsConfig
    ? JSON.parse(card.eventDetailsConfig)
    : {
        showEventDetails: true,
        showMap: false,
        mapUrl: "",
        showMapLink: true,
      };

  // Parse music config
  const musicConfig = card.musicConfig
    ? JSON.parse(card.musicConfig)
    : {
        loop: true,
        autoplay: true,
        volume: 0.7,
      };

  const scale = containerWidth / 600;

  // Get background style for current page
  const getBackgroundStyle = (page: Page) => {
    if (!page.background) return { backgroundColor: "#fdf4ff" };

    if (page.background.type === "gradient" && page.background.gradient) {
      return {
        background: `linear-gradient(${page.background.gradient.direction || "to bottom"}, ${page.background.gradient.from || "#fff"}, ${page.background.gradient.to || "#fff"})`,
      };
    } else if (page.background.type === "image") {
      return {
        backgroundImage: `url(${page.background.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    } else {
      return {
        backgroundColor: page.background.value || "#fdf4ff",
      };
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4" style={{ scrollBehavior: 'smooth' }}>
      {card.musicUrl && (
        <>
          {/* Check if it's a Spotify URL */}
          {card.musicUrl.includes('spotify.com') ? (
            <div className="fixed bottom-6 left-6 z-50 bg-white rounded-lg shadow-2xl overflow-hidden">
              <iframe
                src={card.musicUrl.replace('open.spotify.com/track/', 'open.spotify.com/embed/track/').replace('open.spotify.com/playlist/', 'open.spotify.com/embed/playlist/') + '?autoplay=1&utm_source=generator'}
                width="300"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify player"
              />
            </div>
          ) : (
            <>
              {/* Regular audio for MP3 files */}
              <audio ref={audioRef} loop autoPlay>
                <source src={card.musicUrl} type="audio/mpeg" />
                <source src={card.musicUrl} type="audio/mp3" />
              </audio>

              {/* Music Control Button - bottom right corner */}
              {(
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      if (audioPlaying) {
                        audioRef.current.pause();
                        setAudioPlaying(false);
                      } else {
                        audioRef.current.play();
                        setAudioPlaying(true);
                      }
                    }
                  }}
                  className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full p-4 transition-all hover:scale-110 z-50"
                  aria-label={audioPlaying ? "Pause music" : "Play music"}
                  title={audioPlaying ? "Pause music" : "Play music"}
                >
                  {audioPlaying ? (
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              )}
            </>
          )}
        </>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Custom Multi-Page Card */}
        {pages.length > 0 ? (
          <div className="mb-8">
            {/* Desktop: Single page with navigation */}
            <div className="hidden md:block relative">
              {/* Page Display */}
              <div
                className="mx-auto rounded-3xl shadow-2xl overflow-hidden relative"
                style={{
                  width: `${containerWidth}px`,
                  minHeight: `${800 * scale}px`,
                  ...getBackgroundStyle(currentPage),
                }}
              >
                {/* Render elements */}
                {currentPage?.elements.map((element) => (
                  <div
                    key={element.id}
                    className="absolute"
                    style={{
                      left: `${element.x * scale}px`,
                      top: `${element.y * scale}px`,
                      width: `${element.width * scale}px`,
                      height: element.type === "image" ? `${element.height * scale}px` : "auto",
                      fontSize: element.styles?.fontSize ? `${element.styles.fontSize * scale}px` : undefined,
                      fontFamily: element.styles?.fontFamily,
                      color: element.styles?.color,
                      fontWeight: element.styles?.fontWeight,
                      textAlign: element.styles?.textAlign as any,
                      backgroundColor: element.styles?.backgroundColor,
                      padding: element.styles?.padding ? `${parseInt(element.styles.padding) * scale}px` : undefined,
                      borderRadius: element.styles?.borderRadius ? `${parseInt(element.styles.borderRadius) * scale}px` : undefined,
                    }}
                  >
                    {renderElementContent(element)}
                  </div>
                ))}

                {/* Page Navigation */}
                {hasMultiplePages && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentPageIndex(Math.max(0, currentPageIndex - 1))
                      }
                      disabled={currentPageIndex === 0}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={() =>
                        setCurrentPageIndex(
                          Math.min(pages.length - 1, currentPageIndex + 1)
                        )
                      }
                      disabled={currentPageIndex === pages.length - 1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Page Indicators */}
              {hasMultiplePages && (
                <div className="flex justify-center gap-2 mt-4">
                  {pages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentPageIndex
                          ? "bg-purple-600 w-8"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: Stacked pages */}
            <div className="md:hidden space-y-6">
              {pages.map((page, pageIndex) => (
                <div
                  key={page.id}
                  className="mx-auto rounded-3xl shadow-2xl overflow-hidden relative"
                  style={{
                    width: `${containerWidth}px`,
                    minHeight: `${800 * scale}px`,
                    ...getBackgroundStyle(page),
                  }}
                >
                  {/* Render elements */}
                  {page.elements.map((element) => (
                    <div
                      key={element.id}
                      className="absolute"
                      style={{
                        left: `${element.x * scale}px`,
                        top: `${element.y * scale}px`,
                        width: `${element.width * scale}px`,
                        height: element.type === "image" ? `${element.height * scale}px` : "auto",
                        fontSize: element.styles?.fontSize ? `${element.styles.fontSize * scale}px` : undefined,
                        fontFamily: element.styles?.fontFamily,
                        color: element.styles?.color,
                        fontWeight: element.styles?.fontWeight,
                        textAlign: element.styles?.textAlign as any,
                        backgroundColor: element.styles?.backgroundColor,
                        padding: element.styles?.padding ? `${parseInt(element.styles.padding) * scale}px` : undefined,
                        borderRadius: element.styles?.borderRadius ? `${parseInt(element.styles.borderRadius) * scale}px` : undefined,
                      }}
                    >
                      {renderElementContent(element)}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Event Details Section */}
            {eventDetailsConfig.showEventDetails && (
              <div
                className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mt-8 mx-auto"
                style={{
                  width: `${containerWidth}px`,
                  maxWidth: "100%",
                }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center md:text-left">
                  {card.title || `${card.brideName.split(' ')[0]}'s ${card.groomName.split(' ')[0]}'s Wedding`}
                </h2>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  {/* Date & Time */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-2">
                      DATE & TIME
                    </p>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
                          {formatDate(new Date(card.weddingDate))}
                        </p>
                        <p className="text-lg text-gray-700">
                          {formatTime(card.weddingTime)}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-2">
                      LOCATION
                    </p>
                    <div className="flex-1">
                      <p className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
                        {card.venue}
                      </p>
                      {card.venueAddress && (
                        <p className="text-lg text-gray-700 mb-3">
                          {card.venueAddress}
                        </p>
                      )}
                      {eventDetailsConfig.showMapLink && card.venueAddress && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.venue + ' ' + card.venueAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Open in Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map Section */}
                {eventDetailsConfig.showMap && eventDetailsConfig.mapUrl && (
                  <div className="mt-6">
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100" style={{ height: '300px' }}>
                      <iframe
                        src={eventDetailsConfig.mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Event location map"
                        className="absolute inset-0"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gift Registries Section */}
            {registries.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-12 mt-8 mx-auto" style={{ width: `${containerWidth}px`, maxWidth: "100%" }}>
                <div className="mb-6 md:mb-8">
                  <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-2 md:mb-3">
                    GIFTING
                  </p>
                  <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
                    {card.brideName.split(' ')[0]}'s Wishlist
                  </h2>
                </div>

                {/* Registries Grid */}
                <div className="space-y-4 md:space-y-6">
                  {registries.map((registry: { name: string; url: string; icon?: string }, index: number) => {
                    const registryLower = registry.name.toLowerCase();
                    let logo = null;
                    let bgColor = "bg-gray-50";

                    // Detect registry type and assign appropriate logo/styling
                    if (registryLower.includes("amazon")) {
                      logo = (
                        <div className="flex items-center justify-center h-10">
                          <span className="text-3xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
                            <span style={{ color: '#000' }}>amazon</span>
                            <span style={{ color: '#FF9900', fontSize: '0.6em', position: 'relative', top: '8px' }}>
                              ⌣
                            </span>
                          </span>
                        </div>
                      );
                      bgColor = "bg-white border-2 border-gray-200";
                    } else if (registryLower.includes("target")) {
                      logo = (
                        <svg className="h-16 w-16" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="48" fill="#CC0000"/>
                          <circle cx="50" cy="50" r="35" fill="white"/>
                          <circle cx="50" cy="50" r="22" fill="#CC0000"/>
                          <circle cx="50" cy="50" r="9" fill="white"/>
                        </svg>
                      );
                      bgColor = "bg-white border-2 border-gray-200";
                    } else if (registryLower.includes("walmart")) {
                      logo = (
                        <div className="flex items-center justify-center h-10">
                          <span className="text-3xl font-bold" style={{ color: '#0071CE', fontFamily: 'Arial, sans-serif' }}>
                            Walmart
                          </span>
                        </div>
                      );
                      bgColor = "bg-white border-2 border-gray-200";
                    } else {
                      logo = <span className="text-5xl">{registry.icon || "🎁"}</span>;
                    }

                    return (
                      <a
                        key={index}
                        href={registry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block ${bgColor} rounded-xl p-6 md:p-8 hover:shadow-lg transition-all duration-200 group`}
                      >
                        <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
                          <div className="text-gray-800 group-hover:scale-105 transition-transform">
                            {logo}
                          </div>
                          <p className="text-sm md:text-base font-medium text-gray-700 group-hover:text-purple-600 transition-colors text-center">
                            View the {registry.name} wishlist
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>

              </div>
            )}

          </div>
        ) : (
          /* Fallback to default card if no pages */
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 h-4"></div>
            <div className="p-8 md:p-12 space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  {card.brideName}
                </h1>
                <div className="text-3xl md:text-4xl text-gray-600 font-serif italic">
                  &
                </div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  {card.groomName}
                </h1>
              </div>

              <div className="text-center max-w-2xl mx-auto">
                <p className="text-xl text-gray-700 font-serif leading-relaxed">
                  {card.description ||
                    "Together with their families, request the honor of your presence at their wedding celebration"}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-6">
                <div className="flex items-start space-x-3 bg-purple-50 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">Date & Time</p>
                    <p className="text-gray-600">
                      {formatDate(new Date(card.weddingDate))}
                    </p>
                    <p className="text-gray-600">{formatTime(card.weddingTime)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-pink-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Venue</p>
                    <p className="text-gray-600">{card.venue}</p>
                    {card.venueAddress && (
                      <p className="text-sm text-gray-500 mt-1">
                        {card.venueAddress}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {!showRSVP && (
                <div className="text-center pt-6">
                  <Button
                    size="lg"
                    onClick={() => setShowRSVP(true)}
                    disabled={isPastDeadline}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-12 py-6 h-auto"
                  >
                    {isPastDeadline ? "RSVP Closed" : "RSVP Now"}
                  </Button>
                </div>
              )}
            </div>
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 h-4"></div>
          </div>
        )}

        {/* RSVP Form */}
        {showRSVP && !isPastDeadline && (
          <div ref={rsvpFormRef} className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative mx-auto" style={{ width: `${containerWidth}px`, maxWidth: "100%" }}>
            <button
              onClick={() => setShowRSVP(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close RSVP form"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Please RSVP
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="guestName">{formConfig.nameLabel} *</Label>
                  <Input
                    id="guestName"
                    required
                    value={formData.guestName}
                    onChange={(e) =>
                      setFormData({ ...formData, guestName: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestEmail">{formConfig.emailLabel} *</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    required
                    value={formData.guestEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, guestEmail: e.target.value })
                    }
                    placeholder="your@email.com"
                  />
                </div>

                {formConfig.showPhone && (
                  <div className="space-y-2">
                    <Label htmlFor="guestPhone">
                      {formConfig.phoneLabel}
                      {formConfig.phoneRequired && " *"}
                    </Label>
                    <Input
                      id="guestPhone"
                      type="tel"
                      required={formConfig.phoneRequired}
                      value={formData.guestPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, guestPhone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Will you be attending? *</Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={formData.attending ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, attending: true })}
                      className={
                        formData.attending
                          ? "bg-gradient-to-r from-green-600 to-green-700"
                          : ""
                      }
                    >
                      ✓ Yes, I'll be there!
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.attending ? "default" : "outline"}
                      onClick={() =>
                        setFormData({ ...formData, attending: false })
                      }
                      className={
                        !formData.attending
                          ? "bg-gradient-to-r from-gray-600 to-gray-700"
                          : ""
                      }
                    >
                      ✗ Regretfully decline
                    </Button>
                  </div>
                </div>

                {formData.attending && (
                  <div className="space-y-2">
                    <Label htmlFor="numberOfGuests">
                      {formConfig.numberOfGuestsLabel} (max {card.maxGuests}) *
                    </Label>
                    <Input
                      id="numberOfGuests"
                      type="number"
                      min="1"
                      max={card.maxGuests}
                      required
                      value={formData.numberOfGuests}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numberOfGuests: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                )}

                {card.customQuestion && formData.attending && (
                  <div className="space-y-2">
                    <Label htmlFor="customAnswer">{card.customQuestion}</Label>
                    {card.customQuestionType === "select" &&
                    card.customQuestionOptions ? (
                      <select
                        id="customAnswer"
                        value={formData.customAnswer}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customAnswer: e.target.value,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border"
                      >
                        <option value="">Select an option...</option>
                        {JSON.parse(card.customQuestionOptions).map(
                          (option: string, index: number) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    ) : card.customQuestionType === "radio" &&
                      card.customQuestionOptions ? (
                      <div className="space-y-2">
                        {JSON.parse(card.customQuestionOptions).map(
                          (option: string, index: number) => (
                            <label key={index} className="flex items-center">
                              <input
                                type="radio"
                                name="customAnswer"
                                value={option}
                                checked={formData.customAnswer === option}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    customAnswer: e.target.value,
                                  })
                                }
                                className="mr-2"
                              />
                              {option}
                            </label>
                          )
                        )}
                      </div>
                    ) : (
                      <Textarea
                        id="customAnswer"
                        value={formData.customAnswer}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customAnswer: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    )}
                  </div>
                )}

                {formData.attending && formConfig.showDietaryRestrictions && (
                  <div className="space-y-2">
                    <Label htmlFor="dietaryRestrictions">
                      {formConfig.dietaryRestrictionsLabel}
                    </Label>
                    <Input
                      id="dietaryRestrictions"
                      value={formData.dietaryRestrictions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dietaryRestrictions: e.target.value,
                        })
                      }
                      placeholder="e.g., Vegetarian, Vegan, Gluten-free"
                    />
                  </div>
                )}

                {formConfig.showMessage && (
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {formConfig.messageLabel} (Optional)
                    </Label>
                    <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={4}
                    placeholder="Share your wishes and blessings..."
                  />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
                  >
                    {submitting ? "Submitting..." : "Submit RSVP"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRSVP(false)}
                    disabled={submitting}
                    className="h-12"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            We look forward to celebrating with you! 🎊
          </p>
        </div>
      </div>
    </div>
  );
}
