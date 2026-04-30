import { auth } from "@/auth"

interface GithubRepo {
    name: string
    owner: { login: string }
    default_branch: string
}

export async function GET() {
    const session = await auth()

    // Reject unauthenticated requests before hitting the GitHub API
    if (!session?.access_token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const res = await fetch(
        "https://api.github.com/user/repos?sort=updated&per_page=50",
        {
        headers: {
            Authorization: `Bearer ${session.access_token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        }
    )

    if (!res.ok) {
        return Response.json({ error: "GitHub API error" }, { status: res.status })
    }

    const repos: GithubRepo[] = await res.json()

    // Return only the fields the UI needs — avoids leaking the full GitHub payload to the client
    return Response.json(
        repos.map((r) => ({
        name: r.name,
        owner: r.owner.login,
        default_branch: r.default_branch,
        }))
    )
}