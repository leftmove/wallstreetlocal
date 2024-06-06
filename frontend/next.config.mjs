const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    const fileLoaderRule = config.module?.rules?.find((rule) =>
      rule.test?.test?.(".svg")
    );

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
  reactStrictMode: true,
};

export default nextConfig;
