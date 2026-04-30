"use client"

import { useState, useEffect } from "react"

interface Repo {
    name: string
    owner: string
    default_branch: string
}

interface Props {
    onSelect: (repo: Repo) => void
}

export default function RepoSelector({ onSelect }: Props) {
    const [repos, setRepos] = useState<Repo[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch the user's repos once on mount — the API route handles auth server-side
    useEffect(() => {
        fetch("/api/repos")
        .then((r) => r.json())
        .then((data) => {
            setRepos(data)
            setLoading(false)
        })
    }, [])

    if (loading) return <p className="text-sm text-zinc-500">Loading repositories...</p>

    return (
        <select
            defaultValue=""
            // Use the array index as the option value so we can look up the full Repo object on change
            onChange={(e) => {
                const repo = repos[Number(e.target.value)]
                if (repo) onSelect(repo)
            }}
            className="border rounded px-3 py-2 w-full"
        >
            <option value="" disabled>
                Select a repository
            </option>
            {repos.map((repo, i) => (
                <option key={`${repo.owner}/${repo.name}`} value={i}>
                {repo.owner}/{repo.name}
                </option>
            ))}
        </select>
    )
}