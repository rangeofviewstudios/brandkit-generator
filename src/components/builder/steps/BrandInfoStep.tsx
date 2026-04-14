"use client";

import { useBrandKitStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function BrandInfoStep() {
  const brandInfo = useBrandKitStore((s) => s.data.brandInfo);
  const setBrandInfo = useBrandKitStore((s) => s.setBrandInfo);

  return (
    <div className="max-w-md space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#D0BEA5]/60 mb-2 font-medium">Step 01</p>
        <h2 className="text-2xl font-light tracking-tight mb-1 text-[#FFF4E3]">Brand <span className="font-semibold">Information</span></h2>
        <p className="text-sm text-[#FFF4E3]/50">
          Start with the basics — your brand name and details.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Brand Name *</Label>
          <Input
            value={brandInfo.name}
            onChange={(e) => setBrandInfo({ name: e.target.value })}
            placeholder="Range of View Studios"
          />
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
