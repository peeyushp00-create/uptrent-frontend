// ContentStudio.tsx — Studio workspace, matching Lovable's Ideas/Scripts/Video/Drafts/Calendar
// tab layout. Video tab keeps the real editor (transcribe, overlays, music, export) —
// Ideas/Scripts/Drafts are cosmetic like Lovable's; Calendar is Lovable's real localStorage planner.

import React, { useState, useRef, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase"; // adjust path if needed
import SEO from "@/components/SEO";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Pencil, Trash2, Copy, FileText, Lightbulb, Calendar as CalendarIcon, Repeat, Link2,
  Download, Loader2, Layers, Type, Palette, Circle, Mic, Wand2, Zap, Save, Search, Undo2, Redo2, Plus,
  Music as MusicIcon, ImagePlus, X, ZoomIn, ZoomOut, Film, Play, Pause, Scissors, Combine,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;
const PURPLE = "hsl(var(--primary))";
const GRAD = "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--ring)))";
const PX_PER_SEC = 80;
const FILMSTRIP_TILE_W = 46;

type Word = { id: number; start: number; end: number; text: string };
type Segment = { id: number; start: number; end: number; text: string };
type Overlay = { id: string; kind: "image" | "video"; url: string; thumb: string; start: number; length: number; mode: "pip" | "full" | "half"; half: "top" | "bottom"; x: number; y: number };
type PexItem = { id: number; kind: "image" | "video"; thumb: string; url: string };
type Music = { key: string; label: string; url: string };

const FONTS = [
  { id: "'Poppins',sans-serif", label: "Poppins" },
  { id: "'Montserrat',sans-serif", label: "Montserrat" },
  { id: "'Anton',sans-serif", label: "Anton" },
  { id: "'Bebas Neue',sans-serif", label: "Bebas Neue" },
  { id: "'Inter',sans-serif", label: "Inter" },
  { id: "'Space Grotesk',sans-serif", label: "Space Grotesk" },
  { id: "'Playfair Display',serif", label: "Playfair" },
  { id: "'Caveat',cursive", label: "Caveat" },
  { id: "'Permanent Marker',cursive", label: "Marker" },
  { id: "'Space Mono',monospace", label: "Mono" },
  { id: "'Bangers',cursive", label: "Bangers" },
  { id: "'Press Start 2P',monospace", label: "Pixel" },
  { id: "'Oswald',sans-serif", label: "Oswald" },
  { id: "'Archivo Black',sans-serif", label: "Archivo Black" },
  { id: "'Fredoka',sans-serif", label: "Fredoka" },
  { id: "'Lobster',cursive", label: "Lobster" },
  { id: "'Righteous',cursive", label: "Righteous" },
  { id: "'DM Serif Display',serif", label: "DM Serif" },
  { id: "'Shrikhand',cursive", label: "Shrikhand" },
  { id: "'Kalam',cursive", label: "Kalam" },
  { id: "'Bungee',cursive", label: "Bungee" },
  { id: "'Great Vibes',cursive", label: "Great Vibes" },
];

// A cut piece of the video track — start/end are positions in the original
// uploaded file, not a compacted "edited" timeline (see videoClips state).
type VideoClip = { id: string; start: number; end: number };

// ── Caption style system — templates + per-property overrides, matching
// Lovable's "Social Spark Studio" caption editor exactly. ──
type CapPosition = "bottom" | "middle" | "top";
type CapAnimation = "none" | "fade" | "pop" | "slide";
type TemplateId =
  | "minimal" | "bold" | "modern" | "podcast" | "creator" | "business" | "news" | "glow" | "sticker" | "typewriter"
  | "vibrant" | "romantic" | "comic" | "pixel" | "luxe"
  | "neon" | "cinema" | "retro" | "elegant" | "street" | "gamer" | "fitness" | "travel" | "foodie" | "tech"
  | "fashion" | "meme" | "documentary" | "karaoke" | "highlight" | "shadow" | "outline" | "aurora" | "cute" | "horror"
  | "corporate" | "y2k" | "handwritten" | "cleanWhite" | "boldRed" | "skyBlue" | "goldLuxury" | "popArt" | "midnight" | "sunshine"
  | "graffiti" | "cleanSerif" | "boldPink" | "matrix" | "royalty"
  | "whisper" | "frost" | "paperwhite" | "quiet" | "ghost" | "chalk" | "linen"
  | "thunder" | "impact" | "crimson" | "titan" | "blaze" | "ironclad" | "megaphone"
  | "velvet" | "ivory" | "champagne" | "opal" | "marble" | "orchid" | "silk"
  | "bubblegum" | "confetti" | "jellybean" | "candy" | "doodle" | "rainbow" | "party" | "giggle"
  | "cyberpunk" | "hologram" | "laser" | "circuit" | "pixelGlow" | "voltage" | "plasma" | "byteWave"
  | "inkSplash" | "wanderlust" | "storyteller" | "mosaic" | "origami" | "sketch" | "folklore"
  | "broadcast" | "anchor" | "bulletin" | "headline" | "studioMic" | "primetime";

type CaptionStyle = {
  fontFamily: string;
  fontSize: number;   // rem
  fontWeight: number; // 400..900
  textColor: string;
  highlightColor: string;
  background: "" | "solid" | "pill";
  bgColor: string;
  position: CapPosition;
  animation: CapAnimation;
  uppercase: boolean;
  capX?: number; // percent within the preview frame (0-100); overrides `position` when set
  capY?: number;
};

// Default x/y (percent) for each named preset — used until the caption is dragged.
function presetCapPos(position: CapPosition): { x: number; y: number } {
  return position === "top" ? { x: 50, y: 14 } : position === "middle" ? { x: 50, y: 47 } : { x: 50, y: 86 };
}

type TemplateCategory = "Minimal" | "Bold" | "Elegant" | "Playful" | "Neon & Tech" | "Creative" | "News & Podcast";
const TEMPLATE_CATEGORIES: TemplateCategory[] = ["Minimal", "Bold", "Elegant", "Playful", "Neon & Tech", "Creative", "News & Podcast"];

const TEMPLATES: Record<TemplateId, { label: string; category: TemplateCategory; style: CaptionStyle }> = {
  minimal: { label: "Minimal", category: "Minimal", style: { fontFamily: "'Inter',sans-serif", fontSize: 1.5, fontWeight: 600, textColor: "#ffffff", highlightColor: "#c4b5fd", background: "", bgColor: "#000000", position: "bottom", animation: "fade", uppercase: false } },
  bold: { label: "Bold", category: "Bold", style: { fontFamily: "'Anton',sans-serif", fontSize: 2.25, fontWeight: 800, textColor: "#ffffff", highlightColor: "#facc15", background: "", bgColor: "#000000", position: "bottom", animation: "pop", uppercase: true } },
  modern: { label: "Modern", category: "News & Podcast", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.4, fontWeight: 700, textColor: "#ffffff", highlightColor: "#a78bfa", background: "pill", bgColor: "#0f172a", position: "bottom", animation: "slide", uppercase: false } },
  podcast: { label: "Podcast", category: "News & Podcast", style: { fontFamily: "'Inter',sans-serif", fontSize: 1.25, fontWeight: 500, textColor: "#f5f5f4", highlightColor: "#fbbf24", background: "solid", bgColor: "#000000", position: "bottom", animation: "fade", uppercase: false } },
  creator: { label: "Creator", category: "Creative", style: { fontFamily: "'Poppins',sans-serif", fontSize: 1.7, fontWeight: 800, textColor: "#ffffff", highlightColor: "#22d3ee", background: "", bgColor: "#000000", position: "middle", animation: "pop", uppercase: false } },
  business: { label: "Business", category: "Elegant", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.5, fontWeight: 700, textColor: "#ffffff", highlightColor: "#fde68a", background: "solid", bgColor: "#1e293b", position: "bottom", animation: "fade", uppercase: false } },
  news: { label: "News", category: "News & Podcast", style: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 1.8, fontWeight: 700, textColor: "#ffffff", highlightColor: "#ef4444", background: "solid", bgColor: "#dc2626", position: "bottom", animation: "slide", uppercase: true } },
  glow: { label: "Glow", category: "Neon & Tech", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.8, fontWeight: 800, textColor: "#f0abfc", highlightColor: "#22d3ee", background: "", bgColor: "#000000", position: "middle", animation: "pop", uppercase: true } },
  sticker: { label: "Sticker", category: "Playful", style: { fontFamily: "'Permanent Marker',cursive", fontSize: 1.6, fontWeight: 400, textColor: "#111827", highlightColor: "#f97316", background: "pill", bgColor: "#fde047", position: "middle", animation: "pop", uppercase: false } },
  typewriter: { label: "Typewriter", category: "Minimal", style: { fontFamily: "'Space Mono',monospace", fontSize: 1.15, fontWeight: 700, textColor: "#e5e7eb", highlightColor: "#5eead4", background: "solid", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  vibrant: { label: "Vibrant", category: "Bold", style: { fontFamily: "'Montserrat',sans-serif", fontSize: 1.9, fontWeight: 800, textColor: "#ffffff", highlightColor: "#f472b6", background: "", bgColor: "#000000", position: "bottom", animation: "pop", uppercase: true } },
  romantic: { label: "Romantic", category: "Creative", style: { fontFamily: "'Caveat',cursive", fontSize: 2, fontWeight: 700, textColor: "#fff5f0", highlightColor: "#fb923c", background: "", bgColor: "#000000", position: "bottom", animation: "fade", uppercase: false } },
  comic: { label: "Comic", category: "Playful", style: { fontFamily: "'Bangers',cursive", fontSize: 2, fontWeight: 400, textColor: "#fef08a", highlightColor: "#ef4444", background: "pill", bgColor: "#1d4ed8", position: "middle", animation: "pop", uppercase: true } },
  pixel: { label: "Pixel", category: "Neon & Tech", style: { fontFamily: "'Press Start 2P',monospace", fontSize: 0.85, fontWeight: 400, textColor: "#39ff14", highlightColor: "#22d3ee", background: "solid", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  luxe: { label: "Luxe", category: "Elegant", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.3, fontWeight: 500, textColor: "#f5f5f0", highlightColor: "#d4af37", background: "", bgColor: "#000000", position: "top", animation: "fade", uppercase: false } },

  neon: { label: "Neon", category: "Neon & Tech", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.6, fontWeight: 800, textColor: "#22d3ee", highlightColor: "#f472b6", background: "", bgColor: "#000000", position: "bottom", animation: "pop", uppercase: true } },
  cinema: { label: "Cinema", category: "Elegant", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.4, fontWeight: 600, textColor: "#f5e6c8", highlightColor: "#eab308", background: "solid", bgColor: "#000000", position: "bottom", animation: "fade", uppercase: false } },
  retro: { label: "Retro", category: "Playful", style: { fontFamily: "'Bangers',cursive", fontSize: 1.9, fontWeight: 400, textColor: "#1e293b", highlightColor: "#f97316", background: "pill", bgColor: "#fbbf24", position: "middle", animation: "pop", uppercase: true } },
  elegant: { label: "Elegant", category: "Elegant", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.35, fontWeight: 500, textColor: "#ffffff", highlightColor: "#d4af37", background: "", bgColor: "#000000", position: "top", animation: "fade", uppercase: false } },
  street: { label: "Street", category: "Bold", style: { fontFamily: "'Anton',sans-serif", fontSize: 2.1, fontWeight: 800, textColor: "#ffffff", highlightColor: "#dc2626", background: "solid", bgColor: "#000000", position: "bottom", animation: "slide", uppercase: true } },
  gamer: { label: "Gamer", category: "Neon & Tech", style: { fontFamily: "'Press Start 2P',monospace", fontSize: 0.9, fontWeight: 400, textColor: "#a3e635", highlightColor: "#c084fc", background: "solid", bgColor: "#0f0f1a", position: "bottom", animation: "none", uppercase: false } },
  fitness: { label: "Fitness", category: "Bold", style: { fontFamily: "'Montserrat',sans-serif", fontSize: 1.8, fontWeight: 800, textColor: "#ffffff", highlightColor: "#fb923c", background: "", bgColor: "#000000", position: "middle", animation: "pop", uppercase: true } },
  travel: { label: "Travel", category: "Creative", style: { fontFamily: "'Poppins',sans-serif", fontSize: 1.4, fontWeight: 600, textColor: "#ffffff", highlightColor: "#2dd4bf", background: "pill", bgColor: "#0f172a", position: "bottom", animation: "fade", uppercase: false } },
  foodie: { label: "Foodie", category: "Playful", style: { fontFamily: "'Caveat',cursive", fontSize: 2.1, fontWeight: 700, textColor: "#7c2d12", highlightColor: "#dc2626", background: "pill", bgColor: "#fef3c7", position: "bottom", animation: "fade", uppercase: false } },
  tech: { label: "Tech", category: "Neon & Tech", style: { fontFamily: "'Space Mono',monospace", fontSize: 1.2, fontWeight: 700, textColor: "#22d3ee", highlightColor: "#a78bfa", background: "solid", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  fashion: { label: "Fashion", category: "Elegant", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.5, fontWeight: 600, textColor: "#111827", highlightColor: "#f472b6", background: "solid", bgColor: "#ffffff", position: "bottom", animation: "fade", uppercase: false } },
  meme: { label: "Meme", category: "Bold", style: { fontFamily: "'Anton',sans-serif", fontSize: 2, fontWeight: 800, textColor: "#ffffff", highlightColor: "#fde047", background: "", bgColor: "#000000", position: "top", animation: "none", uppercase: true } },
  documentary: { label: "Documentary", category: "Minimal", style: { fontFamily: "'Inter',sans-serif", fontSize: 1.1, fontWeight: 500, textColor: "#f8fafc", highlightColor: "#94a3b8", background: "solid", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  karaoke: { label: "Karaoke", category: "Playful", style: { fontFamily: "'Poppins',sans-serif", fontSize: 1.7, fontWeight: 800, textColor: "#ffffff", highlightColor: "#fde047", background: "", bgColor: "#000000", position: "middle", animation: "pop", uppercase: false } },
  highlight: { label: "Highlight", category: "Bold", style: { fontFamily: "'Montserrat',sans-serif", fontSize: 1.5, fontWeight: 700, textColor: "#1e1b4b", highlightColor: "#f472b6", background: "pill", bgColor: "#fde047", position: "bottom", animation: "pop", uppercase: false } },
  shadow: { label: "Shadow", category: "Minimal", style: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 2, fontWeight: 700, textColor: "#ffffff", highlightColor: "#e5e7eb", background: "", bgColor: "#000000", position: "bottom", animation: "fade", uppercase: true } },
  outline: { label: "Outline", category: "Minimal", style: { fontFamily: "'Anton',sans-serif", fontSize: 1.9, fontWeight: 800, textColor: "#fefefe", highlightColor: "#000000", background: "", bgColor: "#000000", position: "bottom", animation: "none", uppercase: true } },
  aurora: { label: "Aurora", category: "Neon & Tech", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.7, fontWeight: 700, textColor: "#c084fc", highlightColor: "#22d3ee", background: "", bgColor: "#000000", position: "middle", animation: "pop", uppercase: false } },
  cute: { label: "Cute", category: "Playful", style: { fontFamily: "'Caveat',cursive", fontSize: 2, fontWeight: 700, textColor: "#831843", highlightColor: "#f9a8d4", background: "pill", bgColor: "#fce7f3", position: "middle", animation: "fade", uppercase: false } },
  horror: { label: "Horror", category: "Creative", style: { fontFamily: "'Permanent Marker',cursive", fontSize: 1.7, fontWeight: 400, textColor: "#dc2626", highlightColor: "#ffffff", background: "", bgColor: "#000000", position: "top", animation: "none", uppercase: true } },
  corporate: { label: "Corporate", category: "Minimal", style: { fontFamily: "'Inter',sans-serif", fontSize: 1.2, fontWeight: 600, textColor: "#ffffff", highlightColor: "#93c5fd", background: "solid", bgColor: "#1e3a8a", position: "bottom", animation: "fade", uppercase: false } },
  y2k: { label: "Y2K", category: "Playful", style: { fontFamily: "'Poppins',sans-serif", fontSize: 1.8, fontWeight: 800, textColor: "#ec4899", highlightColor: "#22d3ee", background: "", bgColor: "#000000", position: "bottom", animation: "pop", uppercase: true } },
  handwritten: { label: "Handwritten", category: "Creative", style: { fontFamily: "'Caveat',cursive", fontSize: 1.9, fontWeight: 700, textColor: "#1f2937", highlightColor: "#f59e0b", background: "", bgColor: "#000000", position: "bottom", animation: "fade", uppercase: false } },
  cleanWhite: { label: "Clean White", category: "Minimal", style: { fontFamily: "'Inter',sans-serif", fontSize: 1.35, fontWeight: 600, textColor: "#ffffff", highlightColor: "#d1d5db", background: "", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  boldRed: { label: "Bold Red", category: "Bold", style: { fontFamily: "'Anton',sans-serif", fontSize: 2, fontWeight: 800, textColor: "#ffffff", highlightColor: "#fecaca", background: "solid", bgColor: "#dc2626", position: "bottom", animation: "pop", uppercase: true } },
  skyBlue: { label: "Sky Blue", category: "Neon & Tech", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.4, fontWeight: 700, textColor: "#ffffff", highlightColor: "#bae6fd", background: "pill", bgColor: "#0284c7", position: "bottom", animation: "slide", uppercase: false } },
  goldLuxury: { label: "Gold Luxury", category: "Elegant", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.4, fontWeight: 600, textColor: "#d4af37", highlightColor: "#ffffff", background: "", bgColor: "#000000", position: "top", animation: "fade", uppercase: false } },
  popArt: { label: "Pop Art", category: "Playful", style: { fontFamily: "'Bangers',cursive", fontSize: 1.9, fontWeight: 400, textColor: "#0f172a", highlightColor: "#dc2626", background: "pill", bgColor: "#22d3ee", position: "middle", animation: "pop", uppercase: true } },
  midnight: { label: "Midnight", category: "Neon & Tech", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.4, fontWeight: 700, textColor: "#ffffff", highlightColor: "#818cf8", background: "solid", bgColor: "#1e1b4b", position: "bottom", animation: "fade", uppercase: false } },
  sunshine: { label: "Sunshine", category: "Playful", style: { fontFamily: "'Poppins',sans-serif", fontSize: 1.5, fontWeight: 700, textColor: "#78350f", highlightColor: "#dc2626", background: "pill", bgColor: "#fde047", position: "bottom", animation: "pop", uppercase: false } },
  graffiti: { label: "Graffiti", category: "Creative", style: { fontFamily: "'Permanent Marker',cursive", fontSize: 1.8, fontWeight: 400, textColor: "#f97316", highlightColor: "#22d3ee", background: "", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  cleanSerif: { label: "Clean Serif", category: "Minimal", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.25, fontWeight: 500, textColor: "#e5e7eb", highlightColor: "#9ca3af", background: "", bgColor: "#000000", position: "bottom", animation: "fade", uppercase: false } },
  boldPink: { label: "Bold Pink", category: "Bold", style: { fontFamily: "'Montserrat',sans-serif", fontSize: 1.7, fontWeight: 800, textColor: "#ffffff", highlightColor: "#fbcfe8", background: "solid", bgColor: "#db2777", position: "bottom", animation: "pop", uppercase: true } },
  matrix: { label: "Matrix", category: "Neon & Tech", style: { fontFamily: "'Space Mono',monospace", fontSize: 1.3, fontWeight: 700, textColor: "#22c55e", highlightColor: "#4ade80", background: "solid", bgColor: "#000000", position: "bottom", animation: "none", uppercase: true } },
  royalty: { label: "Royalty", category: "Elegant", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.45, fontWeight: 600, textColor: "#e9d5ff", highlightColor: "#d4af37", background: "", bgColor: "#000000", position: "top", animation: "fade", uppercase: false } },

  whisper: { label: "Whisper", category: "Minimal", style: { fontFamily: "'Inter',sans-serif", fontSize: 1.2, fontWeight: 400, textColor: "#e5e7eb", highlightColor: "#9ca3af", background: "", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  frost: { label: "Frost", category: "Minimal", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.3, fontWeight: 500, textColor: "#f0f9ff", highlightColor: "#7dd3fc", background: "", bgColor: "#000000", position: "bottom", animation: "fade", uppercase: false } },
  paperwhite: { label: "Paperwhite", category: "Minimal", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.2, fontWeight: 400, textColor: "#1f2937", highlightColor: "#6b7280", background: "solid", bgColor: "#ffffff", position: "bottom", animation: "fade", uppercase: false } },
  quiet: { label: "Quiet", category: "Minimal", style: { fontFamily: "'Inter',sans-serif", fontSize: 1.1, fontWeight: 400, textColor: "#d1d5db", highlightColor: "#9ca3af", background: "", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  ghost: { label: "Ghost", category: "Minimal", style: { fontFamily: "'Space Mono',monospace", fontSize: 1.15, fontWeight: 500, textColor: "#f3f4f6", highlightColor: "#a1a1aa", background: "", bgColor: "#000000", position: "middle", animation: "fade", uppercase: false } },
  chalk: { label: "Chalk", category: "Minimal", style: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 1.6, fontWeight: 500, textColor: "#f5f5f4", highlightColor: "#d4d4d8", background: "", bgColor: "#000000", position: "bottom", animation: "none", uppercase: true } },
  linen: { label: "Linen", category: "Minimal", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.2, fontWeight: 400, textColor: "#eae7dc", highlightColor: "#a8a29e", background: "", bgColor: "#000000", position: "top", animation: "fade", uppercase: false } },

  thunder: { label: "Thunder", category: "Bold", style: { fontFamily: "'Anton',sans-serif", fontSize: 2.2, fontWeight: 800, textColor: "#ffffff", highlightColor: "#fbbf24", background: "", bgColor: "#000000", position: "bottom", animation: "pop", uppercase: true } },
  impact: { label: "Impact", category: "Bold", style: { fontFamily: "'Anton',sans-serif", fontSize: 2.3, fontWeight: 900, textColor: "#ffffff", highlightColor: "#f87171", background: "solid", bgColor: "#000000", position: "bottom", animation: "pop", uppercase: true } },
  crimson: { label: "Crimson", category: "Bold", style: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 2, fontWeight: 700, textColor: "#ffffff", highlightColor: "#fecaca", background: "solid", bgColor: "#991b1b", position: "bottom", animation: "slide", uppercase: true } },
  titan: { label: "Titan", category: "Bold", style: { fontFamily: "'Montserrat',sans-serif", fontSize: 2, fontWeight: 900, textColor: "#ffffff", highlightColor: "#fde047", background: "", bgColor: "#000000", position: "middle", animation: "pop", uppercase: true } },
  blaze: { label: "Blaze", category: "Bold", style: { fontFamily: "'Anton',sans-serif", fontSize: 2.1, fontWeight: 800, textColor: "#fed7aa", highlightColor: "#ea580c", background: "", bgColor: "#000000", position: "bottom", animation: "pop", uppercase: true } },
  ironclad: { label: "Ironclad", category: "Bold", style: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 2, fontWeight: 700, textColor: "#e5e7eb", highlightColor: "#71717a", background: "solid", bgColor: "#18181b", position: "bottom", animation: "none", uppercase: true } },
  megaphone: { label: "Megaphone", category: "Bold", style: { fontFamily: "'Montserrat',sans-serif", fontSize: 1.9, fontWeight: 800, textColor: "#ffffff", highlightColor: "#fbbf24", background: "solid", bgColor: "#dc2626", position: "bottom", animation: "pop", uppercase: true } },

  velvet: { label: "Velvet", category: "Elegant", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.4, fontWeight: 600, textColor: "#fdf2f8", highlightColor: "#be185d", background: "", bgColor: "#000000", position: "top", animation: "fade", uppercase: false } },
  ivory: { label: "Ivory", category: "Elegant", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.3, fontWeight: 500, textColor: "#fffbeb", highlightColor: "#d4af37", background: "", bgColor: "#000000", position: "bottom", animation: "fade", uppercase: false } },
  champagne: { label: "Champagne", category: "Elegant", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.35, fontWeight: 500, textColor: "#f5e6ca", highlightColor: "#eab308", background: "solid", bgColor: "#1c1917", position: "bottom", animation: "fade", uppercase: false } },
  opal: { label: "Opal", category: "Elegant", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.3, fontWeight: 500, textColor: "#e0e7ff", highlightColor: "#a5b4fc", background: "", bgColor: "#000000", position: "top", animation: "fade", uppercase: false } },
  marble: { label: "Marble", category: "Elegant", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.25, fontWeight: 500, textColor: "#f8fafc", highlightColor: "#94a3b8", background: "", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  orchid: { label: "Orchid", category: "Elegant", style: { fontFamily: "'Caveat',cursive", fontSize: 1.9, fontWeight: 700, textColor: "#f3e8ff", highlightColor: "#c084fc", background: "", bgColor: "#000000", position: "middle", animation: "fade", uppercase: false } },
  silk: { label: "Silk", category: "Elegant", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.3, fontWeight: 500, textColor: "#fdf4ff", highlightColor: "#e9d5ff", background: "", bgColor: "#000000", position: "top", animation: "fade", uppercase: false } },

  bubblegum: { label: "Bubblegum", category: "Playful", style: { fontFamily: "'Poppins',sans-serif", fontSize: 1.8, fontWeight: 700, textColor: "#831843", highlightColor: "#f472b6", background: "pill", bgColor: "#fbcfe8", position: "middle", animation: "pop", uppercase: false } },
  confetti: { label: "Confetti", category: "Playful", style: { fontFamily: "'Bangers',cursive", fontSize: 1.9, fontWeight: 400, textColor: "#1e293b", highlightColor: "#f59e0b", background: "pill", bgColor: "#67e8f9", position: "middle", animation: "pop", uppercase: true } },
  jellybean: { label: "Jellybean", category: "Playful", style: { fontFamily: "'Montserrat',sans-serif", fontSize: 1.7, fontWeight: 700, textColor: "#ffffff", highlightColor: "#34d399", background: "solid", bgColor: "#f472b6", position: "bottom", animation: "pop", uppercase: false } },
  candy: { label: "Candy", category: "Playful", style: { fontFamily: "'Caveat',cursive", fontSize: 2, fontWeight: 700, textColor: "#9d174d", highlightColor: "#fb7185", background: "pill", bgColor: "#ffe4e6", position: "bottom", animation: "fade", uppercase: false } },
  doodle: { label: "Doodle", category: "Playful", style: { fontFamily: "'Permanent Marker',cursive", fontSize: 1.6, fontWeight: 400, textColor: "#1d4ed8", highlightColor: "#fbbf24", background: "", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  rainbow: { label: "Rainbow", category: "Playful", style: { fontFamily: "'Poppins',sans-serif", fontSize: 1.7, fontWeight: 800, textColor: "#ffffff", highlightColor: "#a78bfa", background: "", bgColor: "#000000", position: "middle", animation: "pop", uppercase: true } },
  party: { label: "Party", category: "Playful", style: { fontFamily: "'Bangers',cursive", fontSize: 1.8, fontWeight: 400, textColor: "#ffffff", highlightColor: "#f472b6", background: "pill", bgColor: "#7c3aed", position: "middle", animation: "pop", uppercase: true } },
  giggle: { label: "Giggle", category: "Playful", style: { fontFamily: "'Caveat',cursive", fontSize: 1.9, fontWeight: 700, textColor: "#92400e", highlightColor: "#fbbf24", background: "pill", bgColor: "#fef3c7", position: "bottom", animation: "fade", uppercase: false } },

  cyberpunk: { label: "Cyberpunk", category: "Neon & Tech", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.7, fontWeight: 800, textColor: "#f0abfc", highlightColor: "#22d3ee", background: "", bgColor: "#000000", position: "bottom", animation: "pop", uppercase: true } },
  hologram: { label: "Hologram", category: "Neon & Tech", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.6, fontWeight: 700, textColor: "#a5f3fc", highlightColor: "#f0abfc", background: "", bgColor: "#000000", position: "middle", animation: "fade", uppercase: false } },
  laser: { label: "Laser", category: "Neon & Tech", style: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 1.9, fontWeight: 700, textColor: "#ef4444", highlightColor: "#22d3ee", background: "", bgColor: "#000000", position: "bottom", animation: "pop", uppercase: true } },
  circuit: { label: "Circuit", category: "Neon & Tech", style: { fontFamily: "'Space Mono',monospace", fontSize: 1.2, fontWeight: 700, textColor: "#4ade80", highlightColor: "#22d3ee", background: "solid", bgColor: "#052e16", position: "bottom", animation: "none", uppercase: false } },
  pixelGlow: { label: "Pixel Glow", category: "Neon & Tech", style: { fontFamily: "'Press Start 2P',monospace", fontSize: 0.8, fontWeight: 400, textColor: "#38bdf8", highlightColor: "#f472b6", background: "solid", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  voltage: { label: "Voltage", category: "Neon & Tech", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.7, fontWeight: 800, textColor: "#fde047", highlightColor: "#22d3ee", background: "", bgColor: "#000000", position: "bottom", animation: "pop", uppercase: true } },
  plasma: { label: "Plasma", category: "Neon & Tech", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.6, fontWeight: 700, textColor: "#c084fc", highlightColor: "#f472b6", background: "", bgColor: "#000000", position: "middle", animation: "pop", uppercase: false } },
  byteWave: { label: "Byte Wave", category: "Neon & Tech", style: { fontFamily: "'Space Mono',monospace", fontSize: 1.15, fontWeight: 700, textColor: "#22d3ee", highlightColor: "#4ade80", background: "solid", bgColor: "#000000", position: "bottom", animation: "none", uppercase: true } },

  inkSplash: { label: "Ink Splash", category: "Creative", style: { fontFamily: "'Permanent Marker',cursive", fontSize: 1.7, fontWeight: 400, textColor: "#1e293b", highlightColor: "#dc2626", background: "", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  wanderlust: { label: "Wanderlust", category: "Creative", style: { fontFamily: "'Poppins',sans-serif", fontSize: 1.4, fontWeight: 600, textColor: "#ffffff", highlightColor: "#2dd4bf", background: "pill", bgColor: "#164e63", position: "bottom", animation: "fade", uppercase: false } },
  storyteller: { label: "Storyteller", category: "Creative", style: { fontFamily: "'Caveat',cursive", fontSize: 2, fontWeight: 700, textColor: "#451a03", highlightColor: "#b45309", background: "", bgColor: "#000000", position: "bottom", animation: "fade", uppercase: false } },
  mosaic: { label: "Mosaic", category: "Creative", style: { fontFamily: "'Montserrat',sans-serif", fontSize: 1.5, fontWeight: 700, textColor: "#ffffff", highlightColor: "#f472b6", background: "solid", bgColor: "#7c3aed", position: "bottom", animation: "slide", uppercase: false } },
  origami: { label: "Origami", category: "Creative", style: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 1.3, fontWeight: 600, textColor: "#f8fafc", highlightColor: "#94a3b8", background: "pill", bgColor: "#0f172a", position: "top", animation: "fade", uppercase: false } },
  sketch: { label: "Sketch", category: "Creative", style: { fontFamily: "'Caveat',cursive", fontSize: 1.8, fontWeight: 700, textColor: "#27272a", highlightColor: "#a1a1aa", background: "", bgColor: "#000000", position: "bottom", animation: "none", uppercase: false } },
  folklore: { label: "Folklore", category: "Creative", style: { fontFamily: "'Playfair Display',serif", fontSize: 1.3, fontWeight: 500, textColor: "#fef3c7", highlightColor: "#92400e", background: "", bgColor: "#000000", position: "top", animation: "fade", uppercase: false } },

  broadcast: { label: "Broadcast", category: "News & Podcast", style: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 1.8, fontWeight: 700, textColor: "#ffffff", highlightColor: "#38bdf8", background: "solid", bgColor: "#1e3a8a", position: "bottom", animation: "slide", uppercase: true } },
  anchor: { label: "Anchor", category: "News & Podcast", style: { fontFamily: "'Inter',sans-serif", fontSize: 1.2, fontWeight: 600, textColor: "#ffffff", highlightColor: "#94a3b8", background: "solid", bgColor: "#0f172a", position: "bottom", animation: "fade", uppercase: false } },
  bulletin: { label: "Bulletin", category: "News & Podcast", style: { fontFamily: "'Montserrat',sans-serif", fontSize: 1.5, fontWeight: 700, textColor: "#ffffff", highlightColor: "#fde047", background: "solid", bgColor: "#b91c1c", position: "bottom", animation: "slide", uppercase: true } },
  headline: { label: "Headline", category: "News & Podcast", style: { fontFamily: "'Anton',sans-serif", fontSize: 1.9, fontWeight: 800, textColor: "#ffffff", highlightColor: "#facc15", background: "solid", bgColor: "#000000", position: "bottom", animation: "none", uppercase: true } },
  studioMic: { label: "Studio Mic", category: "News & Podcast", style: { fontFamily: "'Inter',sans-serif", fontSize: 1.2, fontWeight: 500, textColor: "#f8fafc", highlightColor: "#38bdf8", background: "solid", bgColor: "#1e293b", position: "bottom", animation: "fade", uppercase: false } },
  primetime: { label: "Primetime", category: "News & Podcast", style: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 1.8, fontWeight: 700, textColor: "#fde047", highlightColor: "#ef4444", background: "solid", bgColor: "#000000", position: "bottom", animation: "slide", uppercase: true } },
};

type LangId = "auto" | "en" | "hi" | "ml" | "ta" | "te" | "kn" | "mr" | "gu" | "bn" | "pa";
const LANGUAGES: { id: LangId; label: string; native?: string; roman?: string }[] = [
  { id: "auto", label: "Auto Detect" },
  { id: "en", label: "English" },
  { id: "hi", label: "Hindi", native: "हिंदी", roman: "Hinglish" },
  { id: "ml", label: "Malayalam", native: "മലയാളം", roman: "Manglish" },
  { id: "ta", label: "Tamil", native: "தமிழ்", roman: "Tanglish" },
  { id: "te", label: "Telugu", native: "తెలుగు", roman: "Tenglish" },
  { id: "kn", label: "Kannada", native: "ಕನ್ನಡ", roman: "Kanglish" },
  { id: "mr", label: "Marathi", native: "मराठी", roman: "Minglish" },
  { id: "gu", label: "Gujarati", native: "ગુજરાતી", roman: "Gunglish" },
  { id: "bn", label: "Bengali", native: "বাংলা", roman: "Benglish" },
  { id: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", roman: "Punglish" },
];
function langHasRoman(id: LangId) { return LANGUAGES.find(l => l.id === id)?.roman != null; }

function toSRT(segs: Segment[]) {
  const stamp = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60), ms = Math.floor((s - Math.floor(s)) * 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
  };
  return segs.map((s, i) => `${i + 1}\n${stamp(s.start)} --> ${stamp(s.end)}\n${s.text}\n`).join("\n");
}
function downloadText(name: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Preset music — paste your own hosted royalty-free MP3 URLs.
const MUSIC: Music[] = [
  { key: "none", label: "No music", url: "" },
  { key: "upbeat", label: "Upbeat", url: "" },
  { key: "chill", label: "Chill", url: "" },
  { key: "cinematic", label: "Cinematic", url: "" },
  { key: "lofi", label: "Lo-fi", url: "" },
];

const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
const uid = () => Math.random().toString(36).slice(2, 9);

let savedStudioState: any = null;
// Set by the Drafts tab's "Continue editing" action, picked up by VideoEditor
// on its next mount to jump straight into that saved project.
let pendingProjectToOpen: { id: string; name: string; video_url: string; data: any } | null = null;

function buildSegments(words: Word[]): Segment[] {
  const out: Segment[] = []; let cur: Word[] = [];
  const flush = () => { if (!cur.length) return; out.push({ id: out.length, start: cur[0].start, end: cur[cur.length - 1].end, text: cur.map(w => w.text).join(" ") }); cur = []; };
  for (let i = 0; i < words.length; i++) { cur.push(words[i]); const next = words[i + 1]; const gap = next ? next.start - words[i].end : 99; if (gap > 0.6 || cur.length >= 8) flush(); }
  flush(); return out;
}
function reindex(segs: Segment[]): Segment[] { return segs.map((s, i) => ({ ...s, id: i })); }

// ============================================================================
// Studio shell — matches Lovable's studio.tsx tab structure exactly.
// ============================================================================

const TABS = ["Ideas", "Scripts", "Video", "Drafts", "Calendar"] as const;
type Tab = (typeof TABS)[number];

const studioCache: { tab: Tab; planner: "week" | "month" } = { tab: "Video", planner: "week" };

const IDEAS = [
  "AI side hustle that pays $50/day",
  "3 hooks that always go viral",
  "Behind the scenes of my edit setup",
  "Why nobody is watching your Shorts",
];

const SCRIPTS_CARDS = [
  { title: "ChatGPT weekly content system", platform: "Reels", updated: "2d ago" },
  { title: "5 underrated AI tools in 2026", platform: "YT Shorts", updated: "4d ago" },
  { title: "How I edit a Reel in 9 minutes", platform: "Reels", updated: "1w ago" },
];

export default function StudioPage() {
  const { theme } = useTheme();
  // Always land on the Video tab when Studio opens (per product spec) —
  // studioCache.tab is still updated on every switch, but not read for the
  // initial mount, so navigating away and back always resets to Video.
  const [tab, setTabState] = useState<Tab>("Video");
  const setTab = (t: Tab) => { studioCache.tab = t; setTabState(t); };
  const isVideo = tab === "Video";

  return (
    <div className={`theme-redesign ${theme} min-h-screen bg-background text-foreground`}>
      <SEO title="Studio — SocialRum" noindex />
      <div className="max-w-[1600px] mx-auto p-6">
        {!isVideo && (
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold">Studio</h1>
            <p className="text-sm text-muted-foreground mt-1">Your ideas, scripts, drafts and content calendar — one workspace.</p>
          </div>
        )}

        <div className={`flex flex-wrap gap-2 border-b border-border ${isVideo ? "mb-3" : "mb-6"}`}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Ideas" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {IDEAS.map((i) => (
              <StudioCard key={i} icon={Lightbulb} title={i} subtitle="Saved idea" />
            ))}
          </div>
        )}

        {tab === "Scripts" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SCRIPTS_CARDS.map((s) => (
              <StudioCard key={s.title} icon={FileText} title={s.title} subtitle={`${s.platform} · ${s.updated}`} />
            ))}
          </div>
        )}

        {tab === "Video" && <VideoEditor />}

        {tab === "Drafts" && (() => {
          const savedProjects: { id: string; name: string; video_url: string; data: any; updated_at: string }[] =
            savedStudioState?.projects ?? [];
          return (
            <div className="space-y-3">
              {savedProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved projects yet — start editing a video in the Video tab and it'll show up here.</p>
              ) : (
                savedProjects.map((p) => (
                  <div key={p.id} className="panel p-5 flex flex-wrap items-center gap-4">
                    <div className="w-16 shrink-0 rounded-lg overflow-hidden bg-muted" style={{ aspectRatio: "9/16" }}>
                      <video src={p.video_url} muted preload="metadata" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Saved {new Date(p.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <button
                      onClick={() => { pendingProjectToOpen = p; setTab("Video"); }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border border-input hover:bg-muted"
                    >
                      <Pencil className="size-3" /> Continue editing
                    </button>
                  </div>
                ))
              )}
            </div>
          );
        })()}

        {tab === "Calendar" && <CalendarTab />}
      </div>
    </div>
  );
}

