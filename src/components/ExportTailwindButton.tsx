"use client";

import { useState } from "react";
import { Wind, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTailwindConfig } from "@/lib/utils/formatTailwindConfig";
import { downloadFile } from "@/lib/utils/downloadFile";
import { useToast } from "@/hooks/useToast";
import type { BrandKitData } from "@/lib/types";

interface Props {
  data: BrandKitData;
  filename?: string;
  className?: string;
}

export default function ExportTailwindButton({
  data,
  filename,
  className,
}: Props) {
  const [downloaded, setDownloaded] = useState(false);
  const pushToast = useToast((s) => s.push);

  const handleClick = () => {
    try {
      const slug =
        filename ||
        `${data.brandInfo.name || "brand"}-preset`
          .toLowerCase()
          .replace(/\s+/g, "-");
      const preset = formatTailwindConfig(data);
      downloadFile(
        preset,
        `${slug}.cjs`,
        "application/javascript;charset=utf-8"
      );
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
      pushToast(`${slug}.cjs downloaded`, "success");
    } catch (err) {
      pushToast(
        err instanceof Error
          ? `Tailwind export failed: ${err.message}`
          : "Tailwind export failed",
        "error"
      );
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={className}
      size="lg"
    >
      {downloaded ? (
        <>
          <Check className="size-4" />
          Preset Downloaded
        </>
      ) : (
        <>
          <Wind className="size-4" />
          Download Tailwind Preset (.cjs)
        </>
      )}
    </Button>
  );
}
