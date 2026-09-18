import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react"],
  },
  build: {
    target: "esnext",
    lib: {
      entry: new URL("./src/index.ts", import.meta.url).pathname,
      formats: ["es"],
      fileName: "index",
    },
    rolldownOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-reconciler",
        "react-reconciler/constants",
        "siecs-ts",
      ],
    },
  },
  test: {
    benchmark: {
      include: ["bench/*.tsx"],
    },
  },
});
