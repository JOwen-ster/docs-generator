const GITHUB_API = "https://api.github.com";

interface RepoFile {
  path: string;
  content: string;
  size: number;
  sha: string;
}

interface TreeNode {
  path: string;
  type: "blob" | "tree";
  size?: number;
  sha: string;
  url: string;
}

interface TreeResponse {
  tree: TreeNode[];
  truncated: boolean;
}

interface BlobResponse {
  content: string;
  encoding: "base64" | "utf-8";
}

const BINARY_EXTENSIONS = new Set([
  "png","jpg","jpeg","gif","webp","ico","bmp","tiff",
  "mp4","mp3","wav","ogg","mov","avi","webm",
  "pdf","zip","tar","gz","rar","7z",
  "exe","dll","so","dylib","bin","wasm",
  "ttf","otf","woff","woff2","eot",
  "pyc","class","o","a","db","sqlite","lock",
]);

function parseGithubUrl(url: string): { owner: string; repo: string } {
  const cleaned = url.trim().replace(/\/$/, "").replace(/\.git$/, "");
  const match = cleaned.match(/github\.com[/:]([^/]+)\/([^/]+)/);
  if (!match) throw new Error(`Invalid GitHub URL: ${url}`);
  return { owner: match[1], repo: match[2] };
}

function isBinary(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return BINARY_EXTENSIONS.has(ext);
}

function decodeBase64(encoded: string): string {
  return Buffer.from(encoded.replace(/\n/g, ""), "base64").toString("utf-8");
}

async function githubFetch<T>(url: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { headers });

  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get("x-ratelimit-reset");
    const resetTime = reset ? new Date(Number(reset) * 1000).toISOString() : "unknown";
    throw new Error(`Rate limit hit. Resets at ${resetTime}`);
  }
  if (!res.ok) throw new Error(`GitHub API error ${res.status} on ${url}`);
  return res.json() as Promise<T>;
}

async function fetchRepo(githubUrl: string, token?: string): Promise<RepoFile[]> {
  const { owner, repo } = parseGithubUrl(githubUrl);

  const { default_branch } = await githubFetch<{ default_branch: string }>(
    `${GITHUB_API}/repos/${owner}/${repo}`,
    token
  );

  const { tree, truncated } = await githubFetch<TreeResponse>(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${default_branch}?recursive=1`,
    token
  );

  if (truncated) console.warn("⚠ Tree truncated — repo too large for a single request.");

  const blobs = tree.filter(
    (n) => n.type === "blob" && !isBinary(n.path) && (n.size ?? 0) <= 500_000
  );

  const results: RepoFile[] = [];
  const CONCURRENCY = 5;

  for (let i = 0; i < blobs.length; i += CONCURRENCY) {
    const batch = blobs.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(async (node) => {
        const blob = await githubFetch<BlobResponse>(node.url, token);
        const content = blob.encoding === "base64"
          ? decodeBase64(blob.content)
          : blob.content;
        return { path: node.path, content, size: node.size ?? 0, sha: node.sha };
      })
    );
    for (const r of settled) {
      if (r.status === "fulfilled") results.push(r.value);
      else console.warn("Failed:", r.reason);
    }
  }

  return results;
}

(async () => {
  const REPO_URL = "https://github.com/";
  const TOKEN = "";

  console.log(`\nFetching: ${REPO_URL}\n${"─".repeat(50)}`);

  const files = await fetchRepo(REPO_URL, TOKEN);

  for (const file of files) {
    console.log(`\n📄 ${file.path}  (${file.size} bytes)`);
    console.log("─".repeat(50));
    console.log(file.content.trimEnd());
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✓ ${files.length} file(s) fetched from ${REPO_URL}`);
})();