"use client";

import { useEffect, useCallback } from "react";

export const useFullWidth = (isActive: boolean) => {
  const applyFullWidth = useCallback(() => {
    const body = document.body;
    const main = document.querySelector("main");
    
    if (body) {
      body.style.maxWidth = "none";
      body.style.margin = "0";
      body.style.padding = "0";
      body.style.width = "100%";
      body.classList.remove("max-w-2xl");
      body.classList.add("full-width");
      // Add data attribute for CSS targeting
      body.setAttribute("data-route", window.location.pathname);
    }
    
    if (main) {
      main.style.maxWidth = "none";
      main.style.margin = "0";
      main.style.padding = "0";
      main.style.width = "100%";
      main.classList.add("full-width");
      // Add data attribute for CSS targeting
      main.setAttribute("data-route", window.location.pathname);
    }
  }, []);

  const restoreOriginalStyles = useCallback(() => {
    const body = document.body;
    const main = document.querySelector("main");
    
    if (body) {
      body.style.maxWidth = "";
      body.style.margin = "";
      body.style.padding = "";
      body.style.width = "";
      body.classList.add("max-w-2xl");
      body.classList.remove("full-width");
      // Remove data attribute
      body.removeAttribute("data-route");
    }
    if (main) {
      main.style.maxWidth = "";
      main.style.margin = "";
      main.style.padding = "";
      main.style.width = "";
      main.classList.remove("full-width");
      // Remove data attribute
      main.removeAttribute("data-route");
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // Apply full width immediately
    applyFullWidth();

    // Handle browser back/forward navigation
    const handlePopState = () => {
      setTimeout(applyFullWidth, 0);
    };

    // Handle when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(applyFullWidth, 0);
      }
    };

    // Handle focus events
    const handleFocus = () => {
      setTimeout(applyFullWidth, 0);
    };

    // Handle page load events
    const handleLoad = () => {
      setTimeout(applyFullWidth, 0);
    };

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('load', handleLoad);

    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.target === document.body || mutation.target === document.querySelector("main"))) {
          // DOM attributes changed, reapply full width
          setTimeout(applyFullWidth, 0);
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    const mainElement = document.querySelector("main");
    if (mainElement) {
      observer.observe(mainElement, {
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('load', handleLoad);
      observer.disconnect();
      restoreOriginalStyles();
    };
  }, [isActive, applyFullWidth, restoreOriginalStyles]);

  return { applyFullWidth, restoreOriginalStyles };
};
