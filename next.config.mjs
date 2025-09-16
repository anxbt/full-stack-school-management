/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { hostname: "ui-avatars.com" },
      { hostname: "i.pravatar.cc" }
    ],
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;
