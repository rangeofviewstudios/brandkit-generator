"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";
import Wheel from "@uiw/react-color-wheel";
import { hsvaToHex, hexToHsva, type HsvaColor } from "@uiw/color-convert";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useBrandKitStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  hexToOklch,
  oklchToHex,
  getContrastRatio,
  wcagGrade,
  type OklchColor,
} from "@/lib/utils/colorUtils";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
type Mode = "assisted" | "manual";
type Harmony =
  | "complementary"
  | "monochromatic"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "split-complementary";

type PaletteSwatch = { hex: string; gamutClipped: boolean };

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
const mod360 = (h: number) => ((h % 360) + 360) % 360;

// ──────────────────────────────────────────────────────────────
// OKLCH-based harmony generator — returns role-based swatches
// ──────────────────────────────────────────────────────────────
function buildRoles(baseOk: OklchColor): {
  primary: OklchColor;
  secondary: OklchColor;
  tertiary: OklchColor;
  neutral: OklchColor;
} {
  const primary: OklchColor = {
    l: clamp(baseOk.l, 0.42, 0.58),
    c: clamp(baseOk.c, 0.12, 0.2),
    h: baseOk.h,
  };
  const secondary: OklchColor = {
    l: Math.min(primary.l + 0.18, 0.85),
    c: primary.c * 0.55,
    h: baseOk.h,
  };
  const tertiary: OklchColor = {
    l: primary.l + 0.08,
    c: primary.c * 0.45,
    h: mod360(baseOk.h + 30),
  };
  const neutral: OklchColor = {
    l: 0.93,
    c: 0.018,
    h: baseOk.h,
  };
  return { primary, secondary, tertiary, neutral };
}

function generatePalette(
  baseHex: string,
  harmony: Harmony
): PaletteSwatch[] {
  try {
    const baseOk = hexToOklch(baseHex);
    const { primary, secondary, tertiary, neutral } = buildRoles(baseOk);

    const accentAt = (hueOffset: number, chromaBoost = 1.15): OklchColor => ({
      l: primary.l + 0.05,
      c: primary.c * chromaBoost,
      h: mod360(baseOk.h + hueOffset),
    });

    let roles: OklchColor[];
    switch (harmony) {
      case "complementary":
        roles = [primary, secondary, tertiary, accentAt(180), neutral];
        break;
      case "monochromatic":
        // Five-step monochromatic ramp at base hue
        roles = [0.3, 0.45, 0.6, 0.75, 0.9].map((l) => ({
          l,
          c: clamp(baseOk.c, 0.04, 0.18) * (l > 0.85 ? 0.25 : 1),
          h: baseOk.h,
        }));
        break;
      case "analogous":
        roles = [-60, -30, 0, 30, 60].map((offset) => ({
          l: clamp(baseOk.l, 0.45, 0.7),
          c: clamp(baseOk.c, 0.08, 0.18),
          h: mod360(baseOk.h + offset),
        }));
        break;
      case "triadic":
        roles = [
          primary,
          secondary,
          accentAt(120, 1.0),
          accentAt(240, 1.0),
          neutral,
        ];
        break;
      case "tetradic":
        roles = [
          primary,
          accentAt(90, 1.0),
          neutral,
          accentAt(180, 1.1),
          accentAt(270, 1.0),
        ];
        break;
      case "split-complementary":
        // Split-complementary: ACCENT at +150°, ACCENT_2 at +210°
        roles = [
          primary,
          secondary,
          tertiary,
          accentAt(150),
          accentAt(210),
          neutral,
        ];
        break;
    }

    return roles.map((ok) => oklchToHex(ok));
  } catch {
    const count = harmony === "split-complementary" ? 6 : 5;
    return Array.from({ length: count }, () => ({
      hex: "#000000",
      gamutClipped: false,
    }));
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
    case "split-complementary":
      return (
        <svg {...props}>
          <circle cx="12" cy="5" r="2.5" />
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <line x1="12" y1="7.5" x2="8" y2="15.5" />
          <line x1="12" y1="7.5" x2="16" y2="15.5" />
        </svg>
      );
  }
};

const ROLE_LABELS_5 = ["Primary", "Secondary", "Tertiary", "Accent", "Neutral"];
const ROLE_LABELS_SPLIT = [
  "Primary",
  "Secondary",
  "Tertiary",
  "Accent",
  "Accent 2",
  "Neutral",
];
const getRoleLabels = (harmony: Harmony) =>
  harmony === "split-complementary" ? ROLE_LABELS_SPLIT : ROLE_LABELS_5;

