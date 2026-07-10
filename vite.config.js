import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        salesPreview: resolve(__dirname, "sales-preview.html"),
        aiTranscriptTest: resolve(__dirname, "ai-transcript-test.html"),
      },
    },
  },
});
