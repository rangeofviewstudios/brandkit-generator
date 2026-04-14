import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Ambient candlelight glow — mid-brown, no orange */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(96,62,37,0.5) 0%, transparent 70%)",
        }}
      />

      <div className="relative text-center max-w-xl px-6">
        <p className="text-[11px] tracking-[0.35em] uppercase text-[#D0BEA5]/70 mb-8 font-medium">
          Range of View Studios
        </p>
        <h1 className="text-5xl font-light tracking-tight mb-5 text-[#FFF4E3]">
          Brand Kit{" "}
          <span
            className="font-semibold bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(132deg, #EA9A61 4.77%, #B16937 27.26%, #A64D2B 50.09%, #D0BEA5 76.74%)",
            }}
          >
            Generator
          </span>
        </h1>
        <p className="text-[#FFF4E3]/60 text-[15px] leading-relaxed mb-12 max-w-md mx-auto">
          Create beautiful, interactive brand guidelines. Define your colors,
          typography, logos, and voice — then export a stunning standalone brand
          kit.
        </p>
        <Button asChild size="lg" className="px-8">
          <Link href="/builder/brand-info">
            Start Building
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
