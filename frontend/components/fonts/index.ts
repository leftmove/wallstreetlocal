import { Inter } from "@next/font/google";

type FontWeight = "700" | "800" | "900";

interface FontOptions {
    weight: FontWeight;
    subsets: string[];
    className: string;
}

const font: FontOptions = Inter({ weight: "800", subsets: ["latin"] });
const fontBold: FontOptions = Inter({ weight: "900", subsets: ["latin"] });
const fontLight: FontOptions = Inter({ weight: "700", subsets: ["latin"] });

export { font, fontBold, fontLight };