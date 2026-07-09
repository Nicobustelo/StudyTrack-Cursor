import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const jakarta = loadJakarta("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});

export const headingFont = jakarta.fontFamily;
export const bodyFont = inter.fontFamily;
