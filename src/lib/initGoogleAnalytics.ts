declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const initGoogleAnalytics = () => {

  // Prevent duplicate loading
if (typeof window !== "undefined" && window.dataLayer) return;

  const script = document.createElement("script");
  script.src =
    "https://www.googletagmanager.com/gtag/js?id=G-67FRT0NP1T";
  script.async = true;

  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];

  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  
  window.gtag = gtag;

  window.gtag("js", new Date());

  window.gtag("config", "G-67FRT0NP1T");
};