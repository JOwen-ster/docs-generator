"use client"

import { useState } from "react"
import RepoSelector from "./RepoSelector"
import FileTree from "./FileTree"
import FileRundown from "./FileRundown"
import type { TreeNode } from "@/app/lib/github/shared"

interface Repo {
    name: string
    owner: string
    default_branch: string
}

interface Rundown {
    summary: string
    technical: string[]
}

export default function AppShell() {
    const [nodes, setNodes] = useState<TreeNode[] | null>(null)
    const [loadingTree, setLoadingTree] = useState(false)
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
    const [rundown, setRundown] = useState<Rundown | null>(null)
    const [loadingRundown, setLoadingRundown] = useState(false)
    const [rundownError, setRundownError] = useState<string | null>(null)

    async function handleRepoSelect(repo: Repo) {
        setNodes(null)
        setSelectedNode(null)
        setRundown(null)
        setRundownError(null)
        setLoadingTree(true)

        const res = await fetch(
            `/api/tree?owner=${repo.owner}&repo=${repo.name}&ref=${repo.default_branch}`
        )
        setNodes(await res.json())
        setLoadingTree(false)
    }

    async function handleFileSelect(node: TreeNode) {
        setSelectedNode(node)
        setRundown(null)
        setRundownError(null)
        setLoadingRundown(true)

        try {
            // Two sequential fetches: first get the file content, then generate the rundown.
            // node.url is a GitHub blob API URL — must be encoded since it contains query chars.
            const blobRes = await fetch(`/api/blob?url=${encodeURIComponent(node.url)}`)
            if (!blobRes.ok) {
                const { error } = await blobRes.json()
                throw new Error(error ?? "Failed to fetch file content")
            }
            const { content } = await blobRes.json()

            const docsRes = await fetch("/api/generate-docs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: node.path, content }),
            })
            if (!docsRes.ok) {
                const { error } = await docsRes.json()
                throw new Error(error ?? "Failed to generate rundown")
            }
            const data: Rundown = await docsRes.json()
            setRundown(data)
        } catch (err) {
            setRundownError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoadingRundown(false)
        }
    }

    return (
        <div className="app-grid">
            <div className="panel sidebar-panel">
                <RepoSelector onSelect={handleRepoSelect} />

                {loadingTree && (
                    <div className="status-msg">
                        <span>Loading repository tree...</span>
                    </div>
                )}

                {nodes && !loadingTree && (
                    <FileTree nodes={nodes} onSelect={handleFileSelect} />
                )}
            </div>

            <div className="panel content-panel">
                {!selectedNode && !nodes && !loadingTree && (
                    <div className="empty-state">
                        <div className="empty-icon">📁</div>
                        <p>Select a repository to explore its codebase</p>
                    </div>
                )}

                {!selectedNode && nodes && (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <p>Select a file to generate a rundown</p>
                    </div>
                )}

                {selectedNode && (
                    <FileRundown
                        node={selectedNode}
                        rundown={rundown}
                        loading={loadingRundown}
                        error={rundownError}
                    />
                )}
            </div>
        </div>
    )
}
