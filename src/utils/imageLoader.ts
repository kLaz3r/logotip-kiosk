import type { ImageLoader } from "next/image";

export const localImageLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src, "http://localhost");
  url.searchParams.set("w", String(width));
  if (quality) url.searchParams.set("q", String(quality));
  return url.pathname + (url.search ? url.search : "");
};
