"use client"

import { useState } from "react"
import type { TreeNode } from "@/app/lib/github/shared"

interface FolderEntry {
    type: "folder"
    name: string
    children: Entry[]
}

interface FileEntry {
    type: "file"
    name: string
    node: TreeNode
}

type Entry = FolderEntry | FileEntry

// The GitHub API returns a flat list of file paths (e.g. "src/lib/foo.ts").
// This walks each path segment by segment to build a nested folder/file structure.
function buildTree(nodes: TreeNode[]): Entry[] {
    const root: FolderEntry = { type: "folder", name: "", children: [] }

    for (const node of nodes) {
        const parts = node.path.split("/")
        let current = root.children

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i]
            const isLast = i === parts.length - 1

            if (isLast) {
                // Last segment is the filename — attach the full TreeNode so it's available on click
                current.push({ type: "file", name: part, node })
            } else {
                // Intermediate segment is a folder — reuse if already created, otherwise create it
                let folder = current.find(
                (e): e is FolderEntry => e.type === "folder" && e.name === part
                )
                if (!folder) {
                folder = { type: "folder", name: part, children: [] }
                current.push(folder)
                }
                current = folder.children
            }
        }
    }
    return sortEntries(root.children)
}

// Renders a single entry — either a clickable file or a collapsible folder.
// Folders recursively render their children when expanded.
function TreeItem({
    entry,
    selectedSha,
    onSelect,
}: {
    entry: Entry
    selectedSha: string | null
    onSelect: (node: TreeNode) => void
}) {
    const [open, setOpen] = useState(false)

    if (entry.type === "file") {
        const selected = entry.node.sha === selectedSha
        return (
            <div
            onClick={() => onSelect(entry.node)}
            className={`cursor-pointer px-2 py-0.5 rounded text-sm ${
                selected
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            >
                {entry.name}
            </div>
        )
    }

    return (
        <div>
            <div
            onClick={() => setOpen((o) => !o)}
            className="cursor-pointer px-2 py-0.5 rounded text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
                {open ? "▾" : "▸"} {entry.name}/
            </div>
            {open && (
                <div className="ml-4">
                {entry.children.map((child) => (
                    <TreeItem
                    key={child.type === "file" ? child.node.sha : child.name}
                    entry={child}
                    selectedSha={selectedSha}
                    onSelect={onSelect}
                    />
                ))}
                </div>
            )}
        </div>
    )
}

interface Props {
    nodes: TreeNode[]
    onSelect: (node: TreeNode) => void
}

export default function FileTree({ nodes, onSelect }: Props) {
    // Track which file is selected by SHA so the highlight stays correct even if
    // the same filename appears in multiple folders
    const [selectedSha, setSelectedSha] = useState<string | null>(null)
    const tree = buildTree(nodes)

    function handleSelect(node: TreeNode) {
        setSelectedSha(node.sha)
        onSelect(node)
    }

    return (
        <div className="font-mono">
            {tree.map((entry) => (
                <TreeItem
                key={entry.type === "file" ? entry.node.sha : entry.name}
                entry={entry}
                selectedSha={selectedSha}
                onSelect={handleSelect}
                />
            ))}
        </div>
    )
}

// Folders before files, both groups sorted alphabetically to match GitHub's ordering
function sortEntries(entries: Entry[]): Entry[] {
    return entries
        .sort((a, b) => {
            if (a.type !== b.type) return a.type === "folder" ? -1 : 1
            return a.name.localeCompare(b.name)
        })
        .map((entry) =>
            entry.type === "folder"
                ? { ...entry, children: sortEntries(entry.children) }
                : entry
        )
}