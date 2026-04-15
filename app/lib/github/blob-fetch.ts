import { githubFetch } from "./api";
import { RepoFile, TreeNode } from "./client";

interface BlobResponse {
  content: string;
  encoding: "base64" | "utf-8";
}

interface FetchBlobsOptions {
  concurrency?: number;
  onProgress?: (completed: number, total: number) => void;
}

interface FetchBlobsResult {
  files: RepoFile[];
  errors: { path: string; error: string }[];
}

export async function fetchBlobs(
  nodes: TreeNode[],
  token: string,
  options: FetchBlobsOptions = {}
): Promise<FetchBlobsResult> {
  const { concurrency = 10, onProgress } = options;

  const files: RepoFile[] = [];
  const errors: { path: string; error: string }[] = [];
  let completed = 0;

  // Deduplicate by SHA — two selected paths pointing to the same blob
  // (e.g. a file selected individually AND via its parent dir) fetch once.
  const unique = dedupeBySha(nodes);

  async function fetchOne(node: TreeNode): Promise<void> {
    try {
      const blob = await githubFetch<BlobResponse>(node.url, token);
      const content =
        blob.encoding === "base64"
          ? Buffer.from(blob.content.replace(/\n/g, ""), "base64").toString("utf-8")
          : blob.content;

      files.push({ path: node.path, content, size: node.size ?? 0, sha: node.sha });
    } catch (err) {
      errors.push({
        path: node.path,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      completed++;
      onProgress?.(completed, unique.length);
    }
  }

  // Rolling worker pool — workers self-schedule from a shared index.
  // Unlike batch slicing, this keeps all workers busy until the queue is empty.
  let index = 0;

  async function worker(): Promise<void> {
    while (index < unique.length) {
      const node = unique[index++];
      await fetchOne(node);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  return { files, errors };
}

function dedupeBySha(nodes: TreeNode[]): TreeNode[] {
  const seen = new Set<string>();
  return nodes.filter((n) => {
    if (seen.has(n.sha)) return false;
    seen.add(n.sha);
    return true;
  });
}