function StudioCard({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }) {
  return (
    <div className="panel p-5 flex flex-col hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="size-9 grid place-items-center rounded-lg text-white shadow-sm" style={{ background: GRAD }}>
          <Icon className="size-4" />
        </div>
        <StudioActions compact />
      </div>
      <div className="mt-4 font-heading font-semibold leading-snug">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
    </div>
  );
}

function StudioActions({ compact }: { compact?: boolean }) {
  const cls = `inline-flex items-center gap-1 ${compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs"} rounded-md border border-input hover:bg-muted`;
  return (
    <div className="flex gap-1.5">
      <button className={cls}><Pencil className="size-3" /> Edit</button>
      <button className={cls}><Copy className="size-3" /> Duplicate</button>
      <button className={`${cls} hover:text-destructive`}><Trash2 className="size-3" /> Delete</button>
    </div>
  );
}

// ============================================================================
// Calendar tab — ported from Lovable's studio.tsx (real dates, localStorage,
// drag-to-reschedule, recurrence, linking to an idea/script). Self-contained,
// no backend needed.
// ============================================================================

type Recurrence = "none" | "daily" | "weekly" | "monthly";
type LinkKind = "none" | "idea" | "script";
type CalEvent = {
  id: string;
  date: string;
  time: string;
  duration?: number;
  title: string;
  note?: string;
  recurrence?: Recurrence;
  recurrenceEnd?: string;
  linkKind?: LinkKind;
  linkValue?: string;
};

