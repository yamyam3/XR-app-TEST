const appBaseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);

export const resolveAssetUrl = (path: string) =>
  new URL(path.replace(/^\/+/, ""), appBaseUrl).toString();
