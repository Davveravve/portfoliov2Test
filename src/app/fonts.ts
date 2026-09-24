import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

/** The site uses exactly two faces: Geist Sans (display, body, UI) and Geist Mono (labels, readouts). */
export const geistSans = GeistSans;
export const geistMono = GeistMono;

export const fontVariables = `${geistSans.variable} ${geistMono.variable}`;
