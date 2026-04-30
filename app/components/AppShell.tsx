"use client"

import { useState } from "react"
import RepoSelector from "./RepoSelector"
import FileTree from "./FileTree"
import type { TreeNode } from "@/app/lib/github/shared"

interface Repo {
    name: string
    owner: string
    default_branch: string
}

export default function AppShell() {
    const [nodes, setNodes] = useState<TreeNode[] | null>(null)
    const [loadingTree, setLoadingTree] = useState(false)

    async function handleRepoSelect(repo: Repo) {
        // Clear the previous tree immediately so the old repo's files don't flash
        // while the new tree is loading
        setNodes(null)
        setLoadingTree(true)

        const res = await fetch(
            `/api/tree?owner=${repo.owner}&repo=${repo.name}&ref=${repo.default_branch}`
        )
        setNodes(await res.json())
        setLoadingTree(false)
    }

    return (
        <div className="flex flex-col gap-6">
            <RepoSelector onSelect={handleRepoSelect} />

            {loadingTree && <p className="text-sm text-zinc-500">Loading file tree...</p>}

            {nodes && (
            <div className="border rounded p-4 max-h-96 overflow-auto">
                <FileTree nodes={nodes} onSelect={(node) => console.log(node)} />
            </div>
            )}
      </div>
    )
  }