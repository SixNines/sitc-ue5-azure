/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    // Will be available on both server and client
    CUMULUS_AUTH_API_KEY: `${process.env.CUMULUS_AUTH_API_KEY}`,
    BASE_URL: `${process.env.API_PROTOCOL || "http"}://${process.env.BASE_URL}`,
    AWS_DEFAULT_REGION: `${process.env.AWS_DEFAULT_REGION}`,
  },
};

module.exports = nextConfig;
