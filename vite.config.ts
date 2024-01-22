import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/DF-Tools/",
    plugins: [
        react(),
        VitePWA({
            injectRegister: "auto",
            registerType: "autoUpdate",
            strategies: "injectManifest",
            filename: "sw.ts",
            srcDir: "src",
            devOptions: {
                enabled: true,
                type: "module",
            },
            injectManifest: {
                injectionPoint: null,
            },

            includeAssets: ["**/*.{png}"],
            base: "/DF-Tools/",
            manifest: {
                name: "DF Tools",
                short_name: "DFTools",
                description: "Data Future Tools",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
                theme_color: "#2e2e2e",
                scope: "/DF-Tools/",
                start_url: "/DF-Tools/",
                display: "standalone",
            },
            workbox: {
                cleanupOutdatedCaches: true,
                skipWaiting: true,
            },
        }),
    ],
});
