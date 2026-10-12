/**
 * Non-factual site constants. Facts (phones, address, programmes…) come from WordPress only.
 */
export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  shortName: 'SNC College',
  titleSuffix: 'SNC College, Simalwara',
  revalidateSeconds: 300,
  pageSize: 20,
  homeNoticeCount: 6,
  /**
   * The college's official emblem, bundled so the site is never without a logo.
   * "SNC Settings → College identity → College logo" overrides it (Settings.logo);
   * resolve the pair with `logoSrc()` rather than referencing either one directly.
   */
  logo: { src: '/images/logo.png', width: 638, height: 636 },
  logoAlt: 'Shiv Narayan Choubisa College, Simalwara',
} as const;

/** The logo to render: the one set in WordPress, else the bundled emblem. */
export function logoSrc(logo?: { url: string; width: number; height: number } | null) {
  return logo ? { src: logo.url, width: logo.width, height: logo.height } : siteConfig.logo;
}
