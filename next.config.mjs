const nextConfig = {
  // Allow server-side fetching from any domain
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
};

export default nextConfig;

