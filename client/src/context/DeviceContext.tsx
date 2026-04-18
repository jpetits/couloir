"use client";

import { createContext, useContext } from "react";

const DeviceContext = createContext(false);

export function DeviceProvider({
  isMobile,
  children,
}: {
  isMobile: boolean;
  children: React.ReactNode;
}) {
  return (
    <DeviceContext.Provider value={isMobile}>{children}</DeviceContext.Provider>
  );
}

export function useIsMobile() {
  return useContext(DeviceContext);
}
