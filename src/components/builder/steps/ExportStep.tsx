"use client";

import { useState } from "react";
import { useBrandKitStore } from "@/lib/store";
import { generateBrandKit } from "@/lib/generator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplateId } from "@/lib/types";

// ──────────────────────────────────────────────────────────────
// Mini-preview thumbnails that actually show the LAYOUT difference
// (not gradient swatches). These visualize navigation + overlay.
// ──────────────────────────────────────────────────────────────
function EditorialThumb({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 40" className="w-full h-full">
      <rect width="64" height="40" fill={color} rx="4" />
      {/* grain texture dots */}
      <g opacity="0.15" fill="#FFF4E3">
        {Array.from({ length: 18 }).map((_, i) => (
          <circle
            key={i}
            cx={(i * 13.7) % 64}
            cy={(i * 7.3) % 40}
            r="0.4"
          />
        ))}
      </g>
      {/* serif "Aa" center */}
      <text
        x="32"
        y="24"
        fill="#FFF4E3"
        fontSize="11"
        fontFamily="Georgia, serif"
        textAnchor="middle"
        fontWeight="400"
      >
        Aa
      </text>
      {/* pill nav at bottom center */}
      <rect x="24" y="32" width="16" height="3" rx="1.5" fill="#FFF4E3" opacity="0.8" />
    </svg>
  );
}

function ModernThumb({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 40" className="w-full h-full">
      <rect width="64" height="40" fill={color} rx="4" />
      {/* grid overlay */}
      <g opacity="0.15" stroke="#FFF4E3" strokeWidth="0.3">
        <line x1="16" y1="0" x2="16" y2="40" />
        <line x1="32" y1="0" x2="32" y2="40" />
        <line x1="48" y1="0" x2="48" y2="40" />
        <line x1="0" y1="13" x2="64" y2="13" />
        <line x1="0" y1="27" x2="64" y2="27" />
      </g>
      {/* sans "Aa" left-aligned */}
      <text
        x="8"
        y="24"
        fill="#FFF4E3"
        fontSize="11"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
      >
        Aa
      </text>
      {/* side dot nav on right */}
      <circle cx="58" cy="15" r="0.8" fill="#FFF4E3" opacity="0.4" />
      <circle cx="58" cy="20" r="1" fill="#FFF4E3" opacity="1" />
      <circle cx="58" cy="25" r="0.8" fill="#FFF4E3" opacity="0.4" />
    </svg>
  );
}

export default function ExportStep() {
  const data = useBrandKitStore((s) => s.data);
  const setTemplate = useBrandKitStore((s) => s.setTemplate);
  const [fileName, setFileName] = useState(
    `${data.brandInfo.name || "brand"}-kit`.toLowerCase().replace(/\s+/g, "-")
  );
  const [exported, setExported] = useState(false);

  // If the user has a palette, both thumbs use the user's primary.
  // Otherwise each thumb keeps its own template-character color so the
  // selection doesn't recolor the other card.
  const userPrimary = data.colors.swatches[0]?.hex;

  const layouts: {
    id: TemplateId;
    name: string;
    tagline: string;
    bullets: string[];
    defaultColor: string;
    Thumb: React.ComponentType<{ color: string }>;
  }[] = [
    {
      id: "warm-earth",
      name: "Editorial",
      tagline: "Warm, storied, magazine-like",
      bullets: [
        "Pill navigation at the bottom",
        "Film grain texture overlay",
        "Serif display treatment for headings",
      ],
      defaultColor: "#3B2114",
      Thumb: EditorialThumb,
    },
    {
      id: "corporate-blue",
      name: "Modern",
      tagline: "Clean, geometric, contemporary",
      bullets: [
        "Side dot navigation on the right",
        "Subtle grid overlay",
        "Sans-serif treatment for headings",
      ],
      defaultColor: "#1a2a4a",
      Thumb: ModernThumb,
    },
  ];

  const handleExport = () => {
    const html = generateBrandKit(data);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="max-w-md space-y-7">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#D0BEA5]/60 mb-2 font-medium">
          Step 08
        </p>
        <h2 className="text-2xl font-light tracking-tight mb-1 text-[#FFF4E3]">
          <span className="font-semibold">Export</span>
        </h2>
        <p className="text-sm text-[#FFF4E3]/50">
          Pick a layout format and download your brand kit.
        </p>
      </div>

      {/* Layout selector — reframed as "Layout Format" */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Label>Layout Format</Label>
            <div className="flex items-start gap-1.5 mt-1.5 text-[11px] text-[#FFF4E3]/45 leading-relaxed">
              <Info className="size-3 mt-0.5 flex-shrink-0 text-[#D0BEA5]/60" />
              <span>
                Your colors, fonts, and logos appear in both layouts. This only
                changes <span className="text-[#D0BEA5]/80">navigation</span>,
                <span className="text-[#D0BEA5]/80"> texture</span>, and
                <span className="text-[#D0BEA5]/80"> heading style</span>.
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {layouts.map((lo) => {
            const isActive = data.template === lo.id;
            return (
              <button
                key={lo.id}
                onClick={() => setTemplate(lo.id)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all backdrop-blur-sm",
                  isActive
                    ? "border-[rgba(208,190,165,0.45)] bg-[rgba(208,190,165,0.08)] shadow-[0_4px_20px_rgba(208,190,165,0.12)]"
                    : "border-[rgba(208,190,165,0.1)] hover:border-[rgba(208,190,165,0.2)] bg-[rgba(255,244,227,0.02)] hover:bg-[rgba(255,244,227,0.04)]"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Mini-preview showing actual layout using user's color */}
                  <div
                    className={cn(
                      "w-16 h-10 rounded-md flex-shrink-0 border overflow-hidden shadow-[inset_0_1px_0_rgba(255,244,227,0.1)] transition-all",
                      isActive
                        ? "border-[rgba(208,190,165,0.4)]"
                        : "border-[rgba(208,190,165,0.15)]"
                    )}
                  >
                    <lo.Thumb color={userPrimary || lo.defaultColor} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-sm font-medium text-[#FFF4E3]">
                        {lo.name}
                      </div>
                      {isActive && (
                        <span className="text-[9px] tracking-[0.2em] uppercase text-[#C9A961] font-semibold">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#FFF4E3]/60 mb-2 leading-relaxed">
                      {lo.tagline}
                    </div>
                    <ul className="space-y-0.5">
                      {lo.bullets.map((b) => (
                        <li
                          key={b}
                          className="text-[10px] text-[#D0BEA5]/60 leading-relaxed flex items-start gap-1.5"
                        >
                          <span className="text-[#D0BEA5]/40 mt-0.5">·</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* File name */}
      <div className="space-y-2">
        <Label>File Name</Label>
        <div className="flex items-center gap-2">
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <span className="text-sm text-[#D0BEA5]/60 font-mono">.html</span>
        </div>
      </div>

      {/* Export actions */}
      <div className="space-y-2">
        <Button onClick={handleExport} className="w-full" size="lg">
          {exported ? (
            <>
              <Check className="size-4" />
              Exported
            </>
          ) : (
            <>
              <Download className="size-4" />
              Download HTML
            </>
          )}
        </Button>

      </div>
    </div>
  );
}
