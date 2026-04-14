"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useBrandKitStore } from "@/lib/store";
import { FONT_PAIRS } from "@/lib/utils/font-pairs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Type, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FontDefinition } from "@/lib/types";

type Mode = "assisted" | "manual";
type FontSource = "google" | "upload";

// Build a Google Fonts URL from a font name
function buildGoogleFontsUrl(name: string): string {
  if (!name.trim()) return "";
  const family = name.trim().replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@300;400;500;600;700&display=swap`;
}

// Dynamically load a Google Font into the builder document for live preview
function loadGoogleFontInBuilder(url: string) {
  if (!url || typeof document === "undefined") return;
  const id = `gf-${btoa(url).slice(0, 12)}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

// Inject a @font-face rule for a custom uploaded font into the builder
function loadCustomFontInBuilder(
  name: string,
  dataUrl: string,
  format: string
) {
  if (typeof document === "undefined") return;
  const id = `cf-${btoa(name).slice(0, 12)}`;
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `@font-face { font-family: '${name}'; src: url('${dataUrl}') format('${format}'); font-display: swap; }`;
  document.head.appendChild(style);
}

// Detect file extension → format
function detectFontFormat(
  filename: string
): "woff2" | "woff" | "ttf" | "otf" {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "woff2") return "woff2";
  if (ext === "woff") return "woff";
  if (ext === "otf") return "otf";
  return "ttf";
}

