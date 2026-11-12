"use client";

import * as React from "react";
import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";

function TopLoadingBarComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ref = useRef<LoadingBarRef>(null);
  const prevPathRef = useRef(pathname);

  // Complete progress bar whenever route (pathname / query) changes
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      ref.current?.complete();
    }
  }, [pathname, searchParams]);

  // Intercept click on internal links to start progress bar immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore hash links, external links, downloads, new tabs, and modifier keys
      if (
        href.startsWith("#") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        if (url.origin === window.location.origin) {
          const current = window.location.pathname + window.location.search;
          const target = url.pathname + url.search;
          if (current !== target) {
            ref.current?.continuousStart();
          }
        }
      } catch {
        // ignore invalid URL
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  return (
    <LoadingBar
      ref={ref}
      color="#c96442"
      height={3}
      shadow={true}
      waitingTime={300}
    />
  );
}

export function TopLoadingBar() {
  return (
    <Suspense fallback={null}>
      <TopLoadingBarComponent />
    </Suspense>
  );
}

