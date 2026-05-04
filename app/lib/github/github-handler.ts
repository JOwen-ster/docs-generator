import { auth } from "@/auth";
import { githubFetch } from "./url-fetch";
import { fetchTree } from "./tree-fetch";
import { fetchBlobs } from "./blob-fetch";
import { RepoFile } from "./shared";

const GITHUB_API = "https://api.github.com";

export interface ArtifactInput {
  path: string;
  type: "dir" | "file";
}

export interface ArtifactContent {
  path: string;
  type: "dir" | "file";
  files: RepoFile[];
}

export async function getArtifactContents(
  owner: string,
  repo: string,
  selections: ArtifactInput[],
  onProgress?: (completed: number, total: number) => void
): Promise<ArtifactContent[]> {
  const session = await auth();
  const token = session?.access_token as string;

  // get root of main branch
  const { default_branch } = await githubFetch<{ default_branch: string }>(
    `${GITHUB_API}/repos/${owner}/${repo}`,
    token
  );

  // fetch the full tree (with truncation fallback)
  const selectedDirs = selections
    .filter((s) => s.type === "dir")
    .map((s) => s.path);

  const allNodes = await fetchTree(owner, repo, default_branch, token, selectedDirs);

  // gather the relevant tree nodes for each selection
  const nodesByArtifact = selections.map((selection) => {
    if (selection.type === "file") {
      const node = allNodes.find((n) => n.path === selection.path);
      return { ...selection, nodes: node ? [node] : [] };
    }
    // Directory: collect all blobs underneath it
    const children = allNodes.filter(
      (n) => n.path.startsWith(`${selection.path}/`)
    );
    return { ...selection, nodes: children };
  });

  // fetch all unique blobs across all artifacts in one pooled operation
  const allNodes_ = nodesByArtifact.flatMap((a) => a.nodes);
  const { files, errors } = await fetchBlobs(allNodes_, token, {
    concurrency: 10,
    onProgress,
  });

  if (errors.length) {
    console.warn(`${errors.length} file(s) failed to fetch:`, errors);
  }

  // group fetched files back into their artifacts
  const fileMap = new Map(files.map((f) => [f.path, f]));

  return nodesByArtifact.map(({ path, type, nodes }) => ({
    path,
    type,
    files: nodes.map((n) => fileMap.get(n.path)).filter(Boolean) as RepoFile[],
  }));
}