import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";

/** Editorial accent: Instrument Serif italic, used for single emphasised words in headlines. */
export const instrumentSerif = localFont({
  src: "./fonts/instrument-serif-italic.woff2",
  variable: "--font-instrument-serif",
  weight: "400",
  style: "italic",
  display: "swap",
});

export const geistSans = GeistSans;
export const geistMono = GeistMono;

export const fontVariables = `${instrumentSerif.variable} ${geistSans.variable} ${geistMono.variable}`;
