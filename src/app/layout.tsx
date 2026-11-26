import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AdaptiveUIProvider } from "@/contexts/AdaptiveUIContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { FormStateProvider } from "@/contexts/FormStateContext";
import { TelemetryProvider } from "@/contexts/TelemetryContext";
import { ConsentBanner } from "@/components/telemetry/ConsentBanner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AuraGen – Self-Healing Adaptive UI",
  description:
    "AI-powered adaptive web interface platform that observes user interaction friction and transforms complex workflows into guided, accessible experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-aura-100 selection:text-aura-800">
        <AdaptiveUIProvider>
          <AccessibilityProvider>
            <TelemetryProvider>
              <FormStateProvider>
                <ConsentBanner />
                {children}
              </FormStateProvider>
            </TelemetryProvider>
          </AccessibilityProvider>
        </AdaptiveUIProvider>
      </body>
    </html>
  );
}