export default function TypographyStep() {
  const typography = useBrandKitStore((s) => s.data.typography);
  const setTypography = useBrandKitStore((s) => s.setTypography);
  const updateScaleEntry = useBrandKitStore((s) => s.updateScaleEntry);

  // Determine initial mode from current typography (custom font or non-preset = manual)
  const isPresetPair = FONT_PAIRS.some(
    (p) =>
      p.display.name === typography.displayFont.name &&
      p.body.name === typography.bodyFont.name
  );
  const hasCustom =
    typography.displayFont.customFontData ||
    typography.bodyFont.customFontData;

  const [mode, setMode] = useState<Mode>(
    hasCustom || !isPresetPair ? "manual" : "assisted"
  );

  const currentPairId = FONT_PAIRS.find(
    (p) =>
      p.display.name === typography.displayFont.name &&
      p.body.name === typography.bodyFont.name
  )?.id;

  const handlePairChange = (pairId: string) => {
    const pair = FONT_PAIRS.find((p) => p.id === pairId);
    if (pair) {
      setTypography({
        displayFont: pair.display,
        bodyFont: pair.body,
      });
      loadGoogleFontInBuilder(pair.display.googleFontsUrl);
      loadGoogleFontInBuilder(pair.body.googleFontsUrl);
    }
  };

  // Ensure currently-set fonts are loaded in builder for live preview
  useEffect(() => {
    if (typography.displayFont.customFontData) {
      loadCustomFontInBuilder(
        typography.displayFont.name,
        typography.displayFont.customFontData,
        typography.displayFont.customFontFormat || "woff2"
      );
    } else if (typography.displayFont.googleFontsUrl) {
      loadGoogleFontInBuilder(typography.displayFont.googleFontsUrl);
    }
    if (typography.bodyFont.customFontData) {
      loadCustomFontInBuilder(
        typography.bodyFont.name,
        typography.bodyFont.customFontData,
        typography.bodyFont.customFontFormat || "woff2"
      );
    } else if (typography.bodyFont.googleFontsUrl) {
      loadGoogleFontInBuilder(typography.bodyFont.googleFontsUrl);
    }
  }, [typography.displayFont, typography.bodyFont]);

  return (
    <div className="max-w-md space-y-7">
      {/* Heading */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#D0BEA5]/60 mb-2 font-medium">
          Step 04
        </p>
        <h2 className="text-2xl font-light tracking-tight mb-1 text-[#FFF4E3]">
          <span className="font-semibold">Typography</span>
        </h2>
        <p className="text-sm text-[#FFF4E3]/65">
          Pick a suggested pairing or upload your own fonts.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="inline-flex p-1 rounded-full bg-[rgba(59,33,20,0.6)] backdrop-blur-md border border-[rgba(208,190,165,0.15)] shadow-[inset_0_1px_0_rgba(0,0,0,0.2)]">
        {(
          [
            { id: "assisted", label: "Suggested pairings", Icon: Sparkles },
            { id: "manual", label: "Upload your own", Icon: Type },
          ] as const
        ).map(({ id, label, Icon }) => {
          const isActive = mode === id;
          return (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={cn(
                "relative px-4 py-2 rounded-full text-xs font-semibold transition-colors duration-150 whitespace-nowrap flex items-center gap-1.5",
                isActive
                  ? "text-[#3B2114]"
                  : "text-[#D0BEA5]/50 hover:text-[#D0BEA5]"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="typo-toggle-pill"
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-[#D0BEA5] shadow-[0_2px_10px_rgba(208,190,165,0.35)]"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className="relative size-3" />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Assisted Mode ── */}
      {mode === "assisted" && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <Label>Font Pair</Label>
          {FONT_PAIRS.map((pair) => {
            const isActive = currentPairId === pair.id;
            return (
              <button
                key={pair.id}
                onClick={() => handlePairChange(pair.id)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all backdrop-blur-sm",
                  isActive
                    ? "border-[rgba(208,190,165,0.45)] bg-[rgba(208,190,165,0.08)] shadow-[0_4px_16px_rgba(208,190,165,0.14)]"
                    : "border-[rgba(208,190,165,0.1)] hover:border-[rgba(208,190,165,0.2)] bg-[rgba(255,244,227,0.02)] hover:bg-[rgba(255,244,227,0.04)]"
                )}
              >
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <span
                    className="text-lg text-[#FFF4E3] tracking-tight"
                    style={{
                      fontFamily: `'${pair.display.name}', ${pair.display.fallback}`,
                      fontWeight: 500,
                    }}
                  >
                    {pair.display.name}
                  </span>
                  {isActive && (
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#C9A961] font-semibold">
                      Selected
                    </span>
                  )}
                </div>
                <div
                  className="text-sm text-[#FFF4E3]/60 leading-relaxed"
                  style={{
                    fontFamily: `'${pair.body.name}', ${pair.body.fallback}`,
                    fontWeight: 300,
                  }}
                >
                  The quick brown fox jumps over the lazy dog.
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Manual Mode ── */}
      {mode === "manual" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <FontSlot
            label="Display Font"
            description="Used for headings and brand titles"
            font={typography.displayFont}
            onChange={(font) => setTypography({ displayFont: font })}
          />
          <FontSlot
            label="Body Font"
            description="Used for paragraphs and general text"
            font={typography.bodyFont}
            onChange={(font) => setTypography({ bodyFont: font })}
          />
        </div>
      )}

      {/* Type Scale — shown in both modes */}
      <div className="space-y-3">
        <Label>Type Scale</Label>
        {typography.scale.map((entry, i) => (
          <div
            key={entry.label}
            className="p-3 rounded-xl bg-[rgba(255,244,227,0.03)] backdrop-blur-md border border-[rgba(208,190,165,0.1)] shadow-[inset_0_1px_0_rgba(255,244,227,0.03)] space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#D0BEA5]/70 font-medium">
                {entry.label}
              </span>
              <span className="text-[9px] text-[#D0BEA5]/40 font-mono tracking-wider">
                {entry.fontSize} · {entry.fontWeight} · {entry.lineHeight}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                value={entry.fontSize}
                onChange={(e) =>
                  updateScaleEntry(i, { fontSize: e.target.value })
                }
                className="h-8 text-xs"
                placeholder="16px"
              />
              <Input
                type="number"
                value={entry.fontWeight}
                onChange={(e) =>
                  updateScaleEntry(i, {
                    fontWeight: parseInt(e.target.value) || 400,
                  })
                }
                className="h-8 text-xs"
                step={100}
                min={100}
                max={900}
              />
              <Input
                value={entry.lineHeight}
                onChange={(e) =>
                  updateScaleEntry(i, { lineHeight: e.target.value })
                }
                className="h-8 text-xs"
                placeholder="1.5"
              />
            </div>
            <input
              value={entry.sampleText}
              onChange={(e) =>
                updateScaleEntry(i, { sampleText: e.target.value })
              }
              className="w-full bg-transparent border-b border-[rgba(208,190,165,0.1)] pb-1 text-xs text-[#FFF4E3]/70 outline-none focus:text-[#FFF4E3] focus:border-[rgba(208,190,165,0.45)] transition-all"
              placeholder="Sample text"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Single font slot (used twice — for display + body font)
// ──────────────────────────────────────────────────────────────
function FontSlot({
  label,
  description,
  font,
  onChange,
}: {
  label: string;
  description: string;
  font: FontDefinition;
  onChange: (font: FontDefinition) => void;
}) {
  const [source, setSource] = useState<FontSource>(
    font.customFontData ? "upload" : "google"
  );
  const [googleName, setGoogleName] = useState(
    font.customFontData ? "" : font.name
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const applyGoogleFont = useCallback(
    (name: string) => {
      setGoogleName(name);
      if (!name.trim()) return;
      const url = buildGoogleFontsUrl(name);
      onChange({
        ...font,
        name: name.trim(),
        googleFontsUrl: url,
        fallback: "sans-serif",
        customFontData: undefined,
        customFontFormat: undefined,
      });
    },
    [font, onChange]
  );

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const format = detectFontFormat(file.name);
      const name = file.name.replace(/\.[^.]+$/, "");
      onChange({
        ...font,
        name,
        customFontData: dataUrl,
        customFontFormat: format,
        googleFontsUrl: "",
        fallback: "sans-serif",
      });
    };
    reader.readAsDataURL(file);
  };

  const clearCustom = () => {
    onChange({
      ...font,
      name: "Inter",
      googleFontsUrl: buildGoogleFontsUrl("Inter"),
      customFontData: undefined,
      customFontFormat: undefined,
      fallback: "sans-serif",
    });
    setSource("google");
    setGoogleName("Inter");
  };

  return (
    <div className="p-4 rounded-xl bg-[rgba(255,244,227,0.03)] backdrop-blur-md border border-[rgba(208,190,165,0.1)] shadow-[inset_0_1px_0_rgba(255,244,227,0.03)] space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#D0BEA5]/70 font-medium">
            {label}
          </p>
          <p className="text-[10px] text-[#FFF4E3]/40 mt-0.5">{description}</p>
        </div>
      </div>

      {/* Source sub-toggle */}
      <div className="inline-flex p-0.5 rounded-full bg-[rgba(59,33,20,0.5)] border border-[rgba(208,190,165,0.12)] text-[10px]">
        {(
          [
            { id: "google" as const, label: "Google Font" },
            { id: "upload" as const, label: "Upload file" },
          ]
        ).map((opt) => {
          const isActive = source === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSource(opt.id)}
              className={cn(
                "relative px-3 py-1 rounded-full transition-colors duration-150 font-semibold",
                isActive
                  ? "text-[#3B2114]"
                  : "text-[#D0BEA5]/50 hover:text-[#D0BEA5]"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={`font-source-pill-${label}`}
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-[#D0BEA5]"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Google Font input */}
      {source === "google" && (
        <div className="space-y-2 animate-in fade-in duration-150">
          <Input
            value={googleName}
            onChange={(e) => applyGoogleFont(e.target.value)}
            placeholder="e.g. Inter, Playfair Display"
            className="text-sm"
          />
          <p className="text-[10px] text-[#FFF4E3]/40">
            Type any Google Font name — loaded automatically.
          </p>
        </div>
      )}

      {/* Upload input */}
      {source === "upload" && (
        <div className="space-y-2 animate-in fade-in duration-150">
          {font.customFontData ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(208,190,165,0.08)] border border-[rgba(208,190,165,0.22)]">
              <div className="min-w-0">
                <p className="text-sm text-[#FFF4E3] truncate">{font.name}</p>
                <p className="text-[9px] text-[#D0BEA5]/60 uppercase tracking-wider mt-0.5">
                  Custom · {font.customFontFormat}
                </p>
              </div>
              <button
                onClick={clearCustom}
                className="size-7 rounded-full flex items-center justify-center text-[#D0BEA5]/50 hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-1.5 p-5 border-2 border-dashed border-[rgba(208,190,165,0.18)] rounded-lg cursor-pointer hover:border-[rgba(208,190,165,0.55)] hover:bg-[rgba(208,190,165,0.05)] transition-all">
              <Upload className="size-4 text-[#D0BEA5]/60" />
              <span className="text-xs text-[#FFF4E3]/60">
                Drop font file or click
              </span>
              <span className="text-[9px] text-[#D0BEA5]/50 tracking-[0.2em] uppercase font-medium">
                WOFF2 · WOFF · TTF · OTF
              </span>
              <input
                ref={fileRef}
                type="file"
                accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Live preview */}
      <div className="pt-1 border-t border-[rgba(208,190,165,0.08)]">
        <p
          className="text-2xl text-[#FFF4E3] truncate"
          style={{
            fontFamily: `'${font.name}', ${font.fallback}`,
            fontWeight: 500,
          }}
        >
          The quick brown fox
        </p>
        <p
          className="text-xs text-[#FFF4E3]/50 mt-1"
          style={{
            fontFamily: `'${font.name}', ${font.fallback}`,
            fontWeight: 300,
          }}
        >
          {font.name || "No font selected"} — jumps over the lazy dog 0123456789
        </p>
      </div>
    </div>
  );
}
