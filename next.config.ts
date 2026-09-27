import type { NextConfig } from "next";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

// Safety net for builds that skip the prebuild script: the brand colour stylesheet
// is normally written by scripts/fetch-logo.mjs (sampled from the real logo).
const brandCss = path.join(process.cwd(), "app", "brand-color.generated.css");
if (!existsSync(brandCss)) {
  writeFileSync(brandCss, "/* Fallback: logo could not be sampled. */\n:root { --brand-sampled: #2F5233; }\n");
}

const REMOTE_LOGO = "https://comprehensiveirrigation.com/wp-content/uploads/2023/12/logo.png";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    // scripts/fetch-logo.mjs downloads the real logo into /public/brand at build time.
    // If that download ever fails, these fallbacks proxy the same file straight from
    // comprehensiveirrigation.com so the logo and favicon never 404.
    return {
      beforeFiles: [],
      afterFiles: [
        { source: "/brand/logo.png", destination: REMOTE_LOGO },
        { source: "/brand/icon-:size.png", destination: REMOTE_LOGO },
      ],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
