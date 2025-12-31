import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mu7pejq8z1rf3djw.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ceyhunlar-numune-form.s3.eu-central-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ceyhunlar-numune-form.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
