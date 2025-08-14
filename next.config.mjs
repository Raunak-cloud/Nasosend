// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "images.unsplash.com",
      "ui-avatars.com",
    ],
  },
};

export default nextConfig;
