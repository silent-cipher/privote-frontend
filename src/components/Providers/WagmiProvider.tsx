"use client";

import merge from "lodash.merge";
import { useEffect, useState } from "react";
import {
  RainbowKitProvider,
  Theme,
  midnightTheme,
} from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import { WagmiConfig } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { ProgressBar } from "~~/components/scaffold-eth/ProgressBar";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { appChains } from "~~/services/web3/wagmiConnectors";
import { Toaster } from "react-hot-toast";
import SigContextProvider from "~~/contexts/SigContext";

const customTheme: Theme = merge(midnightTheme(), {
  colors: {
    accentColor: "#c65ec6",
    accentColorForeground: "white",
    connectButtonText: "#ffffff",
    connectButtonBackground: "#7f58b7",
  },
  radii: {
    actionButton: 30,
  },
});

export const ScaffoldEthAppWithProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <ProgressBar />
      <RainbowKitProvider
        chains={appChains.chains}
        avatar={BlockieAvatar}
        theme={customTheme}
      >
        <SigContextProvider>
          <AnonAadhaarProvider _useTestAadhaar>
            <Toaster />
            {children}
          </AnonAadhaarProvider>
        </SigContextProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
