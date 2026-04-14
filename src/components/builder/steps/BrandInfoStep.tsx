"use client";

import { Sparkles } from "lucide-react";
import { useBrandKitStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SAMPLE_BRAND } from "@/lib/utils/sampleBrand";

export default function BrandInfoStep() {
  const brandInfo = useBrandKitStore((s) => s.data.brandInfo);
  const setBrandInfo = useBrandKitStore((s) => s.setBrandInfo);
  const loadSample = useBrandKitStore((s) => s.loadSample);

  const nameMissing = brandInfo.name.trim().length === 0;

  return (
    <div className="max-w-md space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#D0BEA5]/60 mb-2 font-medium">Step 01</p>
        <h2 className="text-2xl font-light tracking-tight mb-1 text-[#FFF4E3]">Brand <span className="font-semibold">Information</span></h2>
        <p className="text-sm text-[#FFF4E3]/65">
          Start with the basics — your brand name and details.
        </p>
      </div>

      <button
        type="button"
        onClick={() => loadSample(SAMPLE_BRAND)}
        className="w-full group flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[rgba(201,169,97,0.08)] hover:bg-[rgba(201,169,97,0.14)] border border-[rgba(201,169,97,0.25)] hover:border-[rgba(201,169,97,0.45)] transition-all text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Sparkles className="size-4 text-[#C9A961] flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-[#FFF4E3]">
              Load Sample Brand
            </div>
            <div className="text-[11px] text-[#FFF4E3]/55 truncate">
              Populate with Range of View Studios as a starting point
            </div>
          </div>
        </div>
        <span className="text-[9px] tracking-[0.18em] uppercase font-semibold text-[#C9A961]/80 group-hover:text-[#C9A961] flex-shrink-0">
          Try it
        </span>
      </button>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Brand Name *</Label>
          <Input
            value={brandInfo.name}
            onChange={(e) => setBrandInfo({ name: e.target.value })}
            placeholder="Range of View Studios"
            aria-invalid={nameMissing}
            className={
              nameMissing
                ? "border-[rgba(220,120,100,0.45)] focus-visible:ring-[rgba(220,120,100,0.4)]"
                : undefined
            }
          />
          {nameMissing && (
            <p className="text-[11px] text-[#E89178]/85 leading-relaxed">
              A brand name is required to continue. This appears as the title
              of your exported kit.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Tagline</Label>
          <Input
            value={brandInfo.tagline}
            onChange={(e) => setBrandInfo({ tagline: e.target.value })}
            placeholder="Crafting visual stories"
          />
        </div>

        <div className="space-y-2">
          <Label>Website</Label>
          <Input
            value={brandInfo.website}
            onChange={(e) => setBrandInfo({ website: e.target.value })}
            placeholder="https://example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Version</Label>
            <Input
              value={brandInfo.version}
              onChange={(e) => setBrandInfo({ version: e.target.value })}
              placeholder="v1.0"
            />
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <Input
              value={brandInfo.year}
              onChange={(e) => setBrandInfo({ year: e.target.value })}
              placeholder="2025"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Confidentiality Note</Label>
          <Textarea
            value={brandInfo.confidentialityNote}
            onChange={(e) =>
              setBrandInfo({ confidentialityNote: e.target.value })
            }
            placeholder="Internal Use Only — Not for external distribution"
            rows={2}
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
}
