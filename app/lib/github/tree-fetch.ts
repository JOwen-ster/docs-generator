import { githubFetch } from "./url-fetch";
import { isBinary, TreeNode } from "./shared";

const GITHUB_API = "https://api.github.com";
const MAX_FILE_SIZE = 500_000;

interface TreeResponse {
  tree: TreeNode[];
  truncated: boolean;
}

// Fetch the full repo tree. If truncated, fall back to fetching
// only the directories the user actually selected — individually.
export async function fetchTree(
  owner: string,
  repo: string,
  branch: string,
  token: string,
  // Only needed if the full tree is truncated
  selectedDirs?: string[]
): Promise<TreeNode[]> {
  const { tree, truncated } = await githubFetch<TreeResponse>(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    token
  );

  if (!truncated) {
    return filterBlobs(tree);
  }

  // Tree was truncated — repo is too large for a single recursive call.
  // We only care about what the user selected, so fetch those dirs individually.
  if (!selectedDirs?.length) {
    throw new Error(
      "Repository tree is too large. Please select specific directories."
    );
  }

  return fetchSelectedDirsIndividually(owner, repo, token, selectedDirs);
}

// Fetch each selected directory's tree individually (non-recursive per dir,
// then walk into subdirs). This is the fallback for truncated repos.
async function fetchSelectedDirsIndividually(
  owner: string,
  repo: string,
  token: string,
  dirs: string[]
): Promise<TreeNode[]> {
  const allNodes: TreeNode[] = [];

  for (const dir of dirs) {
    const { tree } = await githubFetch<TreeResponse>(
      `${GITHUB_API}/repos/${owner}/${repo}/git/trees/HEAD:${dir}?recursive=1`,
      token
    );
    // Prefix paths with the dir name so they match the original tree structure
    const prefixed = tree.map((n: any) => ({ ...n, path: `${dir}/${n.path}` }));
    allNodes.push(...filterBlobs(prefixed));
  }

  return allNodes;
}

function filterBlobs(nodes: TreeNode[]): TreeNode[] {
  return nodes.filter(
    (n) => n.type === "blob" && !isBinary(n.path) && (n.size ?? 0) <= MAX_FILE_SIZE
  );
}
