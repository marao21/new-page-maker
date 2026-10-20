import { describe, it, expect, vi, afterEach } from "vitest";
import { createGitHubProject, executeGitHubEdit, validateProjectFiles } from "@/lib/lovable-rp-engine";
import { loadRepositoryPreview } from "@/lib/github-preview";

const files = [
  { path: "package.json", content: JSON.stringify({ scripts: { dev: "vite", build: "vite build" }, dependencies: { react: "19" }, devDependencies: { vite: "7" } }) },
  { path: "index.html", content: '<div id="root"></div><script type="module" src="/src/main.tsx"></script>' },
  { path: "src/main.tsx", content: "import './App';" },
  { path: "src/App.tsx", content: "export default function App() { return <h1>Projeto real</h1> }" },
  { path: "src/index.css", content: "body { margin: 0 }" },
];
const json = (data: unknown) => new Response(JSON.stringify(data), { status: 200 });
afterEach(() => vi.unstubAllGlobals());

describe("GitHub create and edit modes", () => {
  it("rejects incomplete or duplicate project files before creating a repository", () => {
    expect(() => validateProjectFiles(files.slice(0, 2))).toThrow("src/main.tsx");
    expect(() => validateProjectFiles([...files, files[0]])).toThrow("duplicado");
    expect(() => validateProjectFiles([...files, { path: ".env", content: "SECRET=value" }])).toThrow();
  });
  it("creates a new private repository and uploads every scaffold file, then verifies the commit", async () => {
    const calls: Array<{url: string; body: any; method: string}> = [];
    vi.stubGlobal("fetch", vi.fn(async (input: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      calls.push({ url: input, body, method: init?.method || "GET" });
      if (input.includes("openrouter")) return json({ choices: [{ message: { content: JSON.stringify({ files, summary: "Criado" }) } }] });
      if (input.endsWith("/user/repos")) return json({ full_name: "owner/novo", default_branch: "main", html_url: "https://github.com/owner/novo" });
      if (input.includes("/branches/")) return json({ commit: { sha: calls.some(c => c.method === "PATCH") ? "created" : "initial" } });
      if (input.endsWith("/git/blobs")) return json({ sha: "blob" });
      if (input.endsWith("/git/trees")) return json({ sha: "tree" });
      if (input.endsWith("/git/commits")) return json({ sha: "created" });
      return json({});
    }));
    const result = await createGitHubProject({ githubToken: "test", aiProvider: "openrouter", openrouterApiKey: "test", aiModel: "test", projectName: "Novo", request: "Crie um projeto" });
    expect(result.repository).toBe("owner/novo");
    expect(result.files).toEqual(files.map(f => f.path));
    expect(calls.find(c => c.url.endsWith("/user/repos"))?.body).toMatchObject({ private: true, auto_init: true, name: "novo" });
    expect(calls.filter(c => c.url.endsWith("/git/blobs"))).toHaveLength(5);
    expect(calls.find(c => c.url.endsWith("/git/commits"))?.body.parents).toEqual(["initial"]);
    expect(calls.find(c => c.method === "PATCH")?.body).toEqual({ sha: "created", force: false });
  });
  it("edits the selected repository without creating another, preserving the base tree", async () => {
    let aiCalls = 0;
    let patched = false;
    const calls: Array<{url: string; body: any}> = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : null; calls.push({url, body});
      if (url.includes("openrouter")) return json({ choices: [{ message: { content: JSON.stringify(++aiCalls === 1 ? { paths: ["src/App.tsx"] } : { changes: [{ path: "src/App.tsx", content: "export default function App(){return <h1>Atualizado</h1>}" }] }) } }] });
      if (url.endsWith("/user")) return json({ login: "owner" });
      if (url.includes("/branches/")) return json({ commit: { sha: patched ? "updated" : "head" } });
      if (url.includes("?recursive")) return json({ tree: [{ path: "src/App.tsx", type: "blob", sha: "blob", size: 100 }] });
      if (url.includes("/contents/")) return json({ encoding: "base64", content: btoa("export default function App(){return <h1>Antes</h1>}") });
      if (url.endsWith("/git/commits/head")) return json({ tree: { sha: "original-tree" } });
      if (url.includes("/git/ref/")) return json({ object: { sha: "head" } });
      if (init?.method === "PATCH") { patched = true; return json({}); }
      return json({ sha: url.endsWith("/git/commits") ? "updated" : "generated" });
    }));
    const result = await executeGitHubEdit({ githubToken: "test", aiProvider: "openrouter", openrouterApiKey: "test", repository: "owner/escolhido", branch: "main", request: "Atualize a página" });
    expect(result.repository).toBe("owner/escolhido");
    expect(calls.some(c => c.url.endsWith("/user/repos"))).toBe(false);
    expect(calls.find(c => c.url.endsWith("/git/trees"))?.body.base_tree).toBe("original-tree");
    expect(patched).toBe(true);
  });
  it("loads actual source at a single commit without requesting any AI preview", async () => {
    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      urls.push(url);
      if (url.includes("/branches/")) return json({ commit: { sha: "real-commit" } });
      if (url.includes("/git/trees/")) return json({ tree: [{type: "blob", path: "index.html", sha: "html"}, {type: "blob", path: ".env", sha: "secret"}] });
      return json({ encoding: "base64", content: btoa("<html><body>Arquivo real</body></html>") });
    }));
    const preview = await loadRepositoryPreview("test", "owner/site", "main");
    expect(preview.html).toContain("Arquivo real");
    expect(preview.revision).toBe("real-commit");
    expect(urls.every(url => url.startsWith("https://api.github.com/"))).toBe(true);
    expect(urls.some(url => url.endsWith("/secret"))).toBe(false);
  });
});
describe("GitHub permission errors and preview privacy", () => {
  it("explains GitHub App permissions instead of the repo scope for integration tokens", async () => {
    const { githubPermissionMessage } = await import("@/lib/lovable-rp-engine");
    const msg = githubPermissionMessage("ghu_abc", "Resource not accessible by integration");
    expect(msg).toContain("Contents: Read and write");
    expect(msg).toContain("Administration: Read and write");
    expect(msg).toContain("All repositories");
  });
  it("skips a file with a credential instead of blocking the whole preview", async () => {
    const enc = (t: string) => ({ encoding: "base64", content: btoa(t) });
    vi.stubGlobal("fetch", vi.fn(async (input: string) => {
      if (input.includes("/branches/")) return json({ commit: { sha: "abc" } });
      if (input.includes("/git/trees/")) return json({ truncated: false, tree: [
        { type: "blob", path: "index.html", sha: "h", size: 10 },
        { type: "blob", path: "config.json", sha: "c", size: 10 },
        { type: "blob", path: ".claude/settings.local.json", sha: "x", size: 10 },
      ] });
      if (input.endsWith("/git/blobs/h")) return json(enc("<h1>Oi</h1>"));
      if (input.endsWith("/git/blobs/c")) return json(enc('{"k":"ghp_secretvalue123"}'));
      throw new Error("unexpected " + input);
    }));
    const preview = await loadRepositoryPreview("test", "owner/site", "main");
    expect(preview.kind).toBe("static");
    expect(preview.skipped).toEqual(["config.json"]);
    expect(preview.files["/.claude/settings.local.json"]).toBeUndefined();
  });
});
