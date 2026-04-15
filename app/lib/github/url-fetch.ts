import { GITHUB_API } from "./shared";

export async function githubFetch<T>(
  url: string,
  token: string,
  attempt = 0
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (res.status === 429 || res.status === 403) {
    if (attempt >= 3) {
      const reset = res.headers.get("x-ratelimit-reset");
      const resetTime = reset
        ? new Date(Number(reset) * 1000).toISOString()
        : "unknown";
      throw new Error(`Rate limit exceeded. Resets at ${resetTime}`);
    }

    // Prefer the header, fall back to exponential backoff capped at 30s
    const retryAfter = res.headers.get("Retry-After");
    const waitMs = retryAfter
      ? parseInt(retryAfter) * 1000
      : Math.min(1000 * 2 ** attempt, 30_000);

    await new Promise((r) => setTimeout(r, waitMs));
    return githubFetch<T>(url, token, attempt + 1);
  }

  if (!res.ok) throw new Error(`GitHub API error ${res.status} on ${url}`);
  return res.json() as Promise<T>;
}
