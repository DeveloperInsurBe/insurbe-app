export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (typeof window !== "undefined") {
    window.gtag?.("event", eventName, params);

    console.log("Tracked Event:", eventName);
  }
};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}