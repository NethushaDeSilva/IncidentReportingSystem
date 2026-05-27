import { useEffect, useState } from "react";
import appConfig from "../Data/appConfig.json";

export function useExternalAdvisory() {
  const [data, setData] = useState({
    loading: true,
    error: "",
    title: "Loading external status...",
    url: appConfig.externalApi.url,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRelease() {
      try {
        const response = await fetch(appConfig.externalApi.url, {
          headers: { Accept: "application/vnd.github+json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("External API request failed.");
        }

        const release = await response.json();
        setData({
          loading: false,
          error: "",
          title: `${appConfig.externalApi.label} ${release.tag_name || ""}`.trim(),
          summary: release.name || "Latest release fetched from GitHub",
          url: release.html_url || appConfig.externalApi.url,
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        setData({
          loading: false,
          error: "External status unavailable",
          title: appConfig.externalApi.label,
          summary: "GitHub release data could not be loaded right now.",
          url: appConfig.externalApi.url,
        });
      }
    }

    fetchRelease();
    return () => controller.abort();
  }, []);

  return data;
}
