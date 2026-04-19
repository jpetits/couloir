"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const DEVICE_MOBILE = "mobile";
export const DEVICE_TABLET = "tablet";
export const DEVICE_DESKTOP = "desktop";

export type DeviceType =
  | typeof DEVICE_MOBILE
  | typeof DEVICE_TABLET
  | typeof DEVICE_DESKTOP;

interface DeviceContextValue {
  deviceType: DeviceType;
  isLandscape: boolean;
}

const DeviceContext = createContext<DeviceContextValue>({
  deviceType: "desktop",
  isLandscape: false,
});

export function DeviceProvider({
  deviceType = DEVICE_DESKTOP,
  children,
}: {
  deviceType?: DeviceType | undefined;
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
    <DeviceContext.Provider value={{ deviceType, isLandscape }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDeviceType() {
  return useContext(DeviceContext).deviceType;
}

export function useIsMobile() {
  return (
    useContext(DeviceContext).deviceType === DEVICE_MOBILE ||
    useContext(DeviceContext).deviceType === DEVICE_TABLET
  );
}

export function useIsTablet() {
  return useContext(DeviceContext).deviceType === DEVICE_TABLET;
}

export function useIsLandscape() {
  return useContext(DeviceContext).isLandscape;
}
