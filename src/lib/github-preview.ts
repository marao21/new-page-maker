export type RepositoryPreview = { files: Record<string, string>; kind: "static" | "vite"; html?: string; revision: string };

export function previewKind(files: Record<string, string>): "static" | "vite" {
  const html = files["/index.html"] || "";
  if (!html) throw new Error("Não encontrei index.html na raiz. Este formato de projeto ainda não tem prévia disponível.");
  if (/type=["']module["']/i.test(html)) {
    const pkg = JSON.parse(files["/package.json"] || "{}");
    if (!pkg.scripts?.dev || !pkg.devDependencies?.vite && !pkg.dependencies?.vite) throw new Error("Este projeto precisa de um ambiente próprio de execução; a prévia atual aceita sites HTML e projetos Vite.");
    return "vite";
  }
  return "static";
}

export async function loadRepositoryPreview(token: string, repository: string, branch: string, signal?: AbortSignal): Promise<RepositoryPreview> {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error("Selecione um repositório válido.");
  const read = async (path: string) => {
    const res = await fetch(`https://api.github.com/repos/${repository}${path}`, { signal, headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` } });
    if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(`GitHub ${res.status}: ${body.message || "Não foi possível carregar os arquivos."}`); }
    return res.json();
  };
  const head = await read(`/branches/${encodeURIComponent(branch)}`);
  const revision = head.commit.sha;
  const tree = await read(`/git/trees/${revision}?recursive=1`);
  if (tree.truncated) throw new Error("O GitHub retornou uma lista incompleta. Não é possível executar uma prévia fiel deste repositório.");
  const entries = tree.tree.filter((e: {type: string; path: string}) => e.type === "blob" && !/(^|\/)(node_modules|dist|build|coverage|\.git|\.env[^/]*|\.npmrc|\.yarnrc|[^/]*lock[^/]*|secrets?[^/]*)($|\/)/i.test(e.path));
  if (entries.length > 200 || entries.reduce((n: number, e: {size?: number}) => n + (e.size || 0), 0) > 3_000_000) throw new Error("Este repositório excede o tamanho suportado pela prévia no navegador.");
  const files: Record<string, string> = {};
  // Small batches keep GitHub reads bounded; every read uses the same immutable commit.
  for (let i = 0; i < entries.length; i += 5) {
    await Promise.all(entries.slice(i, i + 5).map(async (entry: {path: string; sha: string}) => {
      const blob = await read(`/git/blobs/${entry.sha}`);
      if (blob.encoding !== "base64") throw new Error(`Formato não suportado: ${entry.path}`);
      const raw = atob(blob.content.replace(/\s/g, ""));
      const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
      if (/\.(png|jpe?g|gif|webp|ico|woff2?|svg)$/i.test(entry.path)) {
        const ext = entry.path.split(".").pop()?.toLowerCase();
        const mime = ext === "svg" ? "image/svg+xml" : ext === "jpg" ? "image/jpeg" : /woff/.test(ext || "") ? `font/${ext}` : `image/${ext}`;
        files["/" + entry.path] = `data:${mime};base64,${blob.content.replace(/\s/g, "")}`;
      } else {
        const text = new TextDecoder().decode(bytes);
        if (/-----BEGIN .*PRIVATE KEY-----|ghp_[\w]+|github_pat_[\w]+|sb_secret_[\w]+|AIza[\w-]{20,}|sk-[\w-]{20,}/.test(text)) throw new Error(`Possível credencial em ${entry.path}. Remova-a antes de executar a prévia.`);
        files["/" + entry.path] = text;
      }
    }));
  }
  const kind = previewKind(files);
  if (kind === "vite") {
    if (Object.values(files).some(content => content.startsWith("data:"))) throw new Error("A prévia Vite ainda não suporta arquivos binários locais. Use uma URL de prévia desse projeto.");
    return { files, kind, revision };
  }
  let html = files["/index.html"];
  html = html.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi, (tag, path) => {
    const css = files["/" + path.replace(/^\.?\//, "")];
    return css === undefined ? tag : `<style>${css.replace(/<\/style/gi, "<\\/style")}</style>`;
  });
  html = html.replace(/<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi, (tag, path) => {
    const js = files["/" + path.replace(/^\.?\//, "")];
    return js === undefined ? tag : `<script>${js.replace(/<\/script/gi, "<\\/script")}</script>`;
  });
  for (const [path, data] of Object.entries(files)) if (data.startsWith("data:")) html = html.split(path.slice(1)).join(data);
  return { files, kind, html, revision };
}