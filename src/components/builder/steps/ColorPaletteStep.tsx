"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";
import chroma from "chroma-js";
import Wheel from "@uiw/react-color-wheel";
import { hsvaToHex, hexToHsva, type HsvaColor } from "@uiw/color-convert";
import { motion } from "framer-motion";
import { useBrandKitStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
type Mode = "assisted" | "manual";
type Harmony =
  | "complementary"
  | "monochromatic"
  | "analogous"
  | "triadic"
  | "tetradic";

// ──────────────────────────────────────────────────────────────
// Harmony generators — each returns 5 colors
// ──────────────────────────────────────────────────────────────
function generatePalette(baseHex: string, harmony: Harmony): string[] {
  try {
    const base = chroma(baseHex);
    const [h, s, l] = base.hsl();
    const safeH = isNaN(h) ? 0 : h;

    switch (harmony) {
      case "complementary": {
        const comp = chroma.hsl((safeH + 180) % 360, s, l);
        return [
          base.set("hsl.l", Math.max(l - 0.25, 0.08)).hex(),
          base.hex(),
          chroma.mix(base, comp, 0.5, "lab").hex(),
          comp.hex(),
          comp.set("hsl.l", Math.min(l + 0.25, 0.92)).hex(),
        ];
      }
      case "monochromatic": {
        return [0.15, 0.3, 0.5, 0.7, 0.85].map((lightness) =>
          chroma.hsl(safeH, s, lightness).hex()
        );
      }
      case "analogous": {
        return [-60, -30, 0, 30, 60].map((offset) =>
          chroma.hsl((safeH + offset + 360) % 360, s, l).hex()
        );
      }
      case "triadic": {
        const c2 = chroma.hsl((safeH + 120) % 360, s, l);
        const c3 = chroma.hsl((safeH + 240) % 360, s, l);
        return [
          base.set("hsl.l", Math.max(l - 0.2, 0.1)).hex(),
          base.hex(),
          c2.hex(),
          c3.hex(),
          c3.set("hsl.l", Math.min(l + 0.2, 0.9)).hex(),
        ];
      }
      case "tetradic": {
        const c1 = base;
        const c2 = chroma.hsl((safeH + 90) % 360, s, l);
        const c3 = chroma.hsl((safeH + 180) % 360, s, l);
        const c4 = chroma.hsl((safeH + 270) % 360, s, l);
        const neutral = chroma.hsl(safeH, s * 0.2, 0.5);
        return [c1.hex(), c2.hex(), neutral.hex(), c3.hex(), c4.hex()];
      }
    }
  } catch {
    return Array(5).fill("#000000");
  }
}

// ──────────────────────────────────────────────────────────────
// Harmony icon SVGs
// ──────────────────────────────────────────────────────────────
const HarmonyIcon = ({ type }: { type: Harmony }) => {
  const props = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
  };

  switch (type) {
    case "complementary":
      return (
        <svg {...props}>
          <circle cx="7" cy="12" r="3.5" />
          <circle cx="17" cy="12" r="3.5" />
          <line x1="10.5" y1="12" x2="13.5" y2="12" />
        </svg>
      );
    case "monochromatic":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" opacity="0.3" />
          <circle cx="12" cy="12" r="5.5" opacity="0.6" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "analogous":
      return (
        <svg {...props}>
          <circle cx="5" cy="13" r="2.5" />
          <circle cx="12" cy="9" r="2.5" />
          <circle cx="19" cy="13" r="2.5" />
        </svg>
      );
    case "triadic":
      return (
        <svg {...props}>
          <circle cx="12" cy="5" r="2.5" />
          <circle cx="5.5" cy="17" r="2.5" />
          <circle cx="18.5" cy="17" r="2.5" />
        </svg>
      );
    case "tetradic":
      return (
        <svg {...props}>
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
        </svg>
      );
  }
};

