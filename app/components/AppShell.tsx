"use client";

import { useState } from "react";
import type { TreeNode } from "@/app/lib/github/shared";
import FileRundown from "./FileRundown";
import FileTree from "./FileTree";
import RepoSelector from "./RepoSelector";

interface Repo {
  name: string;
  owner: string;
  default_branch: string;
}

interface Rundown {
  summary: string;
  technical: string[];
}

export default function AppShell() {
  const [nodes, setNodes] = useState<TreeNode[] | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);
  const [checkedPaths, setCheckedPaths] = useState<Set<string>>(new Set());
  const [rundownFiles, setRundownFiles] = useState<string[]>([]);
  const [rundown, setRundown] = useState<Rundown | null>(null);
  const [loadingRundown, setLoadingRundown] = useState(false);
  const [rundownError, setRundownError] = useState<string | null>(null);

  async function handleRepoSelect(repo: Repo) {
    setNodes(null);
    setCheckedPaths(new Set());
    setRundownFiles([]);
    setRundown(null);
    setRundownError(null);
    setLoadingTree(true);

    const res = await fetch(
      `/api/tree?owner=${repo.owner}&repo=${repo.name}&ref=${repo.default_branch}`,
    );
    setNodes(await res.json());
    setLoadingTree(false);
  }

  async function fetchFileContents(nodesToFetch: TreeNode[]) {
    const results: { path: string; content: string }[] = [];
    // Fetch in chunks of 10 to avoid overwhelming network/rate limits
    for (let i = 0; i < nodesToFetch.length; i += 10) {
      const chunk = nodesToFetch.slice(i, i + 10);
      const chunkResults = await Promise.all(
        chunk.map(async (n) => {
          const blobRes = await fetch(
            `/api/blob?url=${encodeURIComponent(n.url)}`,
          );
          if (!blobRes.ok) {
            const { error } = await blobRes.json().catch(() => ({}));
            throw new Error(
              error ?? `Failed to fetch file content for ${n.path}`,
            );
          }
          const { content } = await blobRes.json();
          return { path: n.path, content };
        }),
      );
      results.push(...chunkResults);
    }
    return results;
  }

  async function handleSummarize(useFullContext: boolean) {
    if (!nodes || checkedPaths.size === 0) return;

    const selectedNodes = nodes.filter((n) => checkedPaths.has(n.path));
    setRundownFiles(selectedNodes.map((n) => n.path));
    setRundown(null);
    setRundownError(null);
    setLoadingRundown(true);

    try {
      const files = await fetchFileContents(selectedNodes);
      let projectContext: { path: string; content: string }[] | undefined;

      if (useFullContext) {
        // Fetch ALL files for project context (excluding the ones already fetched)
        const remainingNodes = nodes.filter((n) => !checkedPaths.has(n.path));
        const remainingFiles = await fetchFileContents(remainingNodes);
        projectContext = [...files, ...remainingFiles];
      }

      const fileTree = nodes.map((n) => n.path);

      const docsRes = await fetch("/api/generate-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, fileTree, projectContext }),
      });

      if (!docsRes.ok) {
        const { error } = await docsRes.json();
        throw new Error(error ?? "Failed to generate rundown");
      }

      const data: Rundown = await docsRes.json();
      setRundown(data);
    } catch (err) {
      setRundownError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingRundown(false);
    }
  }

  return (
    <div className="app-grid">
      <div
        className="panel sidebar-panel"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <RepoSelector onSelect={handleRepoSelect} />

        {loadingTree && (
          <div className="status-msg">
            <span>Loading repository tree...</span>
          </div>
        )}

        {nodes && !loadingTree && (
          <div style={{ flexGrow: 1, overflowY: "auto", marginBottom: "1rem" }}>
            <FileTree
              nodes={nodes}
              checkedPaths={checkedPaths}
              onCheckChange={setCheckedPaths}
            />
          </div>
        )}

        {nodes && !loadingTree && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              padding: "1rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              className="btn-primary"
              disabled={checkedPaths.size === 0 || loadingRundown}
              onClick={() => handleSummarize(false)}
            >
              Summarize Selected ({checkedPaths.size})
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={checkedPaths.size === 0 || loadingRundown}
              onClick={() => handleSummarize(true)}
            >
              Summarize with Full Context
            </button>
          </div>
        )}
      </div>

      <div className="panel content-panel">
        {rundownFiles.length === 0 && !nodes && !loadingTree && (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <p>Select a repository to explore its codebase</p>
          </div>
        )}

        {rundownFiles.length === 0 && nodes && (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <p>Select file(s) and click summarize to generate a rundown</p>
          </div>
        )}

        {rundownFiles.length > 0 && (
          <FileRundown
            files={rundownFiles}
            rundown={rundown}
            loading={loadingRundown}
            error={rundownError}
          />
        )}
      </div>
    </div>
  );
}
