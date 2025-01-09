import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Background } from "~~/components/ui/Background";
import { Header } from "~~/components";
import { ScaffoldEthAppWithProviders } from "~~/components/Providers/WagmiProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const satoshiRegular = localFont({
  src: "./fonts/Satoshi-Regular.woff",
  variable: "--font-satoshi-regular",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Privote",
  description: "Privote: The all new way of voting through MACI",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${satoshiRegular.variable}`}>
        <ScaffoldEthAppWithProviders>
          <Background />
          <Header />
          {children}
        </ScaffoldEthAppWithProviders>
      </body>
    </html>
  );
}
