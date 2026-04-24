"use client";

import { useEffect, useRef } from "react";
import { useBrandKitStore } from "@/lib/store";
import { useToast } from "@/hooks/useToast";

export default function PersistGate() {
  const pushToast = useToast((s) => s.push);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const before = useBrandKitStore.getState().data;
    void useBrandKitStore.persist.rehydrate()?.then(() => {
      const after = useBrandKitStore.getState().data;
      const restored =
        after !== before &&
        (after.brandInfo.name.length > 0 ||
          after.logos.variants.length > 0 ||
          after.colors.swatches.length > 0);
      if (restored) {
        pushToast(`Restored "${after.brandInfo.name || "previous session"}"`, "success");
      }
    });
  }, [pushToast]);

  return null;
}
