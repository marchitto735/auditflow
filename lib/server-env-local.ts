import "server-only";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// #region agent log
function agentLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string
) {
  fetch("http://127.0.0.1:7559/ingest/7444ee45-a2ad-4c62-b96b-1da1dcfaad47", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "bf37aa",
    },
    body: JSON.stringify({
      sessionId: "bf37aa",
      location,
      message,
      data,
      timestamp: Date.now(),
      hypothesisId,
      runId: "post-fix",
    }),
  }).catch(() => {});
}
// #endregion

/**
 * Turbopack can inline `process.env.*` in API routes so values stay empty at runtime.
 * Walking from `import.meta.url` first matched `.next/.env.local` (Next’s trimmed copy)
 * before the real project `.env.local` — so prefer `cwd` first and skip paths under `.next/`.
 */
let cachedLocal: Map<string, string> | undefined;

function stripBom(s: string): string {
  return s.replace(/^\uFEFF/, "").replace(/\uFEFF/g, "");
}

function parseDotenvContent(content: string): Map<string, string> {
  const map = new Map<string, string>();
  const text = stripBom(content);
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = stripBom(line.slice(0, eq).trim());
    if (!key) continue;
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    map.set(key, val);
  }
  return map;
}

const ENV_FILES = [".env.local", ".env.development.local", ".env"] as const;

/** Next may place a stripped `.env.local` under `.next/` — never use it for app secrets. */
function isShadowEnvFile(absPath: string): boolean {
  const n = resolve(absPath).replace(/\\/g, "/");
  return n.includes("/.next/") || n.includes("/node_modules/");
}

/** Every candidate env file on disk (cwd chain + chunk chain), deduped; skip paths under `.next/`. */
function collectAllEnvFilePaths(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (p: string) => {
    if (!existsSync(p)) return;
    const r = resolve(p);
    if (seen.has(r)) return;
    seen.add(r);
    out.push(r);
  };

  let d = resolve(process.cwd());
  for (let i = 0; i < 24; i++) {
    for (const name of ENV_FILES) push(join(d, name));
    const parent = dirname(d);
    if (parent === d) break;
    d = parent;
  }

  try {
    let md = resolve(dirname(fileURLToPath(import.meta.url)));
    for (let i = 0; i < 32; i++) {
      for (const name of ENV_FILES) {
        const p = join(md, name);
        if (!isShadowEnvFile(p)) push(p);
      }
      const parent = dirname(md);
      if (parent === md) break;
      md = parent;
    }
  } catch {
    /* import.meta.url unavailable */
  }

  return out;
}

/**
 * Merge all candidate files: smaller files first, larger last so richer files override
 * (e.g. root `.env.local` may be a 3-key stub; another file may hold OPENAI_API_KEY).
 */
function mergeDotenvFromAllCandidates(): Map<string, string> {
  const paths = collectAllEnvFilePaths();
  const parsed: { len: number; map: Map<string, string> }[] = [];
  for (const p of paths) {
    try {
      const c = readFileSync(p, "utf8");
      parsed.push({ len: c.length, map: parseDotenvContent(c) });
    } catch {
      /* ignore */
    }
  }
  parsed.sort((a, b) => a.len - b.len);
  const merged = new Map<string, string>();
  for (const { map } of parsed) {
    for (const [k, v] of map) {
      if (!v) continue;
      merged.set(k, v);
    }
  }
  return merged;
}

