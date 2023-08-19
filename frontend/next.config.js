/** @type {import('next').NextConfig} */


const server = process.env.BACKEND_SERVER_URL
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/',
        destination: `${server}/`,
      },
      {
        source: '/api/:slug',
        destination: `${server}/:slug/`, // Matched parameters can be used in the destination
      },
    ]
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ },
        use: ["@svgr/webpack"],
      }
    );
    fileLoaderRule.exclude = /\.svg$/i;
    return config;
  },
  output: "standalone",
};

module.exports = nextConfig;
