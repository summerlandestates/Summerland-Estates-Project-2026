import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";
import path from "path";
import fs from "fs";

function sitemapServePlugin() {
  return {
    name: 'sitemap-serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);
        const pathname = parsedUrl.pathname;

        if (pathname === '/sitemap.xml') {
          const filePath = path.resolve(__dirname, 'public/sitemap-static.xml');
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.end(fs.readFileSync(filePath, 'utf-8'));
          return;
        }

        if (pathname === '/sitemap.xsl') {
          const filePath = path.resolve(__dirname, 'public/sitemap.xsl');
          res.setHeader('Content-Type', 'application/xslt+xml; charset=utf-8');
          res.end(fs.readFileSync(filePath, 'utf-8'));
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sitemapServePlugin()],
  publicDir: "./public",
  base: "/",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
