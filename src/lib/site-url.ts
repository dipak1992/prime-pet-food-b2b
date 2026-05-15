const FALLBACK_SITE_URL = "https://wholesale.theprimepetfood.com";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl || configuredUrl === "https://" || configuredUrl === "http://") {
    return FALLBACK_SITE_URL;
  }

  try {
    return new URL(configuredUrl).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const SITE_URL = getSiteUrl();

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
