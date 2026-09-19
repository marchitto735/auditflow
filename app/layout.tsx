import "./runtime-debug";
import type { Metadata } from "next";
import {
  Inter,
  IBM_Plex_Sans,
  Work_Sans,
  Plus_Jakarta_Sans,
  Public_Sans,
  Source_Sans_3,
  Geist_Mono,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/hooks/use-theme";
import { CartProvider } from "@/components/cart/cart-context";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "./error-boundary";
import SidebarLayout from "@/components/sidebar-layout/sidebar-layout";
import { Analytics } from "@vercel/analytics/react"; // ⭐ ADDED

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex",
  weight: ["400", "500", "600", "700"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuditFlow",
  description: "Compliance made simple.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
(function() {
  var key = 'theme';
  var stored = localStorage.getItem(key);
  var theme;
  if (stored === 'dark' || stored === 'color' || stored === 'light') {
    theme = stored;
  } else {
    theme = 'light';
  }
  var path = window.location.pathname || '';
  var onProjects = path === '/projects' || path.indexOf('/projects/') === 0;
  var onCaseStudies = onProjects;
  if (onCaseStudies && theme === 'color') {
    theme = 'light';
  }
  var html = document.documentElement;
  html.classList.remove('light', 'dark', 'color');
  html.classList.add(theme);
})();
`;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body
        className={`${inter.variable} font-sans antialiased bg-zinc-50 dark:bg-background color:bg-background`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <CartProvider>
            <ErrorBoundary>
              <SidebarLayout>{children}</SidebarLayout>
            </ErrorBoundary>
          </CartProvider>
          <Toaster />
        </ThemeProvider>

        <Analytics /> {/* ⭐ ADDED */}
      </body>
    </html>
  );
}
