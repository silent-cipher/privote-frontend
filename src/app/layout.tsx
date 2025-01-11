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

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;
const imageUrl = `${baseUrl}/logo.svg`;

const title = "Privote";
const titleTemplate = "%s | Privote";
const description = "Privote: The all new way of voting through MACI";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: title,
    template: titleTemplate,
  },
  description,
  openGraph: {
    title: {
      default: title,
      template: titleTemplate,
    },
    description,
    images: [
      {
        url: imageUrl,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [imageUrl],
    title: {
      default: title,
      template: titleTemplate,
    },
    description,
  },
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
