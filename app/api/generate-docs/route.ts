// Accepts a file path + content, calls Gemini, and returns a structured rundown
// ({ summary: string, technical: string[] }) for display in the FileRundown component.
import { GoogleGenAI } from "@google/genai";

// Initialized once per cold start — reused across requests
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.files || !Array.isArray(body.files)) {
    return Response.json({ error: "Missing files array" }, { status: 400 });
  }

  const { files, fileTree, projectContext } = body as {
    files: { path: string; content: string }[];
    fileTree?: string[];
    projectContext?: { path: string; content: string }[];
  };

  let prompt = `You are a code documentation assistant. Given the source file(s), produce a concise rundown for a developer who is about to work on them.\n\n`;

  if (fileTree && fileTree.length > 0) {
    prompt += `=== Project File Tree ===\n${fileTree.join("\n")}\n\n`;
  }

  if (projectContext && projectContext.length > 0) {
    prompt += `=== Full Project Context ===\n`;
    for (const file of projectContext) {
      prompt += `--- ${file.path} ---\n${file.content}\n\n`;
    }
  }

  prompt += `=== Selected File(s) to Summarize ===\n`;
  for (const file of files) {
    prompt += `--- ${file.path} ---\n${file.content}\n\n`;
  }

  prompt += `Respond with valid JSON only, no markdown fences:
{
  "summary": "2-3 sentence plain-English description of what these files are and what they do together.",
  "technical": ["bullet 1", "bullet 2", "up to 6 bullets total"]
}`;

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      contents: prompt,
      // responseMimeType forces Gemini to return valid JSON with no markdown wrapping
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "";
    const parsed = JSON.parse(text) as { summary: string; technical: string[] };

    return Response.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 502 });
  }
}
