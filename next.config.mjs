const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const inferredBasePath = process.env.GITHUB_ACTIONS === 'true' && repoName ? `/${repoName}` : '';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? inferredBasePath;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
