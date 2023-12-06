import localFont from "@next/font/local";
import { Inter } from "@next/font/google";

// const font = localFont({
//   src: [
//     { path: "./Satoshi-Variable.woff2", weight: "900", subsets: ["latin"] },
//   ],
// });
// const fontBold = localFont({
//   src: [{ path: "./Satoshi-Black.woff2" }],
// });
// const fontLight = localFont({ src: [{ path: "./Satoshi-Bold.woff2" }] });

const font = Inter({ weight: "800", subsets: ["latin"] });
const fontBold = Inter({ weight: "900", subsets: ["latin"] });
const fontLight = Inter({ weight: "700", subsets: ["latin"] });

export { font, fontBold, fontLight };
