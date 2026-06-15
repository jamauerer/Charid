export function getPortfolioPublicUrl(username: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://charid.app";
  return `${base}/u/${username}`;
}
