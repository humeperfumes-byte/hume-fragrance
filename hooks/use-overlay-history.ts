"use client";

import { useEffect, useRef } from "react";

const OVERLAY_STATE_KEY = "__humeOverlay";

export function useOverlayHistory(
  open: boolean,
  setOpen: (open: boolean) => void,
  overlayName: "menu" | "search" | "cart",
) {
  const openRef = useRef(open);
  const markerIdRef = useRef<string | null>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (openRef.current) {
        markerIdRef.current = null;
        setOpen(false);
        return;
      }

      const marker = event.state?.[OVERLAY_STATE_KEY];
      if (marker?.id && marker.name === overlayName) {
        window.history.back();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [overlayName, setOpen]);

  useEffect(() => {
    const currentMarker = window.history.state?.[OVERLAY_STATE_KEY];

    if (open) {
      if (currentMarker?.name === overlayName) {
        markerIdRef.current = currentMarker.id;
        return;
      }

      const id = `${overlayName}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      markerIdRef.current = id;
      window.history.pushState(
        { ...window.history.state, [OVERLAY_STATE_KEY]: { id, name: overlayName } },
        "",
        window.location.href,
      );
      return;
    }

    if (markerIdRef.current && currentMarker?.id === markerIdRef.current) {
      markerIdRef.current = null;
      window.history.back();
      return;
    }

    if (!markerIdRef.current && currentMarker?.name === overlayName) {
      window.history.back();
    }
  }, [open, overlayName]);
}