const CAL_STORAGE_KEY = "socialrum.calendar.events.v2";
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function toISO(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseISO(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function startOfWeek(d: Date) { const x = new Date(d); x.setDate(d.getDate() - d.getDay()); x.setHours(0, 0, 0, 0); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(d.getDate() + n); return x; }
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function diffDays(from: Date, to: Date) { return Math.round((parseISO(toISO(to)).getTime() - parseISO(toISO(from)).getTime()) / 86400000); }

function occursOn(e: CalEvent, target: Date): boolean {
  const base = parseISO(e.date);
  if (sameDay(base, target)) return true;
  if (!e.recurrence || e.recurrence === "none") return false;
  if (target < base) return false;
  if (e.recurrenceEnd && target > parseISO(e.recurrenceEnd)) return false;
  if (e.recurrence === "daily") return true;
  if (e.recurrence === "weekly") return base.getDay() === target.getDay();
  if (e.recurrence === "monthly") return base.getDate() === target.getDate();
  return false;
}
function eventsOn(events: CalEvent[], target: Date) {
  return events.filter((e) => occursOn(e, target)).sort((a, b) => a.time.localeCompare(b.time));
}

function useEvents() {
  const [events, setEvents] = useState<CalEvent[]>(() => {
    if (typeof window === "undefined") return [];
    try { const raw = localStorage.getItem(CAL_STORAGE_KEY); return raw ? (JSON.parse(raw) as CalEvent[]) : []; } catch { return []; }
  });
  const persist = (next: CalEvent[]) => {
    setEvents(next);
    try { localStorage.setItem(CAL_STORAGE_KEY, JSON.stringify(next)); } catch {}
  };
  return {
    events,
    upsert: (e: CalEvent) => {
      const exists = events.some((x) => x.id === e.id);
      persist(exists ? events.map((x) => (x.id === e.id ? e : x)) : [...events, e]);
    },
    remove: (id: string) => persist(events.filter((x) => x.id !== id)),
    move: (id: string, newDate: string) => {
      const target = events.find((x) => x.id === id);
      if (!target) return;
      const delta = diffDays(parseISO(target.date), parseISO(newDate));
      if (delta === 0) return;
      const updated: CalEvent = { ...target, date: newDate };
      if (target.recurrenceEnd) updated.recurrenceEnd = toISO(addDays(parseISO(target.recurrenceEnd), delta));
      persist(events.map((x) => (x.id === id ? updated : x)));
    },
  };
}

function CalendarTab() {
  const [planner, setPlannerState] = useState<"week" | "month">(studioCache.planner);
  const setPlanner = (p: "week" | "month") => { studioCache.planner = p; setPlannerState(p); };
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="size-4 text-primary" />
        <div className="inline-flex p-1 rounded-lg bg-muted">
          <button onClick={() => setPlanner("week")} className={`px-3 py-1.5 text-xs rounded-md ${planner === "week" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Weekly</button>
          <button onClick={() => setPlanner("month")} className={`px-3 py-1.5 text-xs rounded-md ${planner === "month" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Monthly</button>
        </div>
      </div>
      {planner === "week" ? <WeekPlanner /> : <MonthPlanner />}
    </div>
  );
}

function EventDialog({ open, onClose, onSave, onDelete, initial, date }: {
  open: boolean; onClose: () => void; onSave: (e: CalEvent) => void; onDelete?: (id: string) => void; initial?: CalEvent; date: string;
}) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState<number>(30);
  const [note, setNote] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [recurrenceEnd, setRecurrenceEnd] = useState<string>("");
  const [linkKind, setLinkKind] = useState<LinkKind>("none");
  const [linkValue, setLinkValue] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? ""); setTime(initial?.time ?? "09:00"); setDuration(initial?.duration ?? 30);
    setNote(initial?.note ?? ""); setRecurrence(initial?.recurrence ?? "none"); setRecurrenceEnd(initial?.recurrenceEnd ?? "");
    setLinkKind(initial?.linkKind ?? "none"); setLinkValue(initial?.linkValue ?? "");
  }, [open, initial]);

  if (!open) return null;
  const linkOptions = linkKind === "idea" ? IDEAS : linkKind === "script" ? SCRIPTS_CARDS.map((s) => s.title) : [];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="panel p-6 w-full max-w-lg bg-card max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-muted-foreground">{parseISO(date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
            <div className="font-heading text-lg font-semibold mt-0.5">{initial ? "Edit event" : "New event"}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Reel — AI tools"
              className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Duration (min)</label>
              <input type="number" min={5} step={5} value={duration} onChange={(e) => setDuration(Math.max(5, Number(e.target.value) || 30))}
                className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Repeat className="size-3" /> Repeat</label>
            <div className="mt-1 grid grid-cols-4 gap-1.5">
              {(["none", "daily", "weekly", "monthly"] as Recurrence[]).map((r) => (
                <button key={r} type="button" onClick={() => setRecurrence(r)}
                  className={`h-9 rounded-md text-xs border capitalize ${recurrence === r ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}>{r}</button>
              ))}
            </div>
            {recurrence !== "none" && (
              <div className="mt-2">
                <label className="text-xs text-muted-foreground">Ends on (optional)</label>
                <input type="date" value={recurrenceEnd} min={date} onChange={(e) => setRecurrenceEnd(e.target.value)}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Link2 className="size-3" /> Link to</label>
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              {(["none", "idea", "script"] as LinkKind[]).map((k) => (
                <button key={k} type="button" onClick={() => { setLinkKind(k); setLinkValue(""); }}
                  className={`h-9 rounded-md text-xs border capitalize ${linkKind === k ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}>
                  {k === "none" ? "None" : k}
                </button>
              ))}
            </div>
            {linkKind !== "none" && (
              <select value={linkValue} onChange={(e) => setLinkValue(e.target.value)} className="mt-2 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="">Choose a {linkKind}…</option>
                {linkOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
              </select>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Notes</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex justify-between items-center mt-5">
          <div>
            {initial && onDelete && (
              <button onClick={() => { onDelete(initial.id); onClose(); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border border-input hover:text-destructive">
                <Trash2 className="size-3" /> Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-md border border-input hover:bg-muted">Cancel</button>
            <button
              disabled={!title.trim()}
              onClick={() => {
                onSave({
                  id: initial?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  date: initial?.date ?? date, time, duration, title: title.trim(),
                  note: note.trim() || undefined, recurrence,
                  recurrenceEnd: recurrence !== "none" && recurrenceEnd ? recurrenceEnd : undefined,
                  linkKind: linkKind !== "none" ? linkKind : undefined,
                  linkValue: linkKind !== "none" && linkValue ? linkValue : undefined,
                });
                onClose();
              }}
              className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            >
              {initial ? "Save changes" : "Add event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventPill({ e, onClick, onDragStart, compact }: { e: CalEvent; onClick: (ev: React.MouseEvent) => void; onDragStart: (ev: React.DragEvent) => void; compact?: boolean }) {
  const recurring = e.recurrence && e.recurrence !== "none";
  if (compact) {
    return (
      <div draggable onDragStart={onDragStart} onClick={onClick}
        className="text-[10px] px-1 py-0.5 rounded bg-primary/15 text-primary truncate flex items-center gap-1 cursor-grab active:cursor-grabbing hover:bg-primary/25" title={e.title}>
        {recurring && <Repeat className="size-2.5 shrink-0" />}
        <span className="truncate">{e.time} {e.title}</span>
      </div>
    );
  }
  return (
    <div draggable onDragStart={onDragStart} onClick={onClick} className="w-full text-left p-2 rounded-md bg-primary/10 border border-primary/30 hover:bg-primary/20 cursor-grab active:cursor-grabbing">
      <div className="text-[11px] text-primary font-semibold flex items-center gap-1">
        {e.time}{e.duration ? ` · ${e.duration}m` : ""}
        {recurring && <Repeat className="size-3 opacity-70" />}
      </div>
      <div className="text-xs mt-0.5 truncate">{e.title}</div>
      {e.linkValue && <div className="text-[10px] text-muted-foreground truncate mt-0.5 flex items-center gap-1"><Link2 className="size-2.5" /> {e.linkValue}</div>}
    </div>
  );
}

function WeekPlanner() {
  const { events, upsert, remove, move } = useEvents();
  const [cursor, setCursor] = useState(() => startOfWeek(new Date()));
  const [editing, setEditing] = useState<{ date: string; event?: CalEvent } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));
  const rangeLabel = `${days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  const onDrop = (iso: string) => (ev: React.DragEvent) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text/event-id");
    if (id) move(id, iso);
    setDragOver(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(addDays(cursor, -7))} className="px-2.5 py-1.5 text-xs rounded-md border border-input hover:bg-muted">‹</button>
          <button onClick={() => setCursor(startOfWeek(new Date()))} className="px-2.5 py-1.5 text-xs rounded-md border border-input hover:bg-muted">Today</button>
          <button onClick={() => setCursor(addDays(cursor, 7))} className="px-2.5 py-1.5 text-xs rounded-md border border-input hover:bg-muted">›</button>
          <div className="ml-2 text-sm font-medium">{rangeLabel}</div>
        </div>
        <div className="text-[11px] text-muted-foreground">Tip: drag events between days to reschedule.</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {days.map((d) => {
          const iso = toISO(d);
          const dayEvents = eventsOn(events, d);
          const isToday = sameDay(d, today);
          const isDragOver = dragOver === iso;
          return (
            <div key={iso} onDragOver={(ev) => { ev.preventDefault(); setDragOver(iso); }} onDragLeave={() => setDragOver((cur) => (cur === iso ? null : cur))} onDrop={onDrop(iso)}
              className={`panel p-3 min-h-44 flex flex-col transition-colors ${isToday ? "ring-1 ring-primary" : ""} ${isDragOver ? "bg-primary/10 ring-2 ring-primary" : ""}`}>
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{DAY_NAMES[d.getDay()]}</div>
                  <div className={`text-lg font-heading font-semibold leading-none mt-0.5 ${isToday ? "text-primary" : ""}`}>{d.getDate()}</div>
                </div>
                <button onClick={() => setEditing({ date: iso })} className="size-6 grid place-items-center rounded-md hover:bg-muted text-muted-foreground" aria-label="Add event">+</button>
              </div>
              <div className="space-y-1.5 flex-1">
                {dayEvents.map((e) => (
                  <EventPill key={e.id} e={e} onClick={() => setEditing({ date: iso, event: e })} onDragStart={(ev) => ev.dataTransfer.setData("text/event-id", e.id)} />
                ))}
                {dayEvents.length === 0 && (
                  <button onClick={() => setEditing({ date: iso })} className="w-full text-[11px] text-muted-foreground/70 hover:text-foreground py-2 border border-dashed border-border rounded-md">+ Add</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <EventDialog open={!!editing} date={editing?.date ?? toISO(new Date())} initial={editing?.event} onClose={() => setEditing(null)} onSave={upsert} onDelete={remove} />
    </>
  );
}

function MonthPlanner() {
  const { events, upsert, remove, move } = useEvents();
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [editing, setEditing] = useState<{ date: string; event?: CalEvent } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const today = new Date();
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const onDrop = (iso: string) => (ev: React.DragEvent) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text/event-id");
    if (id) move(id, iso);
    setDragOver(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="px-2.5 py-1.5 text-xs rounded-md border border-input hover:bg-muted">‹</button>
          <button onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }} className="px-2.5 py-1.5 text-xs rounded-md border border-input hover:bg-muted">Today</button>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="px-2.5 py-1.5 text-xs rounded-md border border-input hover:bg-muted">›</button>
          <div className="ml-2 text-sm font-medium">{MONTH_NAMES[month]} {year}</div>
        </div>
        <div className="text-[11px] text-muted-foreground">Tip: drag events to a different day.</div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DAY_NAMES.map((d) => (<div key={d} className="text-center text-[10px] uppercase tracking-wider text-muted-foreground py-1">{d}</div>))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square" />;
          const iso = toISO(d);
          const dayEvents = eventsOn(events, d);
          const isToday = sameDay(d, today);
          const isDragOver = dragOver === iso;
          return (
            <div key={i} onDragOver={(ev) => { ev.preventDefault(); setDragOver(iso); }} onDragLeave={() => setDragOver((cur) => (cur === iso ? null : cur))} onDrop={onDrop(iso)}
              onClick={() => setEditing({ date: iso })}
              className={`min-h-20 text-left p-1.5 rounded-md border bg-card hover:border-primary/60 transition-colors cursor-pointer ${isToday ? "border-primary ring-1 ring-primary/30" : "border-border"} ${isDragOver ? "bg-primary/10 ring-2 ring-primary" : ""}`}>
              <div className={`text-xs font-medium ${isToday ? "text-primary" : ""}`}>{d.getDate()}</div>
              <div className="mt-1 space-y-0.5" onClick={(ev) => ev.stopPropagation()}>
                {dayEvents.slice(0, 2).map((e) => (
                  <EventPill key={e.id} e={e} compact onClick={(ev) => { ev.stopPropagation(); setEditing({ date: iso, event: e }); }} onDragStart={(ev) => ev.dataTransfer.setData("text/event-id", e.id)} />
                ))}
                {dayEvents.length > 2 && <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</div>}
              </div>
            </div>
          );
        })}
      </div>

      <EventDialog open={!!editing} date={editing?.date ?? toISO(new Date())} initial={editing?.event} onClose={() => setEditing(null)} onSave={upsert} onDelete={remove} />
    </>
  );
}

// ============================================================================
// Video tab — the real editor: upload, AssemblyAI transcribe, Pexels overlays,
// music sync, canvas export. Unchanged from the working implementation, just
// no longer renders its own page header (the shared tab bar above replaces it).
// ============================================================================

// Resolves a CSS custom property (e.g. "--primary", a raw "H S% L%" triplet
// per shadcn/Tailwind convention) to a real hsl() string — canvas fillStyle
// can't parse var() itself since it isn't resolved against any element.
function resolveCssHsl(varName: string, fallback = "#7c3aed") {
  if (typeof window === "undefined") return fallback;
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return v ? `hsl(${v})` : fallback;
  } catch { return fallback; }
}

function Waveform({ peaks, width, height = 40, color }: { peaks: number[]; width: number; height?: number; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    if (!peaks.length) return;
    ctx.fillStyle = color || resolveCssHsl("--primary");
    const barWidth = width / peaks.length;
    peaks.forEach((p, i) => {
      const barHeight = Math.max(2, p * height);
      const x = i * barWidth;
      const y = (height - barHeight) / 2;
      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    });
  }, [peaks, width, height, color]);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />;
}

function SearchReplace({ onReplace }: { onReplace: (find: string, repl: string) => void }) {
  const [find, setFind] = useState("");
  const [repl, setRepl] = useState("");
  return (
    <div className="flex gap-1">
      <input value={find} onChange={e => setFind(e.target.value)} placeholder="Find"
        className="flex-1 min-w-0 h-7 rounded-md bg-background border border-border px-2 text-[11px]" />
      <input value={repl} onChange={e => setRepl(e.target.value)} placeholder="Replace"
        className="flex-1 min-w-0 h-7 rounded-md bg-background border border-border px-2 text-[11px]" />
      <button onClick={() => onReplace(find, repl)} disabled={!find}
        className="h-7 px-2 rounded-md bg-muted text-[11px] hover:bg-accent disabled:opacity-50">Go</button>
    </div>
  );
}

function VideoEditor() {
  const [file, setFile] = useState<File | null>(() => savedStudioState?.file ?? null);
  const [videoUrl, setVideoUrl] = useState(() => savedStudioState?.videoUrl ?? "");
  const [hostedUrl, setHostedUrl] = useState(() => savedStudioState?.hostedUrl ?? "");
  const [duration, setDuration] = useState(() => savedStudioState?.duration ?? 0);
  const [time, setTime] = useState(() => savedStudioState?.time ?? 0);
  const [segments, setSegmentsRaw] = useState<Segment[]>(() => savedStudioState?.segments ?? []);
  const [status, setStatus] = useState<"idle" | "uploading" | "transcribing" | "ready">(() => savedStudioState?.status ?? "idle");
  const [error, setError] = useState(() => savedStudioState?.error ?? "");

  // ── Caption style (templates) + language/romanization — matches Lovable's
  // "Social Spark Studio" caption editor exactly. ──
  const [template, setTemplateState] = useState<TemplateId>(() => savedStudioState?.template ?? "minimal");
  const [style, setStyle] = useState<CaptionStyle>(() => savedStudioState?.style ?? TEMPLATES.minimal.style);
  const [wordHighlight, setWordHighlight] = useState<boolean>(() => savedStudioState?.wordHighlight ?? true);
  const [offset, setOffset] = useState<number>(() => savedStudioState?.offset ?? 0);
  const [language, setLanguageState] = useState<LangId>(() => savedStudioState?.language ?? "auto");
  const [useRoman, setUseRomanState] = useState<boolean>(() => savedStudioState?.useRoman ?? false);
  const [detectedLang, setDetectedLang] = useState<LangId | null>(() => savedStudioState?.detectedLang ?? null);
  const [nativeSegs, setNativeSegs] = useState<Segment[]>(() => savedStudioState?.nativeSegs ?? []);
  const [romanSegs, setRomanSegs] = useState<Segment[]>(() => savedStudioState?.romanSegs ?? []);
  const [romanizing, setRomanizing] = useState(false);
  const [history, setHistory] = useState<Segment[][]>(() => savedStudioState?.history ?? []);
  const [redoStack, setRedoStack] = useState<Segment[][]>([]);

  // ── Caption Designer panel — tabbed reorganization of the style controls,
  // matching the redesigned Video tab layout. ──
  const [designerTab, setDesignerTab] = useState<"templates" | "font" | "colors" | "position" | "animation" | "music" | "overlay">("templates");
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory | "all">("all");

  // ── Waveform — decoded once per video via Web Audio API. Best-effort: some
  // containers/codecs can't be demuxed by decodeAudioData, in which case this
  // just quietly leaves the waveform empty instead of blocking the editor. ──
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [waveformLoading, setWaveformLoading] = useState(false);

  // ── Filmstrip — real frame thumbnails for the timeline's Video track. ──
  const [filmstrip, setFilmstrip] = useState<string[]>([]);
  const [filmstripLoading, setFilmstripLoading] = useState(false);
  const thumbVideoRef = useRef<HTMLVideoElement>(null);

  // ── Timeline interactivity — zoom, hover-scrub preview, draggable playhead. ──
  const [zoom, setZoom] = useState(1);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [scrubbingPlayhead, setScrubbingPlayhead] = useState(false);

  // Keep the active cache (native or roman) in sync with user edits, same
  // pattern as Lovable's editor — every existing setSegments(...) call site
  // below keeps working unchanged.
  const setSegments = (updater: Segment[] | ((prev: Segment[]) => Segment[])) => {
    setSegmentsRaw(prev => {
      const next = typeof updater === "function" ? (updater as (p: Segment[]) => Segment[])(prev) : updater;
      if (useRoman) setRomanSegs(next); else setNativeSegs(next);
      return next;
    });
  };

  const patchStyle = (p: Partial<CaptionStyle>) => setStyle(s => ({ ...s, ...p }));
  const setTemplate = (id: TemplateId) => { setTemplateState(id); setStyle(TEMPLATES[id].style); };

  const effectiveLang: LangId = language !== "auto" ? language : (detectedLang ?? "auto");
  const canRomanize = langHasRoman(effectiveLang);

  const setLanguage = (v: LangId) => {
    setLanguageState(v);
    if (!langHasRoman(v) && !langHasRoman(detectedLang ?? "auto")) setUseRomanState(false);
  };

  const setUseRoman = async (v: boolean) => {
    if (!canRomanize) return;
    setUseRomanState(v);
    if (v) {
      if (romanSegs.length) { setSegmentsRaw(romanSegs); return; }
      if (nativeSegs.length) {
        setRomanizing(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch(`${API}/api/captioner/romanize`, {
            method: "POST",
            headers: { "content-type": "application/json", ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
            body: JSON.stringify({ language: effectiveLang, segments: nativeSegs }),
          });
          const j = await res.json();
          if (!res.ok) throw new Error(j.error || "Romanization failed");
          const romanized: Segment[] = j.segments ?? [];
          setRomanSegs(romanized);
          setSegmentsRaw(romanized);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Romanization failed");
          setUseRomanState(false);
        } finally {
          setRomanizing(false);
        }
      }
    } else if (nativeSegs.length) {
      setSegmentsRaw(nativeSegs);
    }
  };

  const exportSrt = () => {
    if (!segments.length) return;
    downloadText(`${(file?.name || "captions").replace(/\.[^.]+$/, "")}.srt`, toSRT(segments));
  };

  // overlays
  const [overlays, setOverlays] = useState<Overlay[]>(() => savedStudioState?.overlays ?? []);
  const [selOverlay, setSelOverlay] = useState<string | null>(() => savedStudioState?.selOverlay ?? null);
  const [dragOverlay, setDragOverlay] = useState<{ id: string; dx: number } | null>(null);

  // pexels
  const [showPex, setShowPex] = useState(() => savedStudioState?.showPex ?? false);
  const [pexTab, setPexTab] = useState<"pexels" | "upload">(() => savedStudioState?.pexTab ?? "pexels");
  const [pexQ, setPexQ] = useState(() => savedStudioState?.pexQ ?? "");
  const [pexType, setPexType] = useState<"photo" | "video">(() => savedStudioState?.pexType ?? "photo");
  const [pexItems, setPexItems] = useState<PexItem[]>(() => savedStudioState?.pexItems ?? []);
  const [pexLoading, setPexLoading] = useState(() => savedStudioState?.pexLoading ?? false);
  const [uploadingOverlay, setUploadingOverlay] = useState(() => savedStudioState?.uploadingOverlay ?? false);

  // music
  const [music, setMusic] = useState<Music>(() => savedStudioState?.music ?? MUSIC[0]);
  const [musicStart, setMusicStart] = useState(() => savedStudioState?.musicStart ?? 0);
  const [songTrim, setSongTrim] = useState(() => savedStudioState?.songTrim ?? 0);
  const [volume, setVolume] = useState(() => savedStudioState?.volume ?? 0.25);
  const [fadeIn, setFadeIn] = useState(() => savedStudioState?.fadeIn ?? true);
  const [fadeOut, setFadeOut] = useState(() => savedStudioState?.fadeOut ?? true);
  const [muteOriginal, setMuteOriginal] = useState(() => savedStudioState?.muteOriginal ?? false);
  const [originalVolume, setOriginalVolume] = useState(() => savedStudioState?.originalVolume ?? 1);
  const [uploadingMusic, setUploadingMusic] = useState(() => savedStudioState?.uploadingMusic ?? false);
  const [uploadedMusic, setUploadedMusic] = useState<Music[]>(() => savedStudioState?.uploadedMusic ?? []);
  const [dragMusic, setDragMusic] = useState(false);
  const [dragPip, setDragPip] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [dragCaption, setDragCaption] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // Video clips — the video track as a list of (start,end) ranges into the
  // *original* uploaded file. Starts as one clip spanning the whole video;
  // cutting splits a clip in two, deleting removes one (ripple), merging
  // rejoins two array-adjacent clips whose ranges are still contiguous.
  // Timeline positions stay anchored to source time (gaps show as dimmed,
  // rather than compacting everything else) — much simpler than remapping
  // captions/music/overlays into a second "edited timeline" coordinate space.
  const [videoClips, setVideoClips] = useState<VideoClip[]>(() => savedStudioState?.videoClips ?? []);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [dragTrim, setDragTrim] = useState<{ clipId: string; edge: "start" | "end" } | null>(null);
  // Music trim — musicEnd 0 means "play until the video/last clip ends".
  const [musicEnd, setMusicEnd] = useState(() => savedStudioState?.musicEnd ?? 0);
  const [dragMusicEnd, setDragMusicEnd] = useState(false);
  const [musicSelected, setMusicSelected] = useState(false);
  const [selectedCaptionId, setSelectedCaptionId] = useState<number | null>(null);

  function selectClip(id: string) { setSelectedClipId(id); setMusicSelected(false); setSelectedCaptionId(null); }
  function selectMusicTrack() { setMusicSelected(true); setSelectedClipId(null); setSelectedCaptionId(null); }
  function selectCaptionChip(id: number) { setSelectedCaptionId(id); setSelectedClipId(null); setMusicSelected(false); }

  // save
  const [savedAt, setSavedAt] = useState(() => savedStudioState?.savedAt ?? "");
  const [projectId, setProjectId] = useState<string | null>(() => savedStudioState?.projectId ?? null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(() => savedStudioState?.saveError ?? "");

  // projects panel
  const [showProjects, setShowProjects] = useState(() => savedStudioState?.showProjects ?? false);
  const [projects, setProjects] = useState<{ id: string; name: string; video_url: string; data: any; updated_at: string }[]>(() => savedStudioState?.projects ?? []);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const _stateRef = useRef<any>();
  _stateRef.current = {
    file, videoUrl, hostedUrl, duration, time, segments, status, error,
    template, style, wordHighlight, offset, language, useRoman, detectedLang, nativeSegs, romanSegs, history,
    overlays, selOverlay,
    showPex, pexTab, pexQ, pexType, pexItems, pexLoading, uploadingOverlay,
    music, musicStart, songTrim, volume, fadeIn, fadeOut, muteOriginal, originalVolume, uploadingMusic, uploadedMusic,
    videoClips, musicEnd,
    savedAt, projectId, saveError,
    showProjects, projects
  };

  useEffect(() => {
    if (videoRef.current && _stateRef.current.time > 0) {
      videoRef.current.currentTime = _stateRef.current.time;
    }
    return () => {
      savedStudioState = _stateRef.current;
    };
  }, []);

  // Picked from the Drafts tab's "Continue editing" action.
  useEffect(() => {
    if (pendingProjectToOpen) {
      loadProject(pendingProjectToOpen);
      pendingProjectToOpen = null;
    }
  }, []);

  // export
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportPreviewUrl, setExportPreviewUrl] = useState<string | null>(null);
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const exportCancelRef = useRef(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playheadRafRef = useRef<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const tracksRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const caretRef = useRef<{ id: number; pos: number } | null>(null);

  const hasVideo = !!videoUrl;
  const hasCaptions = segments.length > 0;
  const hasMusic = music.key !== "none";
  const pxPerSec = PX_PER_SEC * zoom;
  const trackWidth = Math.max(duration * pxPerSec, 400);

  useEffect(() => {
    const url = hostedUrl || videoUrl;
    if (!url || !duration) { setWaveformPeaks([]); return; }
    let cancelled = false;
    setWaveformLoading(true);
    (async () => {
      try {
        const res = await fetch(url);
        const arrayBuf = await res.arrayBuffer();
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const audioBuffer = await ctx.decodeAudioData(arrayBuf);
        const channel = audioBuffer.getChannelData(0);
        const numBars = Math.max(1, Math.floor(trackWidth / 3));
        const samplesPerBar = Math.max(1, Math.floor(channel.length / numBars));
        const bars: number[] = [];
        for (let i = 0; i < channel.length; i += samplesPerBar) {
          let max = 0;
          for (let j = i; j < Math.min(i + samplesPerBar, channel.length); j++) {
            const v = Math.abs(channel[j]);
            if (v > max) max = v;
          }
          bars.push(max);
        }
        const peak = Math.max(...bars, 0.01);
        if (!cancelled) setWaveformPeaks(bars.map(b => b / peak));
        void ctx.close();
      } catch {
        if (!cancelled) setWaveformPeaks([]);
      } finally {
        if (!cancelled) setWaveformLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostedUrl, videoUrl, duration]);

  // ── Filmstrip — the timeline's Video track shows real frame thumbnails
  // instead of a solid block, extracted by seeking a hidden <video> and
  // drawing each frame to a canvas. Best-effort like the waveform: a hosted
  // URL without permissive CORS headers taints the canvas and this just
  // silently falls back to no filmstrip rather than breaking the editor. ──
  useEffect(() => {
    const url = videoUrl || hostedUrl;
    const tv = thumbVideoRef.current;
    if (!url || !duration || !tv) { setFilmstrip([]); return; }
    let cancelled = false;
    setFilmstripLoading(true);
    setFilmstrip([]);

    const numTiles = Math.max(4, Math.min(60, Math.ceil(trackWidth / FILMSTRIP_TILE_W)));
    const canvas = document.createElement("canvas");
    canvas.width = FILMSTRIP_TILE_W * 2;
    canvas.height = 80;
    const ctx = canvas.getContext("2d");

    // Waits for a seek to actually land. Two real-world gotchas this guards
    // against: (1) some browsers never fire `seeked` for a no-op seek (e.g.
    // seeking to 0 when currentTime is already 0 — exactly what tile #0
    // does), which used to hang the entire extraction forever; (2) some
    // codecs occasionally just never fire it at all, so there's a timeout
    // fallback rather than trusting the event alone.
    function waitSeek(target: number): Promise<void> {
      if (Math.abs(tv!.currentTime - target) < 0.02) return Promise.resolve();
      return new Promise<void>((resolve) => {
        let done = false;
        const finish = () => { if (done) return; done = true; tv!.removeEventListener("seeked", onSeeked); resolve(); };
        const onSeeked = () => finish();
        tv!.addEventListener("seeked", onSeeked, { once: true });
        tv!.currentTime = target;
        setTimeout(finish, 1500);
      });
    }

    (async () => {
      try {
        tv.crossOrigin = "anonymous";
        tv.src = url;
        await new Promise<void>((resolve, reject) => {
          const onLoaded = () => { tv.removeEventListener("loadedmetadata", onLoaded); resolve(); };
          const onError = () => { reject(new Error("thumb video failed to load")); };
          tv.addEventListener("loadedmetadata", onLoaded, { once: true });
          tv.addEventListener("error", onError, { once: true });
          setTimeout(onLoaded, 4000); // don't hang forever if metadata never arrives
        });

        const frames: string[] = [];
        for (let i = 0; i < numTiles; i++) {
          if (cancelled) return;
          const t = Math.max(0, Math.min(duration - 0.05, (i / numTiles) * duration));
          await waitSeek(t);
          if (cancelled) return;
          if (ctx) {
            const vw = tv.videoWidth || canvas.width, vh = tv.videoHeight || canvas.height;
            const scale = Math.max(canvas.width / vw, canvas.height / vh);
            const dw = vw * scale, dh = vh * scale;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tv, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
            frames.push(canvas.toDataURL("image/jpeg", 0.55));
          }
        }
        if (!cancelled) setFilmstrip(frames);
      } catch (err) {
        console.error("[filmstrip] extraction failed:", err);
        if (!cancelled) setFilmstrip([]);
      } finally {
        if (!cancelled) setFilmstripLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, hostedUrl, duration]);

  const capTime = time + offset;
  const activeId = useMemo(() => { const seg = segments.find(s => capTime >= s.start && capTime < s.end); return seg ? seg.id : null; }, [segments, capTime]);
  const activeSeg = activeId != null ? segments.find(s => s.id === activeId) : null;
  const activeText = activeSeg?.text || "";
  // Falls back to a sample line when nothing is currently playing (paused,
  // or between segments) so the position handle is always there to grab —
  // otherwise it only existed while a caption happened to be on screen.
  const previewCaptionText = activeText || segments[0]?.text || "Sample caption text";
  const effectiveCapPos = { x: style.capX ?? presetCapPos(style.position).x, y: style.capY ?? presetCapPos(style.position).y };

  function renderActiveCaption() {
    if (!activeSeg) return null;
    const rawWords = activeSeg.text.split(/\s+/);
    const words = style.uppercase ? rawWords.map(w => w.toUpperCase()) : rawWords;
    if (!wordHighlight || words.length < 2) {
      return <span>{style.uppercase ? activeSeg.text.toUpperCase() : activeSeg.text}</span>;
    }
    const dur = Math.max(0.001, activeSeg.end - activeSeg.start);
    const progress = (capTime - activeSeg.start) / dur;
    const hi = Math.min(words.length - 1, Math.max(0, Math.floor(progress * words.length)));
    return (
      <>
        {words.map((w, i) => (
          <span key={i} style={i === hi ? { color: style.highlightColor } : undefined}>
            {w}{i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </>
    );
  }
  const activeOverlays = useMemo(() => overlays.filter(o => time >= o.start && time < o.start + o.length), [overlays, time]);
  const activeHalfOverlay = useMemo(() => activeOverlays.find(o => o.mode === "half") || null, [activeOverlays]);

  useEffect(() => { if (activeId != null) rowRefs.current[activeId]?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [activeId]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume, music]);
  useEffect(() => { if (videoRef.current) videoRef.current.muted = muteOriginal; }, [muteOriginal]);
  useEffect(() => { if (videoRef.current && !muteOriginal) videoRef.current.volume = originalVolume; }, [originalVolume, muteOriginal]);
  useEffect(() => { fetchProjects(); }, []);
  // Seed a single clip spanning the whole video once its duration is known
  // (fresh upload, or an older saved project with no videoClips yet).
  useEffect(() => {
    if (duration > 0 && videoClips.length === 0) setVideoClips([{ id: uid(), start: 0, end: duration }]);
  }, [duration]); // eslint-disable-line react-hooks/exhaustive-deps -- init-once guard reads videoClips.length, not a dep

  // Keep a ref to saveProject so unmount cleanup always has the latest closure
  const saveProjectRef = useRef(saveProject);
  useEffect(() => { saveProjectRef.current = saveProject; });

  // Save on unmount (catches navigation away before the 5s debounce fires)
  useEffect(() => {
    return () => { saveProjectRef.current(); };
  }, []);

  // Auto-save 5 seconds after any edit (only when video is hosted in Supabase)
  useEffect(() => {
    if (!hostedUrl) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => saveProjectRef.current(), 5000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [hostedUrl, segments, template, style,
      overlays, music, musicStart, songTrim, volume, fadeIn, fadeOut, muteOriginal, originalVolume, videoClips, musicEnd]);

  // overlay drag
  useEffect(() => {
    if (!dragOverlay) return;
    const move = (e: PointerEvent) => {
      const el = tracksRef.current; if (!el || !duration) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left + el.scrollLeft - dragOverlay.dx;
      const start = Math.max(0, Math.min(duration, x / pxPerSec));
      setOverlays(prev => prev.map(o => o.id === dragOverlay.id ? { ...o, start: Math.min(start, duration - o.length) } : o));
    };
    const up = () => setDragOverlay(null);
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragOverlay, duration, pxPerSec]);

  // music drag
  useEffect(() => {
    if (!dragMusic) return;
    const move = (e: PointerEvent) => {
      const el = tracksRef.current; if (!el || !duration) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left + el.scrollLeft;
      setMusicStart(Math.max(0, Math.min(duration, Math.round((x / pxPerSec) * 10) / 10)));
    };
    const up = () => setDragMusic(false);
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragMusic, duration, pxPerSec]);

  // music end-trim drag
  useEffect(() => {
    if (!dragMusicEnd) return;
    const move = (e: PointerEvent) => {
      const el = tracksRef.current; if (!el || !duration) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left + el.scrollLeft;
      setMusicEnd(Math.max(musicStart + 0.5, Math.min(duration, x / pxPerSec)));
    };
    const up = () => setDragMusicEnd(false);
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragMusicEnd, duration, pxPerSec, musicStart]);

  // playhead scrub — drag the handle to seek, live, without needing to click precisely
  useEffect(() => {
    if (!scrubbingPlayhead) return;
    const move = (e: PointerEvent) => {
      const el = tracksRef.current; const v = videoRef.current;
      if (!el || !v || !duration) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left + el.scrollLeft;
      const t = Math.max(0, Math.min(duration, x / pxPerSec));
      v.currentTime = t; setTime(t);
    };
    const up = () => setScrubbingPlayhead(false);
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [scrubbingPlayhead, duration, pxPerSec]);

  // keep the playhead in view while the timeline is scrolled and the video is playing
  useEffect(() => {
    const el = timelineRef.current; const v = videoRef.current;
    if (!el || !v || v.paused) return;
    const x = time * pxPerSec;
    const margin = 40;
    if (x < el.scrollLeft + margin) el.scrollLeft = Math.max(0, x - margin);
    else if (x > el.scrollLeft + el.clientWidth - margin) el.scrollLeft = x - el.clientWidth + margin;
  }, [time, pxPerSec]);

  // PiP drag in preview
  useEffect(() => {
    if (!dragPip) return;
    const move = (e: PointerEvent) => {
      const el = previewRef.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - dragPip.dx) / rect.width;
      const y = (e.clientY - rect.top - dragPip.dy) / rect.height;
      setOverlays(prev => prev.map(o => o.id === dragPip.id ? { ...o, x: Math.max(0, Math.min(0.95, x)), y: Math.max(0, Math.min(0.95, y)) } : o));
    };
    const up = () => setDragPip(null);
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragPip]);

  // Caption drag in preview — lets the caption be positioned anywhere in the
  // frame, not just the top/middle/bottom presets.
  useEffect(() => {
    if (!dragCaption) return;
    const move = (e: PointerEvent) => {
      const el = previewRef.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.min(96, Math.max(4, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.min(96, Math.max(4, ((e.clientY - rect.top) / rect.height) * 100));
      patchStyle({ capX: x, capY: y });
    };
    const up = () => setDragCaption(false);
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragCaption]);

  // Trim handles on the video track — cuts off the start and/or end of the clip.
  useEffect(() => {
    if (!dragTrim) return;
    const move = (e: PointerEvent) => {
      const el = tracksRef.current; if (!el || !duration) return;
      const rect = el.getBoundingClientRect();
      const t = Math.max(0, Math.min(duration, (e.clientX - rect.left + el.scrollLeft) / pxPerSec));
      setVideoClips(clips => {
        const sorted = [...clips].sort((a, b) => a.start - b.start);
        const idx = sorted.findIndex(c => c.id === dragTrim.clipId);
        if (idx === -1) return clips;
        const c = sorted[idx];
        if (dragTrim.edge === "start") {
          const min = idx > 0 ? sorted[idx - 1].end : 0;
          const next = { ...c, start: Math.max(min, Math.min(t, c.end - 0.2)) };
          return sorted.map((x, i) => (i === idx ? next : x));
        } else {
          const max = idx < sorted.length - 1 ? sorted[idx + 1].start : duration;
          const next = { ...c, end: Math.min(max, Math.max(t, c.start + 0.2)) };
          return sorted.map((x, i) => (i === idx ? next : x));
        }
      });
    };
    const up = () => setDragTrim(null);
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragTrim, duration, pxPerSec]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]; if (!picked) return;
    setFile(picked); setVideoUrl(URL.createObjectURL(picked));
    setDuration(0); setTime(0); setSegments([]); setOverlays([]); setStatus("idle"); setError("");
    // Transcription only starts when the user clicks the Transcribe button —
    // no longer triggered automatically on upload.
  }

  async function transcribe(f?: File) {
    const target = f || file;
    if (!target) return;
    setError(""); setStatus("uploading");
    setNativeSegs([]); setRomanSegs([]); setUseRomanState(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");
      const path = `studio/${session.user.id}/${Date.now()}.mp4`;
      const { error: upErr } = await supabase.storage.from("insta-media").upload(path, target, { upsert: true, contentType: target.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("insta-media").getPublicUrl(path);
      setHostedUrl(pub.publicUrl);
      setStatus("transcribing");
      const res = await fetch(`${API}/api/captioner/transcribe`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ videoUrl: pub.publicUrl, language: language === "auto" ? undefined : language }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Transcription failed"); }
      const { transcriptId } = await res.json();
      if (!transcriptId) throw new Error("Transcription did not start");
      for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const sRes = await fetch(`${API}/api/captioner/transcribe/${transcriptId}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
        const s = await sRes.json();
        if (s.status === "completed") {
          const built = buildSegments(s.words || []);
          setNativeSegs(built);
          setSegmentsRaw(built);
          const langKey = (s.language || "").toLowerCase().slice(0, 2);
          const known = LANGUAGES.find(l => l.id === langKey);
          if (known) setDetectedLang(known.id);
          setStatus("ready");
          return;
        }
        if (s.status === "error") throw new Error("Transcription failed");
      }
      throw new Error("Transcription timed out");
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); setStatus("idle"); }
  }

  function onTimeUpdate() {
    const v = videoRef.current; const a = audioRef.current; if (!v) return;
    setTime(v.currentTime);
    if (a && hasMusic && music.url) {
      a.volume = volume;
      const effectiveMusicEnd = musicEnd > 0 ? musicEnd : Infinity;
      if (v.currentTime >= musicStart && v.currentTime < effectiveMusicEnd) {
        const target = songTrim + (v.currentTime - musicStart);
        if (Math.abs(a.currentTime - target) > 0.3) a.currentTime = target;
        if (a.paused && !v.paused) a.play().catch(() => {});
      } else if (!a.paused) a.pause();
    }
  }
  // Native `timeupdate` only fires a handful of times a second, which reads
  // as a jerky playhead on the timeline — drive it from rAF instead while
  // playing, for a smooth per-frame sweep. onTimeUpdate above still runs too
  // (needed for the music-sync corrections), it's just no longer the only
  // thing moving the playhead.
  function tickPlayhead() {
    const v = videoRef.current;
    if (!v || v.paused || v.ended) { playheadRafRef.current = null; return; }
    // Jump-cut over any deleted clip range during playback, so preview plays
    // the edited result rather than the untouched source. (Manually scrubbing
    // into a gap still shows the original footage — only continuous playback
    // skips it, to keep this simple.)
    if (videoClips.length > 0 && !videoClips.some(c => v.currentTime >= c.start && v.currentTime < c.end)) {
      const next = videoClips.find(c => c.start > v.currentTime);
      if (next) v.currentTime = next.start;
      else { v.pause(); playheadRafRef.current = null; return; }
    }
    setTime(v.currentTime);
    playheadRafRef.current = requestAnimationFrame(tickPlayhead);
  }
  function stopPlayheadTick() {
    if (playheadRafRef.current != null) { cancelAnimationFrame(playheadRafRef.current); playheadRafRef.current = null; }
  }
  useEffect(() => () => stopPlayheadTick(), []);

  function onPlay() {
    setIsPlaying(true);
    const v = videoRef.current, a = audioRef.current;
    if (a && hasMusic && music.url && v && v.currentTime >= musicStart) { a.volume = volume; a.play().catch(() => {}); }
    stopPlayheadTick();
    playheadRafRef.current = requestAnimationFrame(tickPlayhead);
  }
  function onPause() { setIsPlaying(false); if (audioRef.current) audioRef.current.pause(); stopPlayheadTick(); }
  function togglePlay() { const v = videoRef.current; if (!v) return; if (v.paused) v.play(); else v.pause(); }

  function onTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    if (dragOverlay || dragMusic || scrubbingPlayhead) return;
    // Clicks on a clip/music/caption chip stopPropagation before reaching
    // here, so getting here means empty timeline space was clicked.
    setSelectedClipId(null); setMusicSelected(false); setSelectedCaptionId(null);
    const el = timelineRef.current; const v = videoRef.current;
    if (!el || !v || !duration) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left + el.scrollLeft;
    const t = Math.max(0, Math.min(duration, x / pxPerSec));
    v.currentTime = t;
    setTime(t); // instant playhead move — don't wait on the next timeupdate/rAF tick
  }
  function onTimelineHover(e: React.MouseEvent<HTMLDivElement>) {
    const el = timelineRef.current; if (!el || !duration) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left + el.scrollLeft;
    setHoverTime(Math.max(0, Math.min(duration, x / pxPerSec)));
  }
  function onTimelineWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const el = timelineRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const cursorX = e.clientX - rect.left + el.scrollLeft;
    const cursorTime = cursorX / pxPerSec;
    setZoom(z => {
      const nz = Math.max(0.5, Math.min(4, z * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
      requestAnimationFrame(() => { if (el) el.scrollLeft = Math.max(0, cursorTime * (PX_PER_SEC * nz) - (e.clientX - rect.left)); });
      return nz;
    });
  }
  function seek(t: number) { if (videoRef.current) videoRef.current.currentTime = t; setTime(t); }
  function editSeg(id: number, text: string) { setSegments(prev => prev.map(s => (s.id === id ? { ...s, text } : s))); }

  function pushHistory() { setHistory(h => { const snap = JSON.stringify(segments); if (h.length && JSON.stringify(h[h.length - 1]) === snap) return h; setRedoStack([]); return [...h.slice(-49), JSON.parse(snap)]; }); }
  function undo() { setHistory(h => { if (!h.length) return h; setRedoStack(r => [...r, segments]); setSegments(h[h.length - 1]); return h.slice(0, -1); }); }
  function redo() { setRedoStack(r => { if (!r.length) return r; setHistory(h => [...h, segments]); setSegments(r[r.length - 1]); return r.slice(0, -1); }); }
  function addCaption() {
    pushHistory();
    const start = time;
    const end = Math.min(duration || start + 2, start + 2);
    setSegments(prev => reindex([...prev, { id: -1, start, end, text: "New caption" }].sort((a, b) => a.start - b.start)));
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); return; }
      if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); if (!saving) saveProject(); return; }
      if (mod) return;

      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (typing) return;

      const v = videoRef.current;
      if (!v) return;
      if (e.key === " ") { e.preventDefault(); if (v.paused) v.play().catch(() => {}); else v.pause(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); seek(Math.max(0, time - (e.shiftKey ? 5 : 1))); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); seek(Math.min(duration, time + (e.shiftKey ? 5 : 1))); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  function splitSeg(id: number) {
    const seg = segments.find(s => s.id === id); if (!seg) return;
    const pos = caretRef.current && caretRef.current.id === id ? caretRef.current.pos : Math.floor(seg.text.length / 2);
    const before = seg.text.slice(0, pos).trim(); const after = seg.text.slice(pos).trim(); if (!before || !after) return;
    pushHistory();
    const mid = seg.start + (seg.end - seg.start) * (pos / seg.text.length);
    const idx = segments.findIndex(s => s.id === id); const next = [...segments];
    next.splice(idx, 1, { ...seg, text: before, end: mid }, { id: -1, start: mid, end: seg.end, text: after });
    setSegments(reindex(next));
  }
  function mergeUp(id: number) {
    const idx = segments.findIndex(s => s.id === id); if (idx <= 0) return;
    pushHistory(); const prev = segments[idx - 1], cur = segments[idx];
    const next = [...segments]; next.splice(idx - 1, 2, { ...prev, text: `${prev.text} ${cur.text}`.trim(), end: cur.end });
    setSegments(reindex(next));
  }
  function deleteSeg(id: number) {
    pushHistory();
    setSegments(prev => reindex(prev.filter(s => s.id !== id)));
  }

  // ── Video clips: cut/merge/delete (ripple) ──
  function cutVideoAtPlayhead() {
    const idx = videoClips.findIndex(c => time > c.start + 0.05 && time < c.end - 0.05);
    if (idx === -1) return; // playhead isn't usefully inside the selected (or any) clip
    const c = videoClips[idx];
    const left: VideoClip = { id: uid(), start: c.start, end: time };
    const right: VideoClip = { id: uid(), start: time, end: c.end };
    setVideoClips(clips => [...clips.slice(0, idx), left, right, ...clips.slice(idx + 1)]);
    setSelectedClipId(right.id);
  }
  function deleteVideoClip(id: string) {
    setVideoClips(clips => (clips.length > 1 ? clips.filter(c => c.id !== id) : clips));
    if (selectedClipId === id) setSelectedClipId(null);
  }
  function mergeVideoClip(id: string) {
    setVideoClips(clips => {
      const idx = clips.findIndex(c => c.id === id);
      if (idx === -1) return clips;
      // Prefer merging forward (with the next clip) if contiguous, else backward.
      if (idx < clips.length - 1 && Math.abs(clips[idx].end - clips[idx + 1].start) < 0.05) {
        const merged: VideoClip = { id: clips[idx].id, start: clips[idx].start, end: clips[idx + 1].end };
        return [...clips.slice(0, idx), merged, ...clips.slice(idx + 2)];
      }
      if (idx > 0 && Math.abs(clips[idx - 1].end - clips[idx].start) < 0.05) {
        const merged: VideoClip = { id: clips[idx - 1].id, start: clips[idx - 1].start, end: clips[idx].end };
        return [...clips.slice(0, idx - 1), merged, ...clips.slice(idx + 1)];
      }
      return clips;
    });
  }
  function canMergeClip(id: string): boolean {
    const idx = videoClips.findIndex(c => c.id === id);
    if (idx === -1) return false;
    const withNext = idx < videoClips.length - 1 && Math.abs(videoClips[idx].end - videoClips[idx + 1].start) < 0.05;
    const withPrev = idx > 0 && Math.abs(videoClips[idx - 1].end - videoClips[idx].start) < 0.05;
    return withNext || withPrev;
  }
  function removeMusic() { setMusic(MUSIC[0]); setMusicSelected(false); }

  async function searchPexels() {
    setPexLoading(true);
    try { const r = await fetch(`${API}/api/studio/pexels?q=${encodeURIComponent(pexQ || "trending")}&type=${pexType}`); const data = await r.json(); setPexItems(data.items || []); }
    catch { setPexItems([]); } finally { setPexLoading(false); }
  }
  function addOverlay(it: PexItem) {
    const len = it.kind === "video" ? 4 : 3;
    const start = Math.min(time, Math.max(0, duration - len));
    const o: Overlay = { id: uid(), kind: it.kind, url: it.url, thumb: it.thumb, start, length: len, mode: "full", half: "top", x: 0.56, y: 0.68 };
    setOverlays(prev => [...prev, o]); setSelOverlay(o.id); setShowPex(false);
  }
  function updateOverlay(id: string, patch: Partial<Overlay>) { setOverlays(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o)); }
  function deleteOverlay(id: string) { setOverlays(prev => prev.filter(o => o.id !== id)); if (selOverlay === id) setSelOverlay(null); }

  async function uploadOverlayFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingOverlay(true); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");
      const isVideo = f.type.startsWith("video/");
      const path = `overlays/${session.user.id}/${Date.now()}-${f.name.replace(/[^\w.]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("insta-media").upload(path, f, { upsert: true, contentType: f.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("insta-media").getPublicUrl(path);
      addOverlay({ id: Date.now(), kind: isVideo ? "video" : "image", url: pub.publicUrl, thumb: pub.publicUrl });
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed."); }
    finally { setUploadingOverlay(false); e.target.value = ""; }
  }

  async function uploadMusic(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setUploadingMusic(true); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");
      const path = `music/${session.user.id}/${Date.now()}-${f.name.replace(/[^\w.]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("insta-media").upload(path, f, { upsert: true, contentType: f.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("insta-media").getPublicUrl(path);
      const track: Music = { key: `up-${uid()}`, label: f.name.slice(0, 18), url: pub.publicUrl };
      setUploadedMusic(prev => [...prev, track]);
      setMusic(track);
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn't upload track."); }
    finally { setUploadingMusic(false); }
  }

  async function saveProject() {
    if (!file && !hostedUrl) { setSaveError("No video loaded."); return; }
    setSaving(true); setSaveError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setSaveError("Please sign in again."); return; }

      // Upload video to Supabase if not already done
      let url = hostedUrl;
      if (!url && file) {
        const path = `studio/${session.user.id}/${Date.now()}.mp4`;
        const { error: upErr } = await supabase.storage.from("insta-media").upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("insta-media").getPublicUrl(path);
        url = pub.publicUrl;
        setHostedUrl(url);
      }

      const payload = {
        user_id: session.user.id,
        name: (segments[0]?.text || file?.name || "Studio project").slice(0, 40),
        video_url: url,
        data: { segments, template, style, wordHighlight, language, overlays, music, musicStart, songTrim, volume, fadeIn, fadeOut, muteOriginal, originalVolume, videoClips, musicEnd },
        updated_at: new Date().toISOString(),
      };
      if (projectId) await supabase.from("studio_projects").update(payload).eq("id", projectId);
      else { const { data: ins } = await supabase.from("studio_projects").insert(payload).select("id").single(); if (ins) setProjectId(ins.id); }
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function fetchProjects() {
    setLoadingProjects(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("studio_projects").select("id, name, video_url, data, updated_at").eq("user_id", session.user.id).order("updated_at", { ascending: false }).limit(20);
      setProjects(data || []);
    } catch { /* ignore */ }
    finally { setLoadingProjects(false); }
  }

  function loadProject(p: { id: string; name: string; video_url: string; data: any }) {
    const d = p.data || {};
    setVideoUrl(p.video_url); setHostedUrl(p.video_url); setFile(null);
    setNativeSegs(d.segments || []); setRomanSegs([]); setUseRomanState(false);
    setSegmentsRaw(d.segments || []); setHistory([]);
    setTemplateState(d.template || "minimal");
    setStyle(d.style || TEMPLATES[(d.template as TemplateId) || "minimal"].style);
    setWordHighlight(d.wordHighlight ?? true);
    setLanguageState(d.language || "auto"); setDetectedLang(null);
    setOverlays(d.overlays || []);
    setMusic(d.music || MUSIC[0]); setMusicStart(d.musicStart || 0);
    setSongTrim(d.songTrim || 0); setVolume(d.volume ?? 0.25);
    setFadeIn(d.fadeIn ?? true); setFadeOut(d.fadeOut ?? true);
    setMuteOriginal(d.muteOriginal ?? false); setOriginalVolume(d.originalVolume ?? 1);
    setVideoClips(d.videoClips || []); setMusicEnd(d.musicEnd || 0);
    setSelectedClipId(null); setMusicSelected(false); setSelectedCaptionId(null);
    setProjectId(p.id); setStatus("ready"); setError(""); setSavedAt("");
    setShowProjects(false);
  }

  async function deleteProject(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from("studio_projects").delete().eq("id", id).eq("user_id", session.user.id);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (projectId === id) { setProjectId(null); setSavedAt(""); }
    } catch { /* ignore */ }
  }

  async function renameProject(id: string, newName: string) {
    const trimmed = newName.trim();
    if (!trimmed) { setRenamingId(null); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from("studio_projects").update({ name: trimmed }).eq("id", id).eq("user_id", session.user.id);
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: trimmed } : p));
    } catch { /* ignore */ }
    finally { setRenamingId(null); }
  }

  // Draw image/video with object-cover behaviour onto canvas
  function drawCover(ctx: CanvasRenderingContext2D, src: HTMLImageElement | HTMLVideoElement, dx: number, dy: number, dw: number, dh: number) {
    const sw = src instanceof HTMLVideoElement ? src.videoWidth : src.naturalWidth;
    const sh = src instanceof HTMLVideoElement ? src.videoHeight : src.naturalHeight;
    if (!sw || !sh) return;
    const srcRatio = sw / sh, dstRatio = dw / dh;
    let sx = 0, sy = 0, cropW = sw, cropH = sh;
    if (srcRatio > dstRatio) { cropW = sh * dstRatio; sx = (sw - cropW) / 2; }
    else { cropH = sw / dstRatio; sy = (sh - cropH) / 2; }
    ctx.drawImage(src, sx, sy, cropW, cropH, dx, dy, dw, dh);
  }

  async function exportVideo() {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    setExporting(true); setExportProgress(0); exportCancelRef.current = false;

    const W = 1080, H = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Clips to record, in order, each a (start,end) range in the source video.
    const clips = [...videoClips].sort((a, b) => a.start - b.start);
    if (clips.length === 0) clips.push({ id: "full", start: 0, end: duration });
    const totalClipsDuration = clips.reduce((sum, c) => sum + (c.end - c.start), 0);
    const effectiveMusicEnd = musicEnd > 0 ? musicEnd : Infinity;

    // Preload overlay images
    const imgCache: Record<string, HTMLImageElement> = {};
    await Promise.all(overlays.filter(o => o.kind === "image").map(o => new Promise<void>(res => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => { imgCache[o.id] = img; res(); };
      img.onerror = () => res();
      img.src = o.url;
    })));
    await document.fonts.ready;

    // Audio setup
    const audioCtx = new AudioContext();
    const mixDest = audioCtx.createMediaStreamDestination();
    try {
      if (!muteOriginal) {
        const vs = (v as any).captureStream?.() || (v as any).mozCaptureStream?.();
        if (vs?.getAudioTracks().length) {
          const src = audioCtx.createMediaStreamSource(new MediaStream(vs.getAudioTracks()));
          const gain = audioCtx.createGain(); gain.gain.value = originalVolume;
          src.connect(gain); gain.connect(mixDest);
        }
      }
      let musicAudioEl: HTMLAudioElement | null = null;
      if (hasMusic && music.url) {
        musicAudioEl = new Audio(); musicAudioEl.crossOrigin = "anonymous";
        musicAudioEl.src = music.url; musicAudioEl.loop = true;
        musicAudioEl.volume = volume; musicAudioEl.currentTime = songTrim;
        const ms = audioCtx.createMediaElementSource(musicAudioEl);
        const gainNode = audioCtx.createGain(); gainNode.gain.value = volume;
        ms.connect(gainNode); gainNode.connect(mixDest);
      }

      const canvasStream = canvas.captureStream(30);
      const outStream = new MediaStream([...canvasStream.getVideoTracks(), ...mixDest.stream.getAudioTracks()]);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
      const rec = new MediaRecorder(outStream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

      // Seek to the first clip's start
      let clipIdx = 0;
      v.pause(); v.currentTime = clips[0].start;
      await new Promise(r => setTimeout(r, 200));
      rec.start(200);
      await v.play();
      if (musicAudioEl) { musicAudioEl.currentTime = songTrim; musicAudioEl.play().catch(() => {}); }

      await new Promise<void>(resolve => {
        rec.onstop = () => resolve();
        const draw = () => {
          if (exportCancelRef.current) { v.pause(); musicAudioEl?.pause(); rec.stop(); return; }
          const clip = clips[clipIdx];
          if (!clip) { v.pause(); musicAudioEl?.pause(); rec.stop(); return; }
          const t = v.currentTime;
          const elapsedBeforeThisClip = clips.slice(0, clipIdx).reduce((s, c) => s + (c.end - c.start), 0);
          const withinClip = Math.max(0, t - clip.start);
          setExportProgress(totalClipsDuration > 0 ? Math.min(99, Math.round(((elapsedBeforeThisClip + withinClip) / totalClipsDuration) * 100)) : 0);
          if (musicAudioEl) {
            if (t >= effectiveMusicEnd && !musicAudioEl.paused) musicAudioEl.pause();
            else if (t < effectiveMusicEnd && musicAudioEl.paused && !v.paused) musicAudioEl.play().catch(() => {});
          }

          ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);

          // Find active half overlay
          const halfOv = overlays.find(o => t >= o.start && t < o.start + o.length && o.mode === "half");
          if (halfOv) {
            const vidY = halfOv.half === "top" ? H / 2 : 0;
            const imgY = halfOv.half === "top" ? 0 : H / 2;
            drawCover(ctx, v, 0, vidY, W, H / 2);
            const img = imgCache[halfOv.id];
            if (img) drawCover(ctx, img, 0, imgY, W, H / 2);
          } else {
            drawCover(ctx, v, 0, 0, W, H);
            for (const o of overlays) {
              if (t < o.start || t >= o.start + o.length || o.mode === "half") continue;
              const img = imgCache[o.id]; if (!img) continue;
              if (o.mode === "full") drawCover(ctx, img, 0, 0, W, H);
              else if (o.mode === "pip") { const pw = W * 0.32; drawCover(ctx, img, o.x * W, o.y * H, pw, pw); }
            }
          }

          // Captions
          const seg = segments.find(s => (t + offset) >= s.start && (t + offset) < s.end);
          if (seg?.text) {
            const fs = Math.round(W * 0.0293 * style.fontSize);
            ctx.font = `${style.fontWeight} ${fs}px ${style.fontFamily}`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            const x = (style.capX ?? presetCapPos(style.position).x) / 100 * W;
            const y = (style.capY ?? presetCapPos(style.position).y) / 100 * H;
            const pad = fs * 0.5;
            const text = style.uppercase ? seg.text.toUpperCase() : seg.text;
            const tw = ctx.measureText(text).width;
            if (style.background) {
              ctx.fillStyle = style.bgColor;
              ctx.beginPath();
              ctx.roundRect(x - tw / 2 - pad, y - fs / 2 - pad / 2, tw + pad * 2, fs + pad, style.background === "pill" ? 999 : 8);
              ctx.fill();
            }
            ctx.fillStyle = style.textColor; ctx.fillText(text, x, y);
          }

          if (v.ended || t >= clip.end - 0.05) {
            const nextClip = clips[clipIdx + 1];
            if (!nextClip) { v.pause(); musicAudioEl?.pause(); rec.stop(); return; }
            // Jump-cut to the next clip. Wait for the seek to actually land
            // before drawing again — the canvas just holds its last frame
            // for that brief gap, which reads as a normal hard cut.
            clipIdx++;
            const onSeeked = () => { v.removeEventListener("seeked", onSeeked); requestAnimationFrame(draw); };
            v.addEventListener("seeked", onSeeked);
            v.currentTime = nextClip.start;
            return;
          }
          requestAnimationFrame(draw);
        };
        requestAnimationFrame(draw);
      });

      if (!exportCancelRef.current && chunks.length > 0) {
        const blob = new Blob(chunks, { type: mime });
        setExportBlob(blob);
        setExportPreviewUrl(URL.createObjectURL(blob));
      }
      setExportProgress(100);
    } finally {
      audioCtx.close(); setExporting(false); setExportProgress(0);
    }
  }

  async function convertToMp4() {
    if (!exportBlob) return;
    setConverting(true); setConvertProgress(0);
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }) => setConvertProgress(Math.round(progress * 100)));
      await ffmpeg.load({
        coreURL: await toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js", "text/javascript"),
        wasmURL: await toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm", "application/wasm"),
      });
      await ffmpeg.writeFile("input.webm", await fetchFile(exportBlob));
      await ffmpeg.exec(["-i", "input.webm", "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "output.mp4"]);
      const data = await ffmpeg.readFile("output.mp4");
      const mp4Blob = new Blob([data as Uint8Array], { type: "video/mp4" });
      const url = URL.createObjectURL(mp4Blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `studio-export-${Date.now()}.mp4`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError("MP4 conversion failed. Try downloading as WebM instead.");
    } finally {
      setConverting(false); setConvertProgress(0);
    }
  }

  const capAnimClass = style.animation === "fade" ? "animate-in fade-in duration-300"
    : style.animation === "pop" ? "animate-in zoom-in-95 fade-in duration-200"
    : style.animation === "slide" ? "animate-in slide-in-from-bottom-2 fade-in duration-200"
    : "";
  const capWrapStyle: React.CSSProperties = style.background === "solid"
    ? { backgroundColor: style.bgColor, padding: "0.35em 0.7em", borderRadius: "0.35em" }
    : style.background === "pill"
    ? { backgroundColor: style.bgColor, padding: "0.35em 0.9em", borderRadius: 9999 }
    : {};
  const sel = overlays.find(o => o.id === selOverlay) || null;

  // dark timeline styles
  const TL_BG = "#1e1e24", TL_LINE = "#3a3a44", TL_TEXT = "#cbd5e1";
  const TRACK_COLORS = { overlays: "#fb923c", video: "#38bdf8", captions: "#a78bfa", music: "#34d399" };

  return (
    <div className="space-y-5">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Inter:wght@600&family=Montserrat:wght@700&family=Poppins:wght@600&family=Playfair+Display:wght@500;700&family=Caveat:wght@700&family=Permanent+Marker&family=Space+Mono:wght@700&family=Bangers&family=Press+Start+2P&display=swap" />

          {/* Editor toolbar */}
          <div className="flex items-center justify-between bg-card rounded-2xl border border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <button onClick={() => {
                setFile(null); setVideoUrl(""); setHostedUrl(""); setSegments([]);
                setNativeSegs([]); setRomanSegs([]); setUseRomanState(false); setDetectedLang(null);
                setOverlays([]); setMusic(MUSIC[0]); setStatus("idle"); setHistory([]);
              }} disabled={!hasVideo} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition disabled:opacity-40">← New</button>
              <div className="w-px h-4 bg-border mx-1" />
              <button onClick={() => { fetchProjects(); setShowProjects(true); }}
                className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition">
                Projects
              </button>
            </div>
            <div className="flex items-center gap-2">
              {saveError && <span className="text-xs text-red-500">{saveError}</span>}
              {savedAt && !saveError && <span className="text-xs text-muted-foreground">Auto-saved {savedAt}</span>}
              <button onClick={saveProject} disabled={saving || !hasVideo}
                className="text-sm font-semibold px-3 py-1.5 rounded-lg border transition disabled:opacity-50"
                style={{ borderColor: PURPLE, color: PURPLE }}>
                {saving ? "Saving…" : "Save"}
              </button>
              {exporting ? (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 rounded-full bg-accent overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-200" style={{ width: `${exportProgress}%`, background: GRAD }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{exportProgress}%</span>
                  <button onClick={() => { exportCancelRef.current = true; }} className="text-xs text-red-500 font-semibold">Cancel</button>
                </div>
              ) : (
                <button onClick={exportVideo} disabled={!hasVideo} className="text-sm font-semibold px-4 py-1.5 rounded-lg text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: GRAD }}>Export</button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-[380px_1fr_380px] gap-4 items-start">

            {/* left column: transcript — stays visible even before a video is added.
                Once a transcript exists, lock the height so it stays constant
                instead of shrinking/growing with the number of caption lines. */}
            <div className="space-y-4 pr-1">
                <div className="panel p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Type className="size-4" style={{ color: PURPLE }} />
                      <h2 className="font-bold text-foreground text-sm">Transcript</h2>
                    </div>
                    <span className="text-xs text-muted-foreground">{segments.length} lines</span>
                  </div>

                  {/* Language + undo/redo/re-transcribe */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <select
                      value={useRoman ? `${language}-roman` : language}
                      onChange={e => {
                        const v = e.target.value;
                        if (v.endsWith("-roman")) { setLanguage(v.slice(0, -"-roman".length) as LangId); void setUseRoman(true); }
                        else { setLanguage(v as LangId); void setUseRoman(false); }
                      }}
                      disabled={romanizing}
                      className="flex-1 min-w-0 h-8 rounded-md bg-background border border-border px-2 text-xs">
                      {LANGUAGES.flatMap(l => {
                        const label = l.native ? `${l.label} — ${l.native}` : l.label;
                        const rows = [<option key={l.id} value={l.id}>{label}</option>];
                        if (l.roman) rows.push(<option key={`${l.id}-roman`} value={`${l.id}-roman`}>{l.roman} (Romanized)</option>);
                        return rows;
                      })}
                    </select>
                    <button onClick={undo} disabled={!history.length} title="Undo"
                      className="shrink-0 h-8 w-8 rounded-md border border-border flex items-center justify-center transition disabled:opacity-40 hover:bg-accent"
                      style={{ color: history.length ? PURPLE : undefined }}>
                      <Undo2 className="size-3.5" />
                    </button>
                    <button onClick={redo} disabled={!redoStack.length} title="Redo"
                      className="shrink-0 h-8 w-8 rounded-md border border-border flex items-center justify-center transition disabled:opacity-40 hover:bg-accent"
                      style={{ color: redoStack.length ? PURPLE : undefined }}>
                      <Redo2 className="size-3.5" />
                    </button>
                    <button onClick={() => transcribe()} disabled={!hasVideo || status === "uploading" || status === "transcribing"}
                      title={hasVideo ? (segments.length > 0 ? "Re-transcribe" : "Transcribe") : "Upload a video first"}
                      className="shrink-0 h-8 px-3 rounded-md text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40 hover:opacity-90"
                      style={{ background: GRAD }}>
                      {status === "transcribing" || status === "uploading" ? <Loader2 className="size-3.5 animate-spin" /> : <Mic className="size-3.5" />}
                      {segments.length > 0 ? "Re-transcribe" : "Transcribe"}
                    </button>
                  </div>
                  {romanizing && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
                      <Loader2 className="size-3 animate-spin" /> Converting…
                    </div>
                  )}
                  {error && <p className="text-[11px] text-red-500 mb-2">{error}</p>}

                  {/* Search & replace */}
                  <SearchReplace onReplace={(find, repl) => {
                    if (!find) return;
                    const re = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
                    pushHistory();
                    setSegments(prev => prev.map(s => ({ ...s, text: s.text.replace(re, repl) })));
                  }} />

                  {/* Caption offset */}
                  <div className="mt-2 mb-3">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span>Caption offset</span>
                      <span className="tabular-nums">{offset >= 0 ? "+" : ""}{offset.toFixed(2)}s</span>
                    </div>
                    <input type="range" min={-2} max={2} step={0.05} value={offset} onChange={e => setOffset(parseFloat(e.target.value))} className="w-full accent-purple-600" />
                  </div>

                  <div className={`space-y-2 overflow-y-auto pr-1 thick-scrollbar ${segments.length > 0 ? "h-[28vh]" : "max-h-[28vh]"}`}>
                    {segments.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        {hasVideo ? "Click Transcribe above to generate captions, or add one manually." : "Upload a video, then click Transcribe, or add a caption manually."}
                      </p>
                    )}
                    {segments.map(s => { const active = s.id === activeId; return (
                      <div key={s.id} ref={el => (rowRefs.current[s.id] = el)}
                        className="group flex gap-3 p-3 rounded-xl border border-border transition"
                        style={active ? { borderColor: PURPLE, background: `${PURPLE}10`, boxShadow: `0 0 0 1px ${PURPLE}` } : {}}>
                        <button onClick={() => seek(s.start)} className="shrink-0 text-xs font-mono mt-1 px-1.5 py-0.5 rounded transition text-muted-foreground"
                          style={active ? { color: PURPLE } : {}}>{fmt(s.start)}</button>
                        <textarea value={s.text} onFocus={pushHistory} onChange={e => editSeg(s.id, e.target.value)}
                          onSelect={e => { caretRef.current = { id: s.id, pos: e.currentTarget.selectionStart }; }}
                          rows={1} className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed text-foreground"
                          style={{ minHeight: 24 }}
                          onInput={e => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }} />
                        <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => splitSeg(s.id)} title="Split" aria-label="Split" className="p-1 rounded border border-border text-muted-foreground hover:text-purple-500 transition">
                            <Scissors className="size-3" />
                          </button>
                          <button onClick={() => mergeUp(s.id)} disabled={s.id === 0} title="Merge up" aria-label="Merge up" className="p-1 rounded border border-border text-muted-foreground hover:text-purple-500 disabled:opacity-30 transition">
                            <Combine className="size-3" />
                          </button>
                          <button onClick={() => deleteSeg(s.id)} title="Delete" aria-label="Delete" className="p-1 rounded border border-border text-muted-foreground hover:text-red-500 hover:border-red-400 transition">
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>); })}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={addCaption}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-dashed border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-purple-400 transition">
                      <Plus className="size-3" /> Add caption
                    </button>
                    <button onClick={exportSrt} disabled={!segments.length}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-white text-xs font-semibold disabled:opacity-50"
                      style={{ background: GRAD }}>
                      <Download className="size-3" /> Export .srt
                    </button>
                  </div>
                </div>
            </div>

            {/* center column: video — never scrolls, its natural height anchors the row */}
            <div className="space-y-4 px-1">
              <div className="relative mx-auto w-full" style={{ maxWidth: 240 }}>
                <div className="absolute -inset-4 rounded-[2rem] opacity-40 blur-2xl pointer-events-none" style={{ background: GRAD }} />
                <div ref={previewRef} className="relative rounded-2xl overflow-hidden bg-black shadow-lg aspect-[9/16] w-full ring-1 ring-white/10 group">

                {/* Video — shrinks to its half when a half overlay is active */}
                <div className="absolute left-0 w-full overflow-hidden transition-all duration-200"
                  style={{
                    height: activeHalfOverlay ? "50%" : "100%",
                    top: activeHalfOverlay?.half === "top" ? "50%" : 0,
                  }}>
                  {hasVideo ? (
                    <video ref={videoRef} src={videoUrl} onTimeUpdate={onTimeUpdate} onPlay={onPlay} onPause={onPause} onEnded={onPause} onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
                      onClick={togglePlay} className="w-full h-full object-cover cursor-pointer" />
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer text-center px-6"
                      style={{ background: `linear-gradient(135deg, ${PURPLE}12, #6D28D912)` }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: GRAD }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Upload a video</p>
                        <p className="text-xs text-muted-foreground mt-1">Drop a Reel or Short here. We&apos;ll transcribe and caption it for you.</p>
                      </div>
                      <span className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md" style={{ background: GRAD }}>Upload file</span>
                      <input type="file" accept="video/*" onChange={onPick} className="hidden" />
                    </label>
                  )}
                </div>
                {hasVideo && !isPlaying && (
                  <button onClick={togglePlay} aria-label="Play"
                    className="absolute inset-0 flex items-center justify-center">
                    <span className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
                      <Play size={22} className="text-white ml-0.5" fill="white" />
                    </span>
                  </button>
                )}
                {hasVideo && isPlaying && (
                  <button onClick={togglePlay} aria-label="Pause"
                    className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Pause size={16} className="text-white" fill="white" />
                  </button>
                )}
                {activeOverlays.map(o => (
                  o.mode === "pip" ? (
                    <img key={o.id} src={o.thumb} alt="" draggable={false}
                      onPointerDown={e => { const el = previewRef.current!; const rect = el.getBoundingClientRect(); setDragPip({ id: o.id, dx: e.clientX - (rect.left + o.x * rect.width), dy: e.clientY - (rect.top + o.y * rect.height) }); setSelOverlay(o.id); }}
                      className="absolute object-cover cursor-move"
                      style={{ left: `${o.x * 100}%`, top: `${o.y * 100}%`, width: "32%", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.4)", border: selOverlay === o.id ? `2px solid ${PURPLE}` : "none" }} />
                  ) : o.mode === "full" ? (
                    <img key={o.id} src={o.thumb} alt="" className="absolute left-0 w-full h-full pointer-events-none" style={{ top: 0, objectFit: "cover" }} />
                  ) : (
                    // Half mode — overlay fills its half with contain (no crop), video fills the other half
                    <div key={o.id} className="absolute left-0 w-full overflow-hidden"
                      style={{ height: "50%", top: o.half === "top" ? 0 : "50%" }}>
                      <img src={o.thumb} alt="" className="w-full h-full object-cover" />
                    </div>
                  )
                ))}
                {segments.length > 0 && (
                  <div className="absolute px-3 text-center cursor-move touch-none select-none"
                    style={{ left: `${effectiveCapPos.x}%`, top: `${effectiveCapPos.y}%`, transform: "translate(-50%, -50%)", opacity: activeSeg ? 1 : 0.55 }}
                    onPointerDown={e => { e.preventDefault(); setDragCaption(true); }}>
                    <span
                      key={activeId}
                      className={capAnimClass}
                      style={{
                        ...capWrapStyle,
                        fontFamily: style.fontFamily,
                        fontSize: `${style.fontSize * 0.62}rem`,
                        fontWeight: style.fontWeight,
                        color: style.textColor,
                        textShadow: style.background === "" ? "0 2px 8px rgba(0,0,0,0.7)" : undefined,
                        lineHeight: 1.25,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {activeSeg ? renderActiveCaption() : previewCaptionText}
                    </span>
                  </div>
                )}
                </div>
              </div>
              {music.url && <audio ref={audioRef} src={music.url} loop preload="auto" />}
              {/* Hidden — used only to seek+draw frames for the timeline filmstrip */}
              <video ref={thumbVideoRef} muted playsInline preload="auto" style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />

              {sel && (
                <div className="panel p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 rounded-full" style={{ background: PURPLE }} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Overlay</p>
                    </div>
                    <button onClick={() => deleteOverlay(sel.id)} className="text-xs font-semibold text-red-500 hover:text-red-600 transition">Delete</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {([["full", "Full"], ["half", "Half"], ["pip", "PiP"]] as const).map(([m, label]) => (
                      <button key={m} onClick={() => updateOverlay(sel.id, { mode: m })}
                        className="px-2 py-1.5 rounded-lg border border-border text-sm font-medium transition"
                        style={sel.mode === m ? { borderColor: PURPLE, color: PURPLE, background: `${PURPLE}15` } : {}}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {sel.mode === "half" && (
                    <div className="flex gap-2">
                      {(["top", "bottom"] as const).map(h => (
                        <button key={h} onClick={() => updateOverlay(sel.id, { half: h })}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm capitalize font-medium transition"
                          style={sel.half === h ? { borderColor: PURPLE, color: PURPLE, background: `${PURPLE}15` } : {}}>
                          {h}
                        </button>
                      ))}
                    </div>
                  )}
                  <label className="block">
                    <span className="text-[11px] text-muted-foreground">Duration {sel.length.toFixed(1)}s</span>
                    <input type="range" min={1} max={10} step={0.5} value={sel.length} onChange={e => updateOverlay(sel.id, { length: parseFloat(e.target.value) })} className="w-full accent-purple-600 mt-1" />
                  </label>
                </div>
              )}

            </div>

            {/* right column: caption designer — Music/Overlay tabs live here too,
                so this stays available even before a transcript exists. */}
            <div className={`space-y-4 md:overflow-y-auto pr-1 thick-scrollbar ${segments.length > 0 ? "md:h-[62vh]" : "md:max-h-[62vh]"}`}>
                <div className="panel p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="size-4" style={{ color: PURPLE }} />
                    <h2 className="font-bold text-foreground text-sm">Caption Designer</h2>
                  </div>

                  {/* Tab icon grid */}
                  <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-accent/40">
                    {([
                      ["templates", Layers, "Templates"],
                      ["font", Type, "Font"],
                      ["colors", Palette, "Colors"],
                      ["position", Circle, "Position"],
                      ["animation", Zap, "Animation"],
                      ["music", MusicIcon, "Music"],
                      ["overlay", ImagePlus, "Overlay"],
                    ] as const).map(([id, Icon, label]) => (
                      <button key={id} onClick={() => setDesignerTab(id)} title={label}
                        className="h-8 rounded-md flex items-center justify-center transition"
                        style={designerTab === id ? { background: "hsl(var(--card))", color: PURPLE, boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : { color: "hsl(var(--muted-foreground))" }}>
                        <Icon className="size-3.5" />
                      </button>
                    ))}
                    <button onClick={saveProject} disabled={saving} title="Save project"
                      className="h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                      {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    </button>
                  </div>

                  {!hasCaptions && !["music", "overlay"].includes(designerTab) && (
                    <p className="text-[11px] text-muted-foreground -mt-1">Transcribe your video to preview these live on the caption track.</p>
                  )}

                  {designerTab === "templates" && (() => {
                    const filtered = (Object.keys(TEMPLATES) as TemplateId[]).filter(id => {
                      if (templateCategory !== "all" && TEMPLATES[id].category !== templateCategory) return false;
                      if (templateSearch.trim() && !TEMPLATES[id].label.toLowerCase().includes(templateSearch.trim().toLowerCase())) return false;
                      return true;
                    });
                    return (
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                          <input value={templateSearch} onChange={e => setTemplateSearch(e.target.value)} placeholder="Search templates…"
                            className="w-full h-8 pl-8 pr-2 rounded-md bg-background border border-border text-xs" />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button onClick={() => setTemplateCategory("all")}
                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition"
                            style={templateCategory === "all" ? { borderColor: PURPLE, color: PURPLE, background: `${PURPLE}15` } : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                            All
                          </button>
                          {TEMPLATE_CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setTemplateCategory(cat)}
                              className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition"
                              style={templateCategory === cat ? { borderColor: PURPLE, color: PURPLE, background: `${PURPLE}15` } : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                              {cat}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{filtered.length} template{filtered.length === 1 ? "" : "s"}</p>
                        <div className="grid grid-cols-2 gap-2 max-h-[38vh] overflow-y-auto pr-1">
                          {filtered.map(id => {
                            const tpl = TEMPLATES[id];
                            const active = template === id;
                            return (
                              <button key={id} onClick={() => setTemplate(id)}
                                className="rounded-xl border overflow-hidden text-left transition-all"
                                style={active ? { borderColor: PURPLE, boxShadow: `0 0 0 2px ${PURPLE}66` } : { borderColor: "hsl(var(--border))" }}>
                                <div className="h-14 grid place-items-center" style={{ backgroundImage: "linear-gradient(135deg, rgba(30,30,40,0.9), rgba(10,10,20,0.9))" }}>
                                  <span style={{ fontFamily: tpl.style.fontFamily, fontWeight: tpl.style.fontWeight, color: tpl.style.textColor, textTransform: tpl.style.uppercase ? "uppercase" : "none", fontSize: "1rem", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>Ab c</span>
                                </div>
                                <div className="px-2.5 py-2 bg-card">
                                  <div className="text-xs font-semibold text-foreground leading-tight">{tpl.label}</div>
                                  {active && <div className="text-[10px] mt-0.5" style={{ color: PURPLE }}>Selected</div>}
                                </div>
                              </button>
                            );
                          })}
                          {filtered.length === 0 && <p className="col-span-2 text-center text-xs text-muted-foreground py-6">No templates match.</p>}
                        </div>
                      </div>
                    );
                  })()}

                  {designerTab === "font" && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">Font</p>
                        <select value={style.fontFamily} onChange={e => patchStyle({ fontFamily: e.target.value })}
                          className="w-full h-8 rounded-md bg-background border border-border px-2 text-xs">
                          {FONTS.map(f => (<option key={f.id} value={f.id}>{f.label}</option>))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">Size {style.fontSize.toFixed(2)}</p>
                          <input type="range" min={0.8} max={3.5} step={0.05} value={style.fontSize} onChange={e => patchStyle({ fontSize: parseFloat(e.target.value) })} className="w-full accent-purple-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">Weight</p>
                          <div className="grid grid-cols-4 gap-1">
                            {[400, 600, 700, 900].map(w => (
                              <button key={w} onClick={() => patchStyle({ fontWeight: w })}
                                className="h-7 rounded text-[10px] border font-medium"
                                style={style.fontWeight === w ? { borderColor: PURPLE, color: PURPLE, background: `${PURPLE}15` } : {}}>{w}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center justify-between text-xs pt-1 border-t border-border">
                        <span>Uppercase</span>
                        <button onClick={() => patchStyle({ uppercase: !style.uppercase })}
                          className="relative w-9 h-5 rounded-full transition" style={{ background: style.uppercase ? PURPLE : "hsl(var(--muted))" }}>
                          <span className="absolute top-0.5 size-4 bg-white rounded-full transition" style={{ left: style.uppercase ? 16 : 2 }} />
                        </button>
                      </label>
                    </div>
                  )}

                  {designerTab === "colors" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Text</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <input type="color" value={style.textColor} onChange={e => patchStyle({ textColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                            <input type="text" value={style.textColor} onChange={e => patchStyle({ textColor: e.target.value })} className="flex-1 min-w-0 h-8 rounded-md bg-background border border-border px-2 text-xs font-mono" />
                          </div>
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Highlight</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <input type="color" value={style.highlightColor} onChange={e => patchStyle({ highlightColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                            <input type="text" value={style.highlightColor} onChange={e => patchStyle({ highlightColor: e.target.value })} className="flex-1 min-w-0 h-8 rounded-md bg-background border border-border px-2 text-xs font-mono" />
                          </div>
                        </label>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">Background</p>
                        <div className="grid grid-cols-3 gap-1">
                          {([{ id: "" as const, label: "None" }, { id: "solid" as const, label: "Box" }, { id: "pill" as const, label: "Pill" }]).map(b => (
                            <button key={b.id} onClick={() => patchStyle({ background: b.id })}
                              className="h-7 rounded text-[10px] border font-medium"
                              style={style.background === b.id ? { borderColor: PURPLE, color: PURPLE, background: `${PURPLE}15` } : {}}>{b.label}</button>
                          ))}
                        </div>
                        {style.background && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <input type="color" value={style.bgColor} onChange={e => patchStyle({ bgColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                            <input type="text" value={style.bgColor} onChange={e => patchStyle({ bgColor: e.target.value })} className="flex-1 min-w-0 h-8 rounded-md bg-background border border-border px-2 text-xs font-mono" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {designerTab === "position" && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">Position</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["top", "middle", "bottom"] as CapPosition[]).map(p => (
                          <button key={p} onClick={() => patchStyle({ position: p, capX: undefined, capY: undefined })}
                            className="h-8 rounded text-xs border capitalize font-medium"
                            style={style.position === p ? { borderColor: PURPLE, color: PURPLE, background: `${PURPLE}15` } : {}}>{p}</button>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">Or drag the caption text directly in the preview.</p>
                    </div>
                  )}

                  {designerTab === "animation" && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">Animation</p>
                        <select value={style.animation} onChange={e => patchStyle({ animation: e.target.value as CapAnimation })}
                          className="w-full h-8 rounded-md bg-background border border-border px-2 text-xs capitalize">
                          {(["none", "fade", "pop", "slide"] as CapAnimation[]).map(a => (<option key={a} value={a}>{a}</option>))}
                        </select>
                      </div>
                      <label className="flex items-center justify-between text-xs pt-1 border-t border-border">
                        <span>Word highlight</span>
                        <button onClick={() => setWordHighlight(v => !v)}
                          className="relative w-9 h-5 rounded-full transition" style={{ background: wordHighlight ? PURPLE : "hsl(var(--muted))" }}>
                          <span className="absolute top-0.5 size-4 bg-white rounded-full transition" style={{ left: wordHighlight ? 16 : 2 }} />
                        </button>
                      </label>
                    </div>
                  )}

                  {designerTab === "music" && (
                    <div className="space-y-4">
                      {hasMusic && <p className="text-[11px] text-muted-foreground -mt-1">Drag the bar on the timeline to reposition it.</p>}

                      {/* Original audio */}
                      <div className="rounded-xl bg-accent/40 p-3 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Original Audio</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setMuteOriginal(v => !v)}
                            className="shrink-0 w-8 h-8 rounded-lg border border-border flex items-center justify-center text-sm transition hover:bg-accent"
                            style={muteOriginal ? { borderColor: PURPLE, background: `${PURPLE}15` } : {}}>
                            {muteOriginal ? "🔇" : "🔊"}
                          </button>
                          <div className="flex-1">
                            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                              <span>{muteOriginal ? "Muted" : "Volume"}</span><span>{Math.round(originalVolume * 100)}%</span>
                            </div>
                            <input type="range" min={0} max={1} step={0.05} value={originalVolume}
                              disabled={muteOriginal}
                              onChange={e => { const v = parseFloat(e.target.value); setOriginalVolume(v); if (videoRef.current) videoRef.current.volume = v; }}
                              className="w-full accent-purple-600 disabled:opacity-40" />
                          </div>
                        </div>
                      </div>

                      {/* Music kit */}
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Music Kit</p>
                        <div className="flex flex-wrap gap-2">
                          {MUSIC.map(m => (
                            <button key={m.key} onClick={() => setMusic(m)}
                              className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium transition"
                              style={music.key === m.key ? { borderColor: PURPLE, color: PURPLE, background: `${PURPLE}15` } : {}}>
                              {m.label}
                            </button>
                          ))}
                          {uploadedMusic.map(m => (
                            <span key={m.key} className="inline-flex items-center rounded-lg border border-border text-sm overflow-hidden"
                              style={music.key === m.key ? { borderColor: PURPLE, background: `${PURPLE}15` } : {}}>
                              <button onClick={() => setMusic(m)} className="px-3 py-1.5 font-medium" style={{ color: music.key === m.key ? PURPLE : undefined }}>♪ {m.label}</button>
                              <button onClick={() => { setUploadedMusic(prev => prev.filter(t => t.key !== m.key)); if (music.key === m.key) setMusic(MUSIC[0]); }}
                                className="px-2 py-1.5 text-muted-foreground hover:text-red-500 border-l border-border transition">✕</button>
                            </span>
                          ))}
                          <label className="px-3 py-1.5 rounded-lg border border-dashed border-border text-sm cursor-pointer text-muted-foreground hover:text-foreground transition">
                            {uploadingMusic ? "Uploading…" : "+ Upload"}
                            <input type="file" accept="audio/*" onChange={uploadMusic} className="hidden" disabled={uploadingMusic} />
                          </label>
                        </div>
                        <p className="text-[10px] text-muted-foreground/50">Only upload music you have the rights to use.</p>
                      </div>

                      {hasMusic && (
                        <div className="space-y-4 pt-1 border-t border-border">
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <label className="block">
                              <span className="text-[11px] text-muted-foreground">Volume {Math.round(volume * 100)}%</span>
                              <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v; }} className="w-full accent-purple-600 mt-1" />
                            </label>
                            <label className="block">
                              <span className="text-[11px] text-muted-foreground">Start from {fmt(songTrim)}</span>
                              <input type="range" min={0} max={60} step={1} value={songTrim} onChange={e => setSongTrim(parseInt(e.target.value))} className="w-full accent-purple-600 mt-1" />
                            </label>
                          </div>
                          <div className="flex gap-2">
                            {[{ k: "in", v: fadeIn, set: setFadeIn }, { k: "out", v: fadeOut, set: setFadeOut }].map(f => (
                              <button key={f.k} onClick={() => f.set(!f.v)}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium transition"
                                style={f.v ? { borderColor: PURPLE, color: PURPLE, background: `${PURPLE}15` } : {}}>
                                Fade {f.k}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {designerTab === "overlay" && (
                    <div className="space-y-3">
                      <button onClick={() => { setShowPex(true); setPexTab("pexels"); if (!pexItems.length) searchPexels(); }}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition"
                        style={{ background: GRAD }}>
                        <ImagePlus className="size-4" /> Add image or video overlay
                      </button>
                      <p className="text-[10px] text-muted-foreground">Search Pexels or import your own — added at the current playhead position.</p>

                      {overlays.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">On this video ({overlays.length})</p>
                          {overlays.map(o => (
                            <div key={o.id} onClick={() => setSelOverlay(o.id)}
                              className="flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer transition"
                              style={selOverlay === o.id ? { borderColor: PURPLE, background: `${PURPLE}10` } : { borderColor: "hsl(var(--border))" }}>
                              <img src={o.thumb} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium capitalize truncate">{o.mode} · {fmt(o.start)}</p>
                                <p className="text-[10px] text-muted-foreground">{o.length.toFixed(1)}s</p>
                              </div>
                              <button onClick={e => { e.stopPropagation(); deleteOverlay(o.id); }}
                                className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition">
                                <X className="size-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
            </div>
          </div>

          {/* Timeline (dark) — always visible */}
          <div className="-mt-5 rounded-2xl overflow-hidden border shadow-lg" style={{ background: TL_BG, borderColor: TL_LINE }}>
            <div className="h-1" style={{ background: GRAD }} />
            <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${TL_LINE}` }}>
              <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "#fff" }}>
                <Film className="size-3.5" style={{ color: TRACK_COLORS.video }} /> Timeline
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs tabular-nums" style={{ color: TL_TEXT }}>{fmt(time)} / {fmt(duration)}</span>
                <div className="flex items-center gap-0.5 rounded-lg overflow-hidden" style={{ border: `1px solid ${TL_LINE}` }}>
                  <button type="button" onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                    title="Zoom out" className="w-6 h-6 flex items-center justify-center hover:bg-white/10 transition text-white/80 disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={zoom <= 0.5}>
                    <ZoomOut className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => setZoom(1)} title="Reset zoom"
                    className="px-1.5 h-6 text-[10px] font-semibold tabular-nums hover:bg-white/10 transition" style={{ color: TL_TEXT, minWidth: 34 }}>
                    {Math.round(zoom * 100)}%
                  </button>
                  <button type="button" onClick={() => setZoom(z => Math.min(4, +(z + 0.25).toFixed(2)))}
                    title="Zoom in" className="w-6 h-6 flex items-center justify-center hover:bg-white/10 transition text-white/80 disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={zoom >= 4}>
                    <ZoomIn className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contextual Cut/Merge/Delete toolbar for whatever's selected on the timeline */}
            {(selectedClipId || musicSelected || selectedCaptionId != null) && (
              <div className="px-4 py-1.5 flex items-center gap-2 text-xs" style={{ borderBottom: `1px solid ${TL_LINE}`, background: "rgba(255,255,255,0.02)" }}>
                <span className="font-semibold" style={{ color: TL_TEXT }}>
                  {selectedClipId ? "Video clip" : musicSelected ? "Music" : "Caption"} selected
                </span>
                <div className="flex items-center gap-1.5 ml-2">
                  {selectedClipId && (
                    <>
                      <button onClick={cutVideoAtPlayhead} title="Cut at playhead" aria-label="Cut at playhead"
                        className="p-1.5 rounded border text-white/80 hover:text-white hover:border-purple-400 transition" style={{ borderColor: TL_LINE }}>
                        <Scissors className="size-3.5" />
                      </button>
                      <button onClick={() => selectedClipId && mergeVideoClip(selectedClipId)} disabled={!selectedClipId || !canMergeClip(selectedClipId)}
                        title="Merge" aria-label="Merge"
                        className="p-1.5 rounded border text-white/80 hover:text-white hover:border-purple-400 transition disabled:opacity-30 disabled:cursor-not-allowed" style={{ borderColor: TL_LINE }}>
                        <Combine className="size-3.5" />
                      </button>
                      <button onClick={() => selectedClipId && deleteVideoClip(selectedClipId)} disabled={videoClips.length <= 1}
                        title="Delete" aria-label="Delete"
                        className="p-1.5 rounded border text-red-400 hover:text-red-300 hover:border-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed" style={{ borderColor: TL_LINE }}>
                        <Trash2 className="size-3.5" />
                      </button>
                    </>
                  )}
                  {musicSelected && (
                    <button onClick={removeMusic} title="Delete" aria-label="Delete"
                      className="p-1.5 rounded border text-red-400 hover:text-red-300 hover:border-red-400 transition" style={{ borderColor: TL_LINE }}>
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                  {selectedCaptionId != null && (
                    <>
                      <button onClick={() => { splitSeg(selectedCaptionId); setSelectedCaptionId(null); }}
                        title="Split" aria-label="Split"
                        className="p-1.5 rounded border text-white/80 hover:text-white hover:border-purple-400 transition" style={{ borderColor: TL_LINE }}>
                        <Scissors className="size-3.5" />
                      </button>
                      <button onClick={() => { mergeUp(selectedCaptionId); setSelectedCaptionId(null); }} disabled={segments.findIndex(s => s.id === selectedCaptionId) <= 0}
                        title="Merge up" aria-label="Merge up"
                        className="p-1.5 rounded border text-white/80 hover:text-white hover:border-purple-400 transition disabled:opacity-30 disabled:cursor-not-allowed" style={{ borderColor: TL_LINE }}>
                        <Combine className="size-3.5" />
                      </button>
                      <button onClick={() => { deleteSeg(selectedCaptionId); setSelectedCaptionId(null); }}
                        title="Delete" aria-label="Delete"
                        className="p-1.5 rounded border text-red-400 hover:text-red-300 hover:border-red-400 transition" style={{ borderColor: TL_LINE }}>
                        <Trash2 className="size-3.5" />
                      </button>
                    </>
                  )}
                  <button onClick={() => { setSelectedClipId(null); setMusicSelected(false); setSelectedCaptionId(null); }}
                    className="px-2 py-1 rounded text-white/50 hover:text-white transition">✕</button>
                </div>
              </div>
            )}

            <div className="flex">
              <div className="shrink-0 w-20 text-[11px]" style={{ borderRight: `1px solid ${TL_LINE}`, color: TL_TEXT }}>
                <div className="h-5" style={{ borderBottom: `1px solid ${TL_LINE}` }} />
                <div className="h-10 flex items-center px-2.5" style={{ borderBottom: `1px solid ${TL_LINE}`, borderLeft: `2px solid ${TRACK_COLORS.overlays}` }}>
                  <button onClick={() => { setShowPex(true); setPexTab("pexels"); if (!pexItems.length) searchPexels(); }} className="text-[10px] font-semibold flex items-center gap-1 hover:opacity-80 transition" style={{ color: TRACK_COLORS.overlays }}>
                    <ImagePlus className="size-3" /> Add
                  </button>
                </div>
                <div className="h-10 flex items-center gap-1.5 px-2.5" style={{ borderBottom: `1px solid ${TL_LINE}`, borderLeft: `2px solid ${TRACK_COLORS.video}` }}>
                  <Film className="size-3" style={{ color: TRACK_COLORS.video }} /> Video
                  {videoClips.length > 1 && (
                    <span className="text-[9px] text-muted-foreground ml-auto pr-1">{videoClips.length} clips</span>
                  )}
                </div>
                <div className="h-10 flex items-center gap-1.5 px-2.5" style={{ borderBottom: `1px solid ${TL_LINE}`, borderLeft: `2px solid ${TRACK_COLORS.captions}` }}><Type className="size-3" style={{ color: TRACK_COLORS.captions }} /> Captions</div>
                <div className="h-10 flex items-center gap-1.5 px-2.5" style={{ borderLeft: `2px solid ${TRACK_COLORS.music}` }}><MusicIcon className="size-3" style={{ color: TRACK_COLORS.music }} /> Music</div>
              </div>
              <div ref={timelineRef} onClick={onTimelineClick} onWheel={onTimelineWheel}
                onMouseMove={onTimelineHover} onMouseLeave={() => setHoverTime(null)}
                className="relative overflow-x-auto cursor-pointer select-none flex-1 thick-scrollbar">
                <div ref={tracksRef} style={{
                  width: trackWidth, minWidth: "100%", position: "relative",
                  backgroundImage: `linear-gradient(to right, ${TL_LINE}80 1px, transparent 1px)`,
                  backgroundSize: `${pxPerSec}px 100%`,
                }}>
                  <div className="h-5 relative text-[10px]" style={{ borderBottom: `1px solid ${TL_LINE}`, color: TL_TEXT }}>
                    {Array.from({ length: Math.ceil(duration) + 1 }).map((_, s) => (<span key={s} className="absolute top-0.5" style={{ left: s * pxPerSec + 3 }}>{s}s</span>))}
                  </div>
                  {/* Overlays */}
                  <div className="h-10 relative transition-colors hover:bg-white/[0.03]" style={{ borderBottom: `1px solid ${TL_LINE}`, background: `${TRACK_COLORS.overlays}0d` }}>
                    {overlays.map(o => (
                      <div key={o.id} onPointerDown={e => { e.stopPropagation(); const el = tracksRef.current!; const rect = el.getBoundingClientRect(); const blockX = o.start * pxPerSec; setDragOverlay({ id: o.id, dx: (e.clientX - rect.left + el.scrollLeft) - blockX }); setSelOverlay(o.id); }}
                        className="absolute top-1 bottom-1 rounded overflow-hidden cursor-grab active:cursor-grabbing border-2 transition-transform hover:scale-[1.02] active:scale-100"
                        style={{ left: o.start * pxPerSec, width: Math.max(o.length * pxPerSec, 16), borderColor: selOverlay === o.id ? PURPLE : "transparent" }}>
                        <img src={o.thumb} alt="" className="w-full h-full object-cover pointer-events-none" />
                        {o.kind === "video" && <span className="absolute top-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 rounded">▶</span>}
                        <button onClick={e => { e.stopPropagation(); deleteOverlay(o.id); }} onPointerDown={e => e.stopPropagation()} className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-black/70 text-white text-[9px] leading-none hover:bg-red-500">✕</button>
                      </div>
                    ))}
                  </div>
                  {/* Video — frame-by-frame filmstrip instead of a solid block */}
                  <div className="h-10 p-1" style={{ borderBottom: `1px solid ${TL_LINE}`, background: `${TRACK_COLORS.video}0d` }}>
                    <div className="relative h-full rounded-lg overflow-hidden" style={{ background: "#111" }}>
                      {filmstrip.length > 0 && (
                        <div className="absolute inset-0 flex">
                          {filmstrip.map((src, i) => (
                            <img key={i} src={src} alt="" draggable={false}
                              className="h-full object-cover shrink-0 select-none"
                              style={{ width: `${100 / filmstrip.length}%` }} />
                          ))}
                        </div>
                      )}
                      {filmstripLoading && filmstrip.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center gap-1.5 text-[10px] text-white/80" style={{ background: GRAD }}>
                          <Loader2 className="size-3 animate-spin" /> Generating filmstrip…
                        </div>
                      )}
                      <span className="absolute bottom-0.5 left-1.5 text-[9px] text-white font-medium px-1 rounded bg-black/60 pointer-events-none max-w-[70%] truncate">{file?.name || "video.mp4"}</span>
                      {duration > 0 && (() => {
                        const sorted = [...videoClips].sort((a, b) => a.start - b.start);
                        const gaps: { start: number; end: number }[] = [];
                        let cursor = 0;
                        for (const c of sorted) { if (c.start > cursor) gaps.push({ start: cursor, end: c.start }); cursor = Math.max(cursor, c.end); }
                        if (cursor < duration) gaps.push({ start: cursor, end: duration });
                        return (
                          <>
                            {gaps.map((g, i) => (
                              <div key={i} className="absolute inset-y-0 bg-black/70 pointer-events-none"
                                style={{ left: `${(g.start / duration) * 100}%`, width: `${((g.end - g.start) / duration) * 100}%` }} />
                            ))}
                            {sorted.map(c => (
                              <div key={c.id} onClick={e => { e.stopPropagation(); selectClip(c.id); }}
                                className="absolute inset-y-0 cursor-pointer"
                                style={{
                                  left: `${(c.start / duration) * 100}%`, width: `${((c.end - c.start) / duration) * 100}%`,
                                  border: selectedClipId === c.id ? `2px solid ${PURPLE}` : "2px solid transparent",
                                  boxSizing: "border-box",
                                }} />
                            ))}
                            {sorted.map(c => (
                              <React.Fragment key={`${c.id}-handles`}>
                                <div onPointerDown={e => { e.stopPropagation(); selectClip(c.id); setDragTrim({ clipId: c.id, edge: "start" }); }}
                                  className="absolute inset-y-0 w-3 -ml-1.5 cursor-ew-resize z-10 flex items-center justify-center"
                                  style={{ left: `${(c.start / duration) * 100}%` }}>
                                  <div className="w-1 h-6 rounded-full" style={{ background: PURPLE }} />
                                </div>
                                <div onPointerDown={e => { e.stopPropagation(); selectClip(c.id); setDragTrim({ clipId: c.id, edge: "end" }); }}
                                  className="absolute inset-y-0 w-3 -ml-1.5 cursor-ew-resize z-10 flex items-center justify-center"
                                  style={{ left: `${(c.end / duration) * 100}%` }}>
                                  <div className="w-1 h-6 rounded-full" style={{ background: PURPLE }} />
                                </div>
                              </React.Fragment>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  {/* Transcribe — waveform behind the caption chips */}
                  <div className="h-10 relative" style={{ borderBottom: `1px solid ${TL_LINE}`, background: `${TRACK_COLORS.captions}0d` }}>
                    {waveformPeaks.length > 0 && <Waveform peaks={waveformPeaks} width={trackWidth} height={40} />}
                    {waveformLoading && waveformPeaks.length === 0 && (
                      <span className="absolute inset-0 flex items-center px-2 text-[9px] text-muted-foreground/60">Decoding audio…</span>
                    )}
                    {segments.map(s => (
                      <div key={s.id} title={s.text}
                        onClick={e => { e.stopPropagation(); seek(s.start); selectCaptionChip(s.id); }}
                        className="absolute top-1 bottom-1 rounded overflow-hidden text-[9px] px-1 flex items-center cursor-pointer transition-transform hover:scale-[1.03] hover:z-10"
                        style={{
                          left: s.start * pxPerSec, width: Math.max((s.end - s.start) * pxPerSec, 10),
                          background: activeId === s.id ? PURPLE : "hsl(var(--primary) / 0.55)", color: "hsl(var(--primary-foreground))",
                          boxShadow: selectedCaptionId === s.id ? `0 0 0 2px white` : activeId === s.id ? `0 0 0 1px ${PURPLE}` : undefined,
                        }}>
                        {s.text.slice(0, 12)}
                      </div>
                    ))}
                  </div>
                  {/* Music */}
                  <div className="h-10 relative transition-colors hover:bg-white/[0.03]" style={{ background: `${TRACK_COLORS.music}0d` }}>
                    {hasMusic && (
                      <div onClick={e => { e.stopPropagation(); selectMusicTrack(); }}
                        onPointerDown={e => { e.stopPropagation(); selectMusicTrack(); setDragMusic(true); }}
                        className="absolute top-1 bottom-1 rounded cursor-grab active:cursor-grabbing flex items-center px-2 text-[10px] text-white font-semibold overflow-hidden transition-transform hover:scale-[1.02] active:scale-100"
                        style={{
                          left: musicStart * pxPerSec, width: Math.max(((musicEnd || duration) - musicStart) * pxPerSec, 40), background: GRAD,
                          outline: musicSelected ? "2px solid white" : "none", outlineOffset: -2,
                        }}>
                        ♪ {music.label}
                        <div onPointerDown={e => { e.stopPropagation(); selectMusicTrack(); setDragMusicEnd(true); }}
                          className="absolute inset-y-0 right-0 w-2 cursor-ew-resize" />
                      </div>
                    )}
                  </div>

                  {/* Hover scrub preview — a faint guideline + time readout that follows the cursor */}
                  {hoverTime != null && !scrubbingPlayhead && !dragOverlay && !dragMusic && (
                    <>
                      <div className="absolute top-0 bottom-0 w-px bg-white/30 pointer-events-none" style={{ left: hoverTime * pxPerSec }} />
                      <div className="absolute -top-6 -translate-x-1/2 text-[9px] font-semibold text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap"
                        style={{ left: hoverTime * pxPerSec, background: "#000" }}>
                        {fmt(hoverTime)}
                      </div>
                    </>
                  )}

                  {/* Playhead — draggable handle for scrubbing, plus the sweep line */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-20" style={{ left: time * pxPerSec, boxShadow: "0 0 6px rgba(239,68,68,0.8)" }} />
                  <div onPointerDown={e => { e.stopPropagation(); setScrubbingPlayhead(true); }}
                    className="absolute -top-0.5 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 border-2 border-white/90 cursor-ew-resize z-30 transition-transform hover:scale-125 active:scale-110"
                    style={{ left: time * pxPerSec, boxShadow: "0 0 8px rgba(239,68,68,0.9)" }}
                    title="Drag to scrub" />
                </div>
              </div>
            </div>
          </div>

      {/* Media browser (Pexels + Upload) */}
      {showPex && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPex(false)}>
          <div className="bg-card text-foreground rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col border border-border shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-4 pt-4 flex items-center gap-2 border-b border-border pb-0">
              {(["pexels", "upload"] as const).map(tab => (
                <button key={tab} onClick={() => setPexTab(tab)}
                  className="px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition capitalize"
                  style={pexTab === tab ? { borderColor: PURPLE, color: PURPLE } : { borderColor: "transparent" }}>
                  {tab === "pexels" ? "Pexels" : "Upload yours"}
                </button>
              ))}
              <button onClick={() => setShowPex(false)} className="ml-auto px-2 text-muted-foreground text-xl pb-2 hover:text-foreground transition">✕</button>
            </div>

            {pexTab === "pexels" && (
              <>
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <input value={pexQ} onChange={e => setPexQ(e.target.value)} onKeyDown={e => e.key === "Enter" && searchPexels()}
                    placeholder="Search Pexels…"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background outline-none text-sm text-foreground placeholder:text-muted-foreground" />
                  <div className="flex gap-1">
                    {(["photo", "video"] as const).map(t => (
                      <button key={t} onClick={() => setPexType(t)}
                        className="px-3 py-2 rounded-lg border border-border text-sm capitalize font-medium transition"
                        style={pexType === t ? { borderColor: PURPLE, color: PURPLE, background: `${PURPLE}15` } : {}}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <button onClick={searchPexels} className="px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition" style={{ background: GRAD }}>Search</button>
                </div>
                <div className="p-4 overflow-y-auto">
                  {pexLoading ? <p className="text-center text-muted-foreground text-sm py-10">Searching…</p> : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {pexItems.map(it => (
                        <button key={it.id} onClick={() => addOverlay(it)}
                          className="relative aspect-[9/16] rounded-xl overflow-hidden border border-border hover:border-purple-400 transition">
                          <img src={it.thumb} alt="" className="w-full h-full object-cover" />
                          {it.kind === "video" && <span className="absolute top-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded">▶ video</span>}
                        </button>
                      ))}
                      {!pexItems.length && <p className="col-span-full text-center text-muted-foreground text-sm py-10">Search Pexels for images or videos to overlay.</p>}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground/60 mt-3">Media from Pexels — free to use.</p>
                </div>
              </>
            )}

            {pexTab === "upload" && (
              <div className="p-8 flex flex-col items-center justify-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${PURPLE}15` }}>🖼️</div>
                <p className="font-bold text-foreground">Upload an image or video</p>
                <p className="text-sm text-muted-foreground text-center max-w-xs">It will be added at the current playhead position as an overlay.</p>
                <label className="cursor-pointer px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition shadow-sm" style={{ background: uploadingOverlay ? "hsl(var(--primary) / 0.5)" : GRAD }}>
                  {uploadingOverlay ? "Uploading…" : "Choose file"}
                  <input type="file" accept="image/*,video/*" onChange={uploadOverlayFile} className="hidden" disabled={uploadingOverlay} />
                </label>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <p className="text-[11px] text-muted-foreground/60">Supports JPG, PNG, GIF, MP4, MOV and more.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects slide-over panel */}
      {showProjects && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setShowProjects(false)} />
          <div className="w-80 bg-card h-full shadow-2xl flex flex-col overflow-hidden border-l border-border">
            <div className="px-5 py-4 flex items-center justify-between shrink-0" style={{ background: GRAD }}>
              <div>
                <h2 className="font-bold text-white text-sm">My Projects</h2>
                <p className="text-white/70 text-[11px]">{projects.length} saved project{projects.length !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setShowProjects(false)} className="text-white/80 hover:text-white text-xl transition">✕</button>
            </div>
            {loadingProjects ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
            ) : projects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm px-6 text-center">
                <span className="text-3xl">📁</span>
                <p className="font-semibold text-foreground">No saved projects yet</p>
                <p className="text-xs">Save a project from the editor and it will appear here.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {projects.map(p => (
                  <div key={p.id} className="flex items-center hover:bg-accent transition group">
                    <button onClick={() => renamingId !== p.id && loadProject(p)} className="flex-1 p-4 text-left flex gap-3 items-center min-w-0">
                      <div className="w-12 shrink-0 rounded-lg overflow-hidden bg-muted" style={{ aspectRatio: "9/16" }}>
                        <video src={p.video_url} muted preload="metadata" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {renamingId === p.id ? (
                          <input autoFocus value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") renameProject(p.id, renameValue); if (e.key === "Escape") setRenamingId(null); }}
                            onClick={e => e.stopPropagation()}
                            className="w-full text-sm font-semibold text-foreground border-b border-purple-400 outline-none bg-transparent" />
                        ) : (
                          <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(p.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {p.data?.segments?.length > 0 && (
                          <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--primary))" }}>{p.data.segments.length} caption lines</p>
                        )}
                      </div>
                      {renamingId !== p.id && <span className="shrink-0 text-xs font-semibold" style={{ color: PURPLE }}>Open →</span>}
                    </button>
                    <div className="shrink-0 mr-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      {renamingId === p.id ? (
                        <button onClick={e => { e.stopPropagation(); renameProject(p.id, renameValue); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition"
                          style={{ color: PURPLE }} title="Save name">✓</button>
                      ) : (
                        <button onClick={e => { e.stopPropagation(); setRenamingId(p.id); setRenameValue(p.name); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-purple-500 hover:bg-accent transition"
                          title="Rename">✏️</button>
                      )}
                      <button onClick={e => deleteProject(p.id, e)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition"
                        title="Delete project">🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export preview modal */}
      {exportPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center gap-4 p-6 w-full max-w-sm border border-border">
            <p className="font-bold text-foreground text-lg">Export Preview</p>
            <video src={exportPreviewUrl} controls autoPlay className="w-full rounded-xl" style={{ maxHeight: "55vh" }} />

            {converting && (
              <div className="w-full space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Converting to MP4…</span><span>{convertProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-accent overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-200" style={{ width: `${convertProgress}%`, background: GRAD }} />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 w-full">
              <button onClick={convertToMp4} disabled={converting}
                className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition hover:opacity-90 shadow-sm"
                style={{ background: GRAD }}>
                {converting ? `Converting… ${convertProgress}%` : "Download as MP4"}
              </button>
              <button onClick={() => { const a = document.createElement("a"); a.href = exportPreviewUrl; a.download = `studio-export-${Date.now()}.webm`; a.click(); }}
                disabled={converting}
                className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground disabled:opacity-50 hover:bg-accent transition">
                Download as WebM
              </button>
              <button onClick={() => { URL.revokeObjectURL(exportPreviewUrl); setExportPreviewUrl(null); setExportBlob(null); }}
                disabled={converting}
                className="w-full py-2 text-xs text-muted-foreground disabled:opacity-50 hover:text-foreground transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
