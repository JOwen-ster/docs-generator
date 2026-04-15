export const GITHUB_API = "https://api.github.com";

export interface RepoFile {
  path: string;
  content: string;
  size: number;
  sha: string;
}

export interface TreeNode {
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

export function isBinary(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return BINARY_EXTENSIONS.has(ext);
}

function decodeBase64(encoded: string): string {
  return Buffer.from(encoded.replace(/\n/g, ""), "base64").toString("utf-8");
}
