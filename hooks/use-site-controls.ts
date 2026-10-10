"use client";

import { useEffect, useState } from "react";
import { defaultAdminControls, normalizeAdminControls, type AdminControls } from "@/lib/admin-settings";

let cachedSettings: AdminControls | null = null;
let settingsPromise: Promise<AdminControls> | null = null;

function loadSettings() {
  if (cachedSettings) return Promise.resolve(cachedSettings);
  if (settingsPromise) return settingsPromise;

  settingsPromise = fetch("/api/settings", { cache: "no-store", signal: AbortSignal.timeout(10000) })
    .then(async (response) => {
      if (!response.ok) return defaultAdminControls;
      return normalizeAdminControls(await response.json());
    })
    .then((settings) => {
      cachedSettings = settings;
      return settings;
    })
    .catch(() => { settingsPromise = null; return defaultAdminControls; });

  return settingsPromise;
}

export function useSiteControls() {
  const [settings, setSettings] = useState<AdminControls>(defaultAdminControls);

  useEffect(() => {
    let active = true;

    loadSettings()
      .then((nextSettings) => {
        if (active) setSettings(nextSettings);
      })
      .catch(() => {
        if (active) setSettings(defaultAdminControls);
      });

    return () => {
      active = false;
    };
  }, []);

  return settings;
}