const ROLE_LABELS = ["Primary", "Secondary", "Tertiary", "Accent", "Neutral"];
const HARMONIES: { id: Harmony; label: string }[] = [
  { id: "complementary", label: "Complementary" },
  { id: "monochromatic", label: "Monochromatic" },
  { id: "analogous", label: "Analogous" },
  { id: "triadic", label: "Triadic" },
  { id: "tetradic", label: "Tetradic" },
];

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────
export default function ColorPaletteStep() {
  const storeSwatches = useBrandKitStore((s) => s.data.colors.swatches);
  const reorderColors = useBrandKitStore((s) => s.reorderColors);

  const [mode, setMode] = useState<Mode>("assisted");
  const [baseColor, setBaseColor] = useState<string>("#EA9A61");
  const [hsva, setHsva] = useState<HsvaColor>(hexToHsva("#EA9A61"));
  const [harmony, setHarmony] = useState<Harmony>("complementary");
  const [manualColors, setManualColors] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
  ]);

  const generated = useMemo(
    () => generatePalette(baseColor, harmony),
    [baseColor, harmony]
  );

  const syncToStore = useCallback(
    (colors: string[]) => {
      const validColors = colors.filter((c) => /^#[0-9a-fA-F]{6}$/.test(c));
      const swatches = validColors.map((hex, i) => ({
        id: storeSwatches[i]?.id || uuid(),
        name: ROLE_LABELS[i] || `Color ${i + 1}`,
        hex,
        role: ROLE_LABELS[i] || "Accent",
        cssVariable: `--color-${(ROLE_LABELS[i] || `c${i + 1}`).toLowerCase()}`,
      }));
      reorderColors(swatches);
    },
    [storeSwatches, reorderColors]
  );

  useEffect(() => {
    if (mode === "assisted") syncToStore(generated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generated, mode]);

  useEffect(() => {
    if (mode === "manual") syncToStore(manualColors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualColors, mode]);

  const handleWheelChange = (color: { hsva: HsvaColor }) => {
    setHsva(color.hsva);
    setBaseColor(hsvaToHex(color.hsva).toUpperCase());
  };

  const handleHexChange = (val: string) => {
    setBaseColor(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setHsva(hexToHsva(val));
    }
  };

  const handleManualChange = (index: number, val: string) => {
    const updated = [...manualColors];
    updated[index] = val;
    setManualColors(updated);
  };

  const displaySwatches = mode === "assisted" ? generated : manualColors;

  return (
    <div className="max-w-md space-y-7">
      {/* Heading */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#D0BEA5]/60 mb-2 font-medium">
          Step 03
        </p>
        <h2 className="text-2xl font-light tracking-tight mb-1 text-[#FFF4E3]">
          Color <span className="font-semibold">Palette</span>
        </h2>
        <p className="text-sm text-[#FFF4E3]/50">
          Build a harmonious palette or define your own.
        </p>
      </div>

      {/* ── Mode Toggle ── */}
      <div className="inline-flex p-1 rounded-full bg-[rgba(59,33,20,0.6)] backdrop-blur-md border border-[rgba(208,190,165,0.15)] shadow-[inset_0_1px_0_rgba(0,0,0,0.2)]">
        {(
          [
            { id: "assisted", label: "Help me build a palette" },
            { id: "manual", label: "I have my own colors" },
          ] as const
        ).map((opt) => {
          const isActive = mode === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id)}
              className={cn(
                "relative px-4 py-2 rounded-full text-xs font-semibold transition-colors duration-150 whitespace-nowrap",
                isActive
                  ? "text-[#3B2114]"
                  : "text-[#D0BEA5]/50 hover:text-[#D0BEA5]"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="palette-toggle-pill"
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-[#D0BEA5] shadow-[0_2px_10px_rgba(208,190,165,0.35)]"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Assisted Mode ── */}
      {mode === "assisted" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Color Wheel + Hex Input */}
          <div className="p-5 rounded-2xl bg-[rgba(255,244,227,0.03)] backdrop-blur-md border border-[rgba(208,190,165,0.1)] shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,244,227,0.04)]">
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#D0BEA5]/60 mb-4">
              Pick a base color
            </p>
            <div className="flex items-start gap-5">
              <div className="shrink-0">
                <Wheel
                  color={hsva}
                  onChange={handleWheelChange}
                  width={140}
                  height={140}
                />
              </div>
              <div className="flex-1 space-y-3 min-w-0">
                <div>
                  <label className="block text-[9px] font-medium tracking-[0.2em] uppercase text-[#D0BEA5]/60 mb-1.5">
                    HEX
                  </label>
                  <input
                    type="text"
                    value={baseColor}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[rgba(255,244,227,0.03)] border border-[rgba(208,190,165,0.12)] text-sm font-mono uppercase text-[#FFF4E3] shadow-[inset_0_1px_0_rgba(255,244,227,0.04)] transition-all focus:outline-none focus:border-[rgba(208,190,165,0.55)] focus:bg-[rgba(255,244,227,0.05)] focus:ring-2 focus:ring-[rgba(208,190,165,0.18)]"
                    placeholder="#000000"
                    maxLength={7}
                  />
                </div>
                <div
                  className="h-16 rounded-lg border border-[rgba(208,190,165,0.15)] shadow-[inset_0_1px_0_rgba(255,244,227,0.1)] transition-all"
                  style={{ background: baseColor }}
                />
              </div>
            </div>
          </div>

          {/* Harmony Selector */}
          <div>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#D0BEA5]/60 mb-3">
              Choose a harmony
            </p>
            <div className="grid grid-cols-5 gap-2">
              {HARMONIES.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setHarmony(h.id)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 backdrop-blur-sm",
                    harmony === h.id
                      ? "border-[rgba(208,190,165,0.45)] bg-[rgba(208,190,165,0.1)] text-[#D0BEA5] shadow-[0_4px_16px_rgba(208,190,165,0.18)]"
                      : "border-[rgba(208,190,165,0.1)] bg-[rgba(255,244,227,0.02)] text-[#FFF4E3]/50 hover:text-[#FFF4E3]/80 hover:border-[rgba(208,190,165,0.2)] hover:bg-[rgba(255,244,227,0.04)]"
                  )}
                  title={h.label}
                >
                  <HarmonyIcon type={h.id} />
                  <span className="text-[9px] font-medium text-center leading-tight tracking-wide">
                    {h.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Swatch Row ── */}
      <div className="space-y-3">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#D0BEA5]/60">
          {mode === "assisted" ? "Generated palette" : "Your colors"}
        </p>
        <div className="grid grid-cols-5 gap-2.5">
          {displaySwatches.map((color, i) => {
            const isValid = /^#[0-9a-fA-F]{6}$/.test(color);
            return (
              <div key={i} className="space-y-2 animate-in fade-in duration-300">
                <div
                  className={cn(
                    "w-full h-20 rounded-xl transition-all duration-300",
                    isValid
                      ? "border border-[rgba(208,190,165,0.15)] shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,244,227,0.1)]"
                      : "border-2 border-dashed border-[rgba(208,190,165,0.18)] bg-[rgba(255,244,227,0.02)]"
                  )}
                  style={isValid ? { background: color } : {}}
                />
                <div className="text-center">
                  <p className="text-[8px] font-medium tracking-[0.18em] uppercase text-[#D0BEA5]/50 mb-1">
                    {ROLE_LABELS[i]}
                  </p>
                  {mode === "manual" ? (
                    <input
                      type="text"
                      value={manualColors[i]}
                      onChange={(e) => handleManualChange(i, e.target.value)}
                      className="w-full h-7 px-1.5 rounded-md bg-[rgba(255,244,227,0.03)] border border-[rgba(208,190,165,0.12)] text-[10px] font-mono uppercase text-[#FFF4E3] text-center transition-all focus:outline-none focus:border-[rgba(208,190,165,0.55)] focus:ring-1 focus:ring-[rgba(208,190,165,0.18)]"
                      placeholder="#______"
                      maxLength={7}
                    />
                  ) : (
                    <code className="block text-[10px] font-mono text-[#FFF4E3]/70 tracking-wide">
                      {color.toUpperCase()}
                    </code>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
