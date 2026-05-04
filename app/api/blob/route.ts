// Fetches the raw content of a single file from GitHub.
// The client passes ?url= which is the GitHub blob API URL stored on each TreeNode.
import { auth } from "@/auth"
import { githubFetch } from "@/app/lib/github/url-fetch"

interface BlobResponse {
    content: string
    encoding: "base64" | "utf-8"
}

export async function GET(request: Request) {
    const session = await auth()

    if (!session?.access_token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
        return Response.json({ error: "Missing url param" }, { status: 400 })
    }

    try {
        const blob = await githubFetch<BlobResponse>(url, session.access_token)
        // GitHub blob API always returns base64; decode before sending to the client
        const content =
            blob.encoding === "base64"
                ? Buffer.from(blob.content.replace(/\n/g, ""), "base64").toString("utf-8")
                : blob.content

        return Response.json({ content })
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return Response.json({ error: message }, { status: 502 })
    }
}
