/** @type {import('next').NextConfig} */

const nextConfig = {
  // Generate strong ETags for better HTTP caching of pages/assets
  generateEtags: true,
  // Opt-in to SWC minification and React strict optimizations
  swcMinify: true,
  // Leverage Next.js Image Optimization to resize and compress automatically
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Disable image optimization for external images to avoid issues
    unoptimized: false,
    // Allow all domains for now to debug
    domains: [
      "s3.eu-north-1.amazonaws.com",
      "litebite.cloud", 
      "images.unsplash.com",
      "tb-static.uber.com",
      "lh3.googleusercontent.com",
      "lh4.googleusercontent.com", 
      "lh5.googleusercontent.com",
      "lh6.googleusercontent.com",
      "img.cdn4dd.com",
      "assets.simpleviewinc.com",
      "play-lh.googleusercontent.com"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/litebite.cloud/**",
      },
      {
        protocol: "https",
        hostname: "litebite.cloud",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tb-static.uber.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.cdn4dd.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.simpleviewinc.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "play-lh.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Set caching headers for static assets via headers() API
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0" },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0" },
        ],
      },
    ];
  },
  env: {
    BASE_API_URL: process.env.BASE_API_URL,
    GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    HOTJAR_ID: process.env.HOTJAR_ID,
    GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
  },
};

export default nextConfig;
