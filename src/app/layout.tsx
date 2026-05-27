import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Indian Wedding Invitation",
  description: "Beautiful Indian Wedding Invitation with RSVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&family=Lato:wght@300;400;700&family=Montserrat:wght@300;400;600;700;800&family=Poppins:wght@300;400;500;600;700&family=Raleway:wght@300;400;600;700&family=Ubuntu:wght@300;400;500;700&family=Nunito:wght@300;400;600;700;800&family=Source+Sans+Pro:wght@300;400;600;700&family=Playfair+Display:wght@400;500;600;700;800&family=Merriweather:wght@300;400;700&family=Lora:wght@400;500;600;700&family=PT+Serif:wght@400;700&family=Crimson+Text:wght@400;600;700&family=Cormorant:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&family=EB+Garamond:wght@400;500;600;700;800&family=Great+Vibes&family=Dancing+Script:wght@400;500;600;700&family=Pacifico&family=Satisfy&family=Cookie&family=Alex+Brush&family=Allura&family=Sacramento&family=Tangerine:wght@400;700&family=Kaushan+Script&family=Amatic+SC:wght@400;700&family=Shadows+Into+Light&family=Indie+Flower&family=Caveat:wght@400;500;600;700&family=Permanent+Marker&family=Yellowtail&family=Kalam:wght@300;400;700&family=Homemade+Apple&family=La+Belle+Aurore&family=Mrs+Saint+Delafield&family=Pinyon+Script&family=Redressed&family=Ruthie&family=Bilbo&family=Clicker+Script&family=Cinzel:wght@400;500;600;700;800&family=Bebas+Neue&family=Oswald:wght@300;400;500;600;700&family=Righteous&family=Fjalla+One&family=Anton&family=Archivo+Black&family=Bangers&family=Hind:wght@300;400;500;600;700&family=Prata&family=Gentium+Book+Basic:wght@400;700&family=Karma:wght@300;400;500;600;700&family=Teko:wght@300;400;500;600;700&family=Mukta:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
