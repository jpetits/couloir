"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface DeviceContextValue {
  isMobile: boolean;
  isTablet: boolean;
  isLandscape: boolean;
}

const DeviceContext = createContext<DeviceContextValue>({
  isMobile: false,
  isTablet: false,
  isLandscape: false,
});

export function DeviceProvider({
  isMobile,
  isTablet,
  children,
}: {
  isMobile: boolean;
  isTablet: boolean;
  children: React.ReactNode;
}) {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    setIsLandscape(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsLandscape(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <DeviceContext.Provider value={{ isMobile, isTablet, isLandscape }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useIsMobile() {
  return useContext(DeviceContext).isMobile;
}

export function useIsTablet() {
  return useContext(DeviceContext).isTablet;
}

export function useIsLandscape() {
  return useContext(DeviceContext).isLandscape;
}
