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
        <div className="rundown-container">
            <div className="rundown-header">
                <h2 className="rundown-title">
                    {filename}
                </h2>
            </div>

            {loading && (
                <div className="status-msg">
                    <span>Generating architectural rundown...</span>
                </div>
            )}

            {error && (
                <div className="error-msg">
                    <span>⚠</span> {error}
                </div>
            )}

            {rundown && (
                <div className="rundown-content">
                    <p className="rundown-summary">
                        {rundown.summary}
                    </p>

                    <h3 className="rundown-tech-title">Technical Details</h3>
                    <ul className="rundown-tech-list">
                        {rundown.technical.map((bullet, i) => (
                            <li key={i}>
                                {bullet}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
