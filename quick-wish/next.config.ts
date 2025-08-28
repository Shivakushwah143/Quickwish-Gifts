

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    domains: ["images.unsplash.com", "floreal.in"],
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
