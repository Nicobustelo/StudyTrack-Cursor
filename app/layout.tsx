import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { PostHogProvider } from "@/components/providers/posthog-provider";
import { getAppUrl } from "@/lib/app-url";

import "./globals.css";

const headingFont = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  applicationName: "StudyTrack",
  title: "StudyTrack — Tu camino de estudio personalizado",
  description:
    "Subí tus materiales y prepará tu examen con un plan personalizado, práctica guiada y progreso visible.",
  keywords: [
    "plan de estudio",
    "preparar exámenes",
    "estudio personalizado",
    "simulacros de examen",
    "Argentina",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "StudyTrack",
    title: "StudyTrack — Un camino claro hasta tu examen",
    description:
      "Convertí tus materiales en un plan personalizado con práctica y progreso visible.",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyTrack — Un camino claro hasta tu examen",
    description:
      "Convertí tus materiales en un plan personalizado con práctica y progreso visible.",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
