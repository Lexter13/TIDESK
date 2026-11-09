import type { NextConfig } from "next";
import path from "node:path";

// Docker/Dokploy: apps/web/Dockerfile define NEXT_OUTPUT=standalone para generar `.next/standalone`
// (servidor mínimo con solo lo necesario). En local no se define y nada cambia.
// outputFileTracingRoot apunta a la raíz del monorepo porque las dependencias están hoisteadas allí.
const standalone =
  process.env.NEXT_OUTPUT === "standalone"
    ? { output: "standalone" as const, outputFileTracingRoot: path.join(__dirname, "../../") }
    : {};

const nextConfig: NextConfig = {
  /* config options here */
  ...standalone,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
