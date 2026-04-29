/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export", // Required for GitHub Pages static deployment
  reactStrictMode: true,
  ...(basePath ? { basePath } : {}),
  images: { unoptimized: true },
};

export default nextConfig;
