export function getTenantFromHost(hostname: string, baseDomain: string): string | null {
  if (hostname === baseDomain) return null;
  const parts = hostname.split('.');
  if (parts.length > 1 && hostname.endsWith(baseDomain)) return parts[0];
  return null;
}
