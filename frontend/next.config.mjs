/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    // Also handle SVGs as raw strings for require() in config files
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.(cjs|config\.mjs|tailwind\.config\.cjs)$/,
      type: 'asset/resource',
    });

    return config;
  },
};

export default nextConfig;
