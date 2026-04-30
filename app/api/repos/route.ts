import { auth } from "@/auth"

interface GithubRepo {
name: string
owner: { login: string }
default_branch: string
}

export async function GET() {
const session = await auth()
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

return Response.json(
    repos.map((r) => ({
    name: r.name,
    owner: r.owner.login,
    default_branch: r.default_branch,
    }))
)
}