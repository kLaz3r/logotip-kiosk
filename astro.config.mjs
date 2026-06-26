import { defineConfig } from "astro/config";
import path from "node:path";

export default defineConfig({
  output: "static",
  build: {
    format: "directory",
  },
  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
  },
});
