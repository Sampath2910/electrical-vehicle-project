import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/storeContext";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { VivaDemoDock } from "@/components/ui/VivaDemoDock";

export const metadata: Metadata = {
  title: "Smart Moto EV Platform | Electric Bike Charging & Battery Swapping Network",
  description: "IoT-enabled Smart Electric Two-Wheeler Charging & Battery Swapping Platform with 230V single-phase live telemetry, 15A/16A smart plugs, LEV DC fast charging, and instant 60-second battery swaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-navy-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <StoreProvider>
          <Navbar />
          <main className="flex-1 pb-16">
            {children}
          </main>
          <VivaDemoDock />
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
