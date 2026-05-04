// Accepts a file path + content, calls Gemini, and returns a structured rundown
// ({ summary: string, technical: string[] }) for display in the FileRundown component.
import { GoogleGenAI } from "@google/genai"

// Initialized once per cold start — reused across requests
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(request: Request) {
    const body = await request.json().catch(() => null)

    if (!body?.path || !body?.content) {
        return Response.json({ error: "Missing path or content" }, { status: 400 })
    }

    const { path, content } = body as { path: string; content: string }

    const prompt = `You are a code documentation assistant. Given a source file, produce a concise rundown for a developer who is about to work on it.

                    File path: ${path}

                    File content:
                    ${content}

                    Respond with valid JSON only, no markdown fences:
                    {
                    "summary": "2-3 sentence plain-English description of what this file is and what it does.",
                    "technical": ["bullet 1", "bullet 2", "up to 6 bullets total"]
                    }`

    try {
        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
            contents: prompt,
            // responseMimeType forces Gemini to return valid JSON with no markdown wrapping
            config: {
                responseMimeType: "application/json",
            },
        })

        const text = response.text ?? ""
        const parsed = JSON.parse(text) as { summary: string; technical: string[] }

        return Response.json(parsed)
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return Response.json({ error: message }, { status: 502 })
    }
}
