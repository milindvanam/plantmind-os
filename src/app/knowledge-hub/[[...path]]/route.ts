import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const HUB_ROOT = path.resolve(process.cwd(), "public", "knowledge-hub-static");

const contentTypes: Readonly<Record<string, string>> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

function resolveHubFile(segments: readonly string[]) {
  if (
    segments.some((segment) => segment === ".." || segment.includes("/") || segment.includes("\\"))
  ) {
    return null;
  }

  const candidate = path.resolve(HUB_ROOT, ...segments);
  return candidate === HUB_ROOT || candidate.startsWith(`${HUB_ROOT}${path.sep}`)
    ? candidate
    : null;
}

async function findHubFile(segments: readonly string[]) {
  const candidate = resolveHubFile(segments);
  if (!candidate) return null;

  try {
    const details = await stat(/* turbopackIgnore: true */ candidate);
    return details.isDirectory() ? path.join(candidate, "index.html") : candidate;
  } catch {
    return null;
  }
}

export async function GET(_request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const { path: requestedPath = [] } = await context.params;
  const filePath = await findHubFile(requestedPath);

  if (!filePath) {
    return new Response("Knowledge Hub resource not found", { status: 404 });
  }

  const body = await readFile(/* turbopackIgnore: true */ filePath);
  const extension = path.extname(filePath).toLowerCase();
  const immutableAsset = requestedPath[0] === "assets";

  return new Response(body, {
    headers: {
      "Cache-Control": immutableAsset
        ? "public, max-age=31536000, immutable"
        : "public, max-age=0, must-revalidate",
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
