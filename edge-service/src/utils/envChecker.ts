export function requiredEnv(name: string, fallback?: string): string {
  const v = process.env[name] || fallback;
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}
export function toInt(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number(raw) : fallback;
  if (!Number.isFinite(n)) throw new Error(`Invalid number env:${name}=${raw}`);
  return n;
}
