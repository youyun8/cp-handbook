// True when building for a static export target (e.g. GitHub Pages).
// In this mode the GitHub OAuth backend (server actions, API route handlers,
// session reads) is unavailable, so those features are gracefully disabled.
//
// STATIC_EXPORT is read in server contexts; NEXT_PUBLIC_STATIC_EXPORT is
// inlined into client bundles so client components see the same value and
// avoid hydration mismatches.
export const isStaticExport =
  process.env.STATIC_EXPORT === 'true' || process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';
