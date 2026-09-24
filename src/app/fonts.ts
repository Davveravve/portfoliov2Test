import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";

/** Display face: Archivo with the width axis, set expanded for headlines. */
export const archivo = localFont({
  src: "./fonts/archivo-latin-wdth.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export const geistSans = GeistSans;
export const geistMono = GeistMono;

export const fontVariables = `${archivo.variable} ${geistSans.variable} ${geistMono.variable}`;
