import { INVIDIOUS_INSTANCES } from "./invidiousInstances";

/**
 * Try each Invidious instance in order until one returns a 200+JSON response.
 * Throws if all instances fail.
 */
export async function invidiousFetch<T = any>(path: string, timeoutMs = 7000): Promise<T> {
  const controller = new AbortController();

  for (const base of INVIDIOUS_INSTANCES) {
    const url = `${base.replace(/\/$/, "")}${path}`;
    try {
      // optional per-request timeout
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const json = await res.json();
      return json as T;
    } catch (err) {
      // continue to next instance
      // create a new controller for next iteration
      // eslint-disable-next-line no-console
      console.warn(`Invidious attempt failed for ${url}:`, (err as Error).message);
    }
  }

  throw new Error("All Invidious instances failed");
}