function loadDotenvFromDisk(): Map<string, string> {
  // #region agent log
  let moduleDirForLog = "";
  try {
    moduleDirForLog = dirname(fileURLToPath(import.meta.url));
  } catch {
    moduleDirForLog = "(import.meta.url error)";
  }
  // #endregion
  try {
    const paths = collectAllEnvFilePaths();
    if (paths.length === 0) {
      // #region agent log
      agentLog(
        "server-env-local.ts:loadDotenvFromDisk",
        "no env file paths",
        {
          cwd: process.cwd(),
          moduleDirTail: moduleDirForLog.slice(-80),
          nodeEnv: process.env.NODE_ENV,
        },
        "H1-H5"
      );
      // #endregion
      return new Map();
    }
    const map = mergeDotenvFromAllCandidates();
    const rawOpenai = map.get("OPENAI_API_KEY");
    const lens = paths.map((p) => {
      try {
        return readFileSync(p, "utf8").length;
      } catch {
        return 0;
      }
    });
    // #region agent log
    agentLog(
      "server-env-local.ts:loadDotenvFromDisk",
      "merged env files",
      {
        candidateFileCount: paths.length,
        maxSingleFileLen: lens.length ? Math.max(...lens) : 0,
        mergedKeyCount: map.size,
        hasOpenaiKey: map.has("OPENAI_API_KEY"),
        openaiValueLen: rawOpenai?.length ?? 0,
        cwd: process.cwd(),
        nodeEnv: process.env.NODE_ENV,
      },
      "H1-H2-H4-H5"
    );
    // #endregion
    return map;
  } catch (e) {
    // #region agent log
    agentLog(
      "server-env-local.ts:loadDotenvFromDisk",
      "read/parse threw",
      {
        err: e instanceof Error ? e.message : String(e),
        cwd: process.cwd(),
        nodeEnv: process.env.NODE_ENV,
      },
      "H4"
    );
    // #endregion
    return new Map();
  }
}

function getDotenvLocalMap(): Map<string, string> {
  if (cachedLocal !== undefined) return cachedLocal;
  cachedLocal = loadDotenvFromDisk();
  return cachedLocal;
}

export function clearServerEnvLocalCache(): void {
  cachedLocal = undefined;
}

export function normalizeEnvSegment(raw: string | undefined): string {
  if (raw === undefined) return "";
  return raw
    .trim()
    .replace(/^["']/, "")
    .replace(/["']$/, "")
    .trim();
}

/** Dev-only: why `.env.local` might not load (no secret values). */
export function debugEnvFileStatus(): {
  resolvedPath: string | null;
  cwd: string;
  moduleDir: string | null;
  parsedKeyCount: number;
  hasOpenaiKey: boolean;
  candidateFileCount: number;
  /** Largest on-disk env candidate size (bytes); compare to editor unsaved buffer. */
  maxEnvFileBytes: number;
  /** Keys found after merge (names only; never values). */
  parsedKeyNames: string[];
} {
  const paths = collectAllEnvFilePaths();
  const resolvedPath = paths[0] ?? null;
  let moduleDir: string | null = null;
  try {
    moduleDir = dirname(fileURLToPath(import.meta.url));
  } catch {
    moduleDir = null;
  }
  const merged = mergeDotenvFromAllCandidates();
  let maxEnvFileBytes = 0;
  for (const p of paths) {
    try {
      maxEnvFileBytes = Math.max(maxEnvFileBytes, statSync(p).size);
    } catch {
      /* ignore */
    }
  }
  return {
    resolvedPath,
    cwd: process.cwd(),
    moduleDir,
    parsedKeyCount: merged.size,
    hasOpenaiKey: merged.has("OPENAI_API_KEY"),
    candidateFileCount: paths.length,
    maxEnvFileBytes,
    parsedKeyNames: [...merged.keys()].sort(),
  };
}

/**
 * In development: read disk first (fixes Turbopack empty `process.env` for this route).
 * Otherwise: `process.env` then cached disk parse.
 */
export function readServerEnv(name: string): string {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    const fromFile = normalizeEnvSegment(loadDotenvFromDisk().get(name));
    if (fromFile) return fromFile;
  }

  const fromProcess = normalizeEnvSegment(process.env[name]);
  if (fromProcess) return fromProcess;

  if (!isDev) {
    return normalizeEnvSegment(getDotenvLocalMap().get(name));
  }

  // #region agent log
  if (name === "OPENAI_API_KEY" || name === "LLM_API_KEY") {
    agentLog(
      "server-env-local.ts:readServerEnv",
      "key still empty after dev+process",
      {
        name,
        isDev,
        nodeEnv: process.env.NODE_ENV,
        processKeyPresent:
          typeof process.env[name] === "string" && process.env[name]!.length > 0,
      },
      "H2-H3"
    );
  }
  // #endregion

  return "";
}
