const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const inferredBasePath = process.env.GITHUB_ACTIONS === 'true' && repoName ? `/${repoName}` : '';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? inferredBasePath;

// Static export (GitHub Pages) is opt-in via STATIC_EXPORT=true.
// The default build runs in server mode so GitHub OAuth / API routes work.
const staticExport = process.env.STATIC_EXPORT === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(staticExport ? { output: 'export' } : {}),
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      }
    ]
  }
};

export default nextConfig;
