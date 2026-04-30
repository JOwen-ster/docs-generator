import { auth } from "@/auth"
  import { fetchTree } from "@/app/lib/github/tree-fetch"

  export async function GET(request: Request) {
    const session = await auth()

    if (!session?.access_token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const owner = searchParams.get("owner")
    const repo = searchParams.get("repo")
    const ref = searchParams.get("ref")

    if (!owner || !repo || !ref) {
      return Response.json({ error: "Missing owner, repo, or ref" }, { status: 400 })
    }

    // fetchTree already filters out binary files, oversized files, and non-blob nodes
    const nodes = await fetchTree(owner, repo, ref, session.access_token)
    return Response.json(nodes)
  }