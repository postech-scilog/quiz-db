import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
    root: "src",
    build: {
        rolldownOptions: {
            input: {
                main: resolve(import.meta.dirname, "src/index.html"),
                editor: resolve(import.meta.dirname, "src/editor/index.html")
            }
        },
        chunkSizeWarningLimit: 1000,
        emptyOutDir: true,
        outDir: "../dist",
        assetsDir: "static"
    },
});