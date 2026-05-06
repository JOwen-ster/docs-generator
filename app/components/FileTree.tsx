"use client";

import { useState } from "react";
import type { TreeNode } from "@/app/lib/github/shared";

interface FolderEntry {
  type: "folder";
  name: string;
  children: Entry[];
}

interface FileEntry {
  type: "file";
  name: string;
  node: TreeNode;
}

type Entry = FolderEntry | FileEntry;

// The GitHub API returns a flat list of file paths (e.g. "src/lib/foo.ts").
// This walks each path segment by segment to build a nested folder/file structure.
function buildTree(nodes: TreeNode[]): Entry[] {
  const root: FolderEntry = { type: "folder", name: "", children: [] };

  for (const node of nodes) {
    const parts = node.path.split("/");
    let current = root.children;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        // Last segment is the filename — attach the full TreeNode so it's available on click
        current.push({ type: "file", name: part, node });
      } else {
        // Intermediate segment is a folder — reuse if already created, otherwise create it
        let folder = current.find(
          (e): e is FolderEntry => e.type === "folder" && e.name === part,
        );
        if (!folder) {
          folder = { type: "folder", name: part, children: [] };
          current.push(folder);
        }
        current = folder.children;
      }
    }
  }
  return sortEntries(root.children);
}

function getDescendantPaths(entry: Entry): string[] {
  if (entry.type === "file") {
    return [entry.node.path];
  }
  return entry.children.flatMap(getDescendantPaths);
}

function getSelectionState(
  entry: Entry,
  checkedPaths: Set<string>,
): "checked" | "unchecked" | "indeterminate" {
  const paths = getDescendantPaths(entry);
  const checkedCount = paths.filter((p) => checkedPaths.has(p)).length;
  if (checkedCount === 0) return "unchecked";
  if (checkedCount === paths.length) return "checked";
  return "indeterminate";
}

// Renders a single entry — either a clickable file or a collapsible folder.
// Folders recursively render their children when expanded.
function TreeItem({
  entry,
  checkedPaths,
  onToggleCheck,
}: {
  entry: Entry;
  checkedPaths: Set<string>;
  onToggleCheck: (paths: string[], check: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  if (entry.type === "file") {
    const checked = checkedPaths.has(entry.node.path);
    return (
      <div
        className="tree-item"
        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggleCheck([entry.node.path], e.target.checked)}
        />
        <span className="tree-icon">📄</span> {entry.name}
      </div>
    );
  }

  const selState = getSelectionState(entry, checkedPaths);

  return (
    <div>
      <div
        className="tree-item tree-folder"
        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        <input
          type="checkbox"
          ref={(input) => {
            if (input) {
              input.indeterminate = selState === "indeterminate";
            }
          }}
          checked={selState === "checked"}
          onChange={(e) => {
            const paths = getDescendantPaths(entry);
            onToggleCheck(paths, e.target.checked);
          }}
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((o) => !o);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexGrow: 1,
          }}
        >
          <span className="tree-icon">{open ? "📂" : "📁"}</span> {entry.name}
        </div>
      </div>
      {open && (
        <div className="tree-children">
          {entry.children.map((child) => (
            <TreeItem
              key={child.type === "file" ? child.node.sha : child.name}
              entry={child}
              checkedPaths={checkedPaths}
              onToggleCheck={onToggleCheck}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  nodes: TreeNode[];
  checkedPaths: Set<string>;
  onCheckChange: (newCheckedPaths: Set<string>) => void;
}

export default function FileTree({
  nodes,
  checkedPaths,
  onCheckChange,
}: Props) {
  const tree = buildTree(nodes);

  function handleToggleCheck(paths: string[], check: boolean) {
    const newPaths = new Set(checkedPaths);
    for (const path of paths) {
      if (check) {
        newPaths.add(path);
      } else {
        newPaths.delete(path);
      }
    }
    onCheckChange(newPaths);
  }

  return (
    <div className="tree-container">
      {tree.map((entry) => (
        <TreeItem
          key={entry.type === "file" ? entry.node.sha : entry.name}
          entry={entry}
          checkedPaths={checkedPaths}
          onToggleCheck={handleToggleCheck}
        />
      ))}
    </div>
  );
}

// Folders before files, both groups sorted alphabetically to match GitHub's ordering
function sortEntries(entries: Entry[]): Entry[] {
  return entries
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map((entry) =>
      entry.type === "folder"
        ? { ...entry, children: sortEntries(entry.children) }
        : entry,
    );
}
