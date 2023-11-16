/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
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
  env: {
    NEXT_PUBLIC_SERVER:
      "https://ominous-invention-j9xg5vxq4692x77-8000.app.github.dev",
  },
  output: "standalone",
};

module.exports = nextConfig;
