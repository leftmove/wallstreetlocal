/** @type {import('next').NextConfig} */


const nextConfig = {
  reactStrictMode: true,
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/',
  //       destination: `http://127.0.0.1:8000/`,
  //     },
  //     {
  //       source: '/api/:slug',
  //       destination: `http://127.0.0.1:8000/:slug/`, // Matched parameters can be used in the destination
  //     },
  //   ]
  // },
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
