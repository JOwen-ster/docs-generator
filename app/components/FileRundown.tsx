"use client"

// Purely presentational — no fetching here. AppShell owns the data and passes it down.
import type { TreeNode } from "@/app/lib/github/shared"

interface Rundown {
    summary: string
    technical: string[] // bullet points from Gemini, rendered as a <ul>
}

interface Props {
    node: TreeNode
    rundown: Rundown | null
    loading: boolean
    error: string | null
}

export default function FileRundown({ node, rundown, loading, error }: Props) {
    const filename = node.path.split("/").pop()

    return (
        <div className="border rounded p-4 flex flex-col gap-3">
            <h2 className="font-mono text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {filename}
            </h2>

            {loading && (
                <p className="text-sm text-zinc-500">Generating rundown...</p>
            )}

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {rundown && (
                <>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {rundown.summary}
                    </p>

                    <ul className="list-disc list-inside flex flex-col gap-1">
                        {rundown.technical.map((bullet, i) => (
                            <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                                {bullet}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
}
