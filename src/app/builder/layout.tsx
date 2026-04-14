import WizardShell from "@/components/builder/WizardShell";
import PreviewFrame from "@/components/preview/PreviewFrame";
import StepTransition from "@/components/builder/StepTransition";

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Left: Wizard */}
      <div className="w-[480px] min-w-[420px] border-r border-[rgba(201,169,97,0.1)] flex flex-col bg-[#1F0F08] relative z-10 overflow-hidden">
        {/* ── Bottom-left atmospheric splashes — expensive editorial lighting ── */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none z-0"
        >
          {/* Primary warm splash — deep amber glow */}
          <div
            className="absolute"
            style={{
              bottom: "-120px",
              left: "-120px",
              width: "440px",
              height: "440px",
              background:
                "radial-gradient(circle at 35% 65%, rgba(234,154,97,0.10) 0%, rgba(177,105,55,0.05) 30%, rgba(166,77,43,0.02) 55%, transparent 75%)",
              filter: "blur(48px)",
            }}
          />
          {/* Gold accent splash — smaller, offset */}
          <div
            className="absolute"
            style={{
              bottom: "20px",
              left: "60px",
              width: "240px",
              height: "240px",
              background:
                "radial-gradient(circle, rgba(229,194,106,0.05) 0%, rgba(201,169,97,0.025) 45%, transparent 75%)",
              filter: "blur(52px)",
            }}
          />
          {/* Tiny hot core near the corner — the concentrated candle source */}
          <div
            className="absolute gold-pulse"
            style={{
              bottom: "10px",
              left: "-10px",
              width: "160px",
              height: "160px",
              background:
                "radial-gradient(circle, rgba(234,154,97,0.11) 0%, transparent 65%)",
              filter: "blur(36px)",
            }}
          />
        </div>

        {/* Hairline gold shine on right edge — premium divider */}
        <div
          aria-hidden
          className="absolute top-0 right-0 bottom-0 w-px pointer-events-none z-20"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(201,169,97,0.25) 30%, rgba(201,169,97,0.35) 50%, rgba(201,169,97,0.25) 70%, transparent 100%)",
          }}
        />

        {/* Wrap WizardShell in a relative layer so content sits above splashes */}
        <div className="relative flex flex-col flex-1 z-10 min-h-0">
          <WizardShell>
            <StepTransition>{children}</StepTransition>
          </WizardShell>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="flex-1 flex flex-col bg-[#170B05]">
        <PreviewFrame />
      </div>
    </div>
  );
}