const HARMONIES: { id: Harmony; label: string }[] = [
  { id: "complementary", label: "Complementary" },
  { id: "split-complementary", label: "Split-Comp." },
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
      const labels = getRoleLabels(harmony);
      const validColors = colors.filter((c) => /^#[0-9a-fA-F]{6}$/.test(c));
      const swatches = validColors.map((hex, i) => ({
        id: storeSwatches[i]?.id || uuid(),
        name: labels[i] || `Color ${i + 1}`,
        hex,
        role: labels[i] || "Accent",
        cssVariable: `--color-${(labels[i] || `c${i + 1}`)
          .toLowerCase()
          .replace(/\s+/g, "-")}`,
      }));
      reorderColors(swatches);
    },
    [storeSwatches, reorderColors, harmony]
  );

  useEffect(() => {
    if (mode === "assisted") syncToStore(generated.map((s) => s.hex));
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

  const displaySwatches: PaletteSwatch[] =
    mode === "assisted"
      ? generated
      : manualColors.map((hex) => ({ hex, gamutClipped: false }));

  const currentLabels = getRoleLabels(harmony);

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
        <p className="text-sm text-[#FFF4E3]/65">
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
            <div className="grid grid-cols-3 gap-2">
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
        <div
          className="grid gap-2.5"
          style={{
            gridTemplateColumns: `repeat(${displaySwatches.length}, minmax(0, 1fr))`,
          }}
        >
          {displaySwatches.map((swatch, i) => {
            const color = swatch.hex;
            const isValid = /^#[0-9a-fA-F]{6}$/.test(color);

            // WCAG: compare swatch against #FFF and #000, take the higher ratio
            let badgeRatio = 0;
            let badgeGrade: "AAA" | "AA" | "FAIL" = "FAIL";
            if (isValid) {
              const vsWhite = getContrastRatio(color, "#FFFFFF");
              const vsBlack = getContrastRatio(color, "#000000");
              badgeRatio = Math.max(vsWhite, vsBlack);
              badgeGrade = wcagGrade(badgeRatio);
            }
            const passes = badgeGrade !== "FAIL";

            return (
              <div key={i} className="space-y-2 animate-in fade-in duration-300">
                <div
                  className={cn(
                    "relative w-full h-20 rounded-xl transition-all duration-300",
                    isValid
                      ? "border border-[rgba(208,190,165,0.15)] shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,244,227,0.1)]"
                      : "border-2 border-dashed border-[rgba(208,190,165,0.18)] bg-[rgba(255,244,227,0.02)]"
                  )}
                  style={isValid ? { background: color } : {}}
                >
                  {swatch.gamutClipped && isValid && (
                    <span
                      title="This color was adjusted to fit sRGB display gamut"
                      aria-label="This color was adjusted to fit sRGB display gamut"
                      className="absolute top-1 right-1 flex items-center justify-center size-5 rounded-full bg-black/55 backdrop-blur-sm text-[#FFB547]"
                    >
                      <AlertTriangle className="size-3" />
                    </span>
                  )}
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[8px] font-medium tracking-[0.18em] uppercase text-[#D0BEA5]/50">
                    {currentLabels[i]}
                  </p>
                  {mode === "manual" ? (
                    (() => {
                      const raw = manualColors[i] ?? "";
                      const hasValue = raw.length > 0;
                      const invalid = hasValue && !isValid;
                      return (
                        <>
                          <input
                            type="text"
                            value={raw}
                            onChange={(e) => handleManualChange(i, e.target.value)}
                            aria-invalid={invalid}
                            className={cn(
                              "w-full h-7 px-1.5 rounded-md bg-[rgba(255,244,227,0.03)] border text-[10px] font-mono uppercase text-[#FFF4E3] text-center transition-all focus:outline-none",
                              invalid
                                ? "border-[rgba(220,120,100,0.5)] focus:border-[rgba(220,120,100,0.7)] focus:ring-1 focus:ring-[rgba(220,120,100,0.3)]"
                                : "border-[rgba(208,190,165,0.12)] focus:border-[rgba(208,190,165,0.55)] focus:ring-1 focus:ring-[rgba(208,190,165,0.18)]"
                            )}
                            placeholder="#______"
                            maxLength={7}
                          />
                          {invalid && (
                            <span className="block text-[9px] text-[#E89178]/85 leading-tight">
                              Invalid hex
                            </span>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <code className="block text-[10px] font-mono text-[#FFF4E3]/70 tracking-wide">
                      {color.toUpperCase()}
                    </code>
                  )}
                  {isValid && (
                    <span
                      title={`Best text contrast ${badgeRatio}:1 vs ${
                        getContrastRatio(color, "#FFFFFF") >=
                        getContrastRatio(color, "#000000")
                          ? "white"
                          : "black"
                      }`}
                      className={cn(
                        "inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold leading-none tracking-wide",
                        passes
                          ? "bg-[rgba(168,200,150,0.18)] text-[#A8C896] border border-[rgba(168,200,150,0.35)]"
                          : "bg-[rgba(220,120,100,0.15)] text-[#E89178] border border-[rgba(220,120,100,0.3)]"
                      )}
                    >
                      {badgeRatio}:1 {badgeGrade}
                    </span>
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
