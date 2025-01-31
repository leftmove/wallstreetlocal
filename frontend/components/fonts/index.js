import localFont from "next/font/local";

const font = localFont({
  src: "../../fonts/Switzer-Semibold.woff2",
  style: "normal",
  display: "swap",
  variable: "--font-medium",
});
const fontBold = localFont({
  src: "../../fonts/Switzer-Black.woff2",
  style: "normal",
  display: "swap",
  variable: "--font-bold",
});
const fontLight = localFont({
  src: "../../fonts/Switzer-Medium.woff2",
  style: "normal",
  display: "swap",
  variable: "--font-light",
});

export { font, fontBold, fontLight };
