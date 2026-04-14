import { notFound } from "next/navigation";
import BrandInfoStep from "@/components/builder/steps/BrandInfoStep";
import LogoStep from "@/components/builder/steps/LogoStep";
import ColorPaletteStep from "@/components/builder/steps/ColorPaletteStep";
import TypographyStep from "@/components/builder/steps/TypographyStep";
import GradientsStep from "@/components/builder/steps/GradientsStep";
import BrandVoiceStep from "@/components/builder/steps/BrandVoiceStep";
import SectionsConfigStep from "@/components/builder/steps/SectionsConfigStep";
import ExportStep from "@/components/builder/steps/ExportStep";

const STEP_COMPONENTS: Record<string, React.ComponentType> = {
  "brand-info": BrandInfoStep,
  logos: LogoStep,
  colors: ColorPaletteStep,
  typography: TypographyStep,
  gradients: GradientsStep,
  voice: BrandVoiceStep,
  sections: SectionsConfigStep,
  export: ExportStep,
};

export function generateStaticParams() {
  return Object.keys(STEP_COMPONENTS).map((step) => ({ step }));
}

export default async function StepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const StepComponent = STEP_COMPONENTS[step];
  if (!StepComponent) notFound();

  return <StepComponent />;
}
