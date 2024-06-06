import { NextConfig } from 'next';
import { Configuration, RuleSetRule } from 'webpack';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config: Configuration) {
    const fileLoaderRule = config.module?.rules?.find((rule) =>
      (rule as RuleSetRule).test?.test?.(".svg")
    ) as RuleSetRule;

    config.module?.rules?.push(
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
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }
    return config;
  },
  env: {
    NEXT_PUBLIC_SERVER: "https://content.wallstreetlocal.com",
  },
  output: "standalone",
};

export default nextConfig;