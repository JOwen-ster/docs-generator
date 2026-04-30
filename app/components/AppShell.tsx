"use client"

import RepoSelector from "./RepoSelector"

interface Repo {
    name: string
    owner: string
    default_branch: string
}

export default function AppShell() {
// Defined here in a Client Component so it can be safely passed down to RepoSelector
    return <RepoSelector onSelect={(repo) => console.log(repo)} />
}