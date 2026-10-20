import { lazy, Suspense, useEffect, useState } from "react";
import { Monitor, Smartphone, RotateCw, Github, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadRepositoryPreview, type RepositoryPreview } from "@/lib/github-preview";

const RepositoryRuntime = lazy(() => import("./repository-runtime"));

export function RepositoryPreviewPane({ githubToken, repository, branch, refreshKey = 0 }: { githubToken: string; repository: string; branch: string; refreshKey?: number }) {
  const [preview, setPreview] = useState<RepositoryPreview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [runtimeAllowed, setRuntimeAllowed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setPreview(null); setError(""); setRuntimeAllowed(false);
    if (!githubToken || !repository) { setLoading(false); return () => controller.abort(); }
    setLoading(true);
    loadRepositoryPreview(githubToken, repository, branch, controller.signal).then(result => { if (!controller.signal.aborted) setPreview(result); }).catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Falha ao carregar a prévia."); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [githubToken, repository, branch, refreshKey, reload]);
  return <section aria-label="Prévia do repositório" className="rp-preview flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
    <header className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2">
      <div className="flex min-w-0 items-center gap-2 text-sm font-semibold"><Github className="h-4 w-4 shrink-0 text-primary"/><span className="truncate">{repository || "Prévia do projeto"}</span></div>
      <div className="flex gap-1"><Button variant="ghost" size="icon" title="Prévia desktop" aria-label="Prévia desktop" aria-pressed={!mobile} onClick={() => setMobile(false)}><Monitor/></Button><Button variant="ghost" size="icon" title="Prévia celular" aria-label="Prévia celular" aria-pressed={mobile} onClick={() => setMobile(true)}><Smartphone/></Button><Button variant="ghost" size="icon" title="Atualizar prévia do GitHub" aria-label="Atualizar prévia do GitHub" disabled={loading || !githubToken || !repository} onClick={() => setReload(n => n + 1)}><RotateCw/></Button></div>
    </header>
    <div className="flex min-h-0 flex-1 justify-center bg-background p-2">
      <div className={mobile ? "rp-preview-mobile w-full overflow-hidden bg-card" : "h-full w-full overflow-hidden bg-card"}>
        {loading ? <div role="status" className="flex h-full min-h-96 flex-col items-center justify-center gap-3 text-muted"><LoaderCircle className="h-6 w-6 animate-spin"/>Carregando arquivos do GitHub…</div> : error ? <div role="alert" className="flex h-full min-h-96 items-center justify-center p-8 text-center text-sm text-muted">{error}</div> : !preview ? <div className="flex h-full min-h-96 flex-col items-center justify-center gap-3 text-muted"><Monitor className="h-8 w-8"/><p className="text-sm">{githubToken ? "Selecione um repositório ou crie um projeto." : "Conecte o GitHub e selecione um repositório."}</p></div> : preview.kind === "static" ? <iframe key={preview.revision} title="Prévia real do GitHub" srcDoc={preview.html} sandbox="allow-scripts allow-forms" referrerPolicy="no-referrer" className="h-full min-h-[650px] w-full border-0 bg-card"/> : <Suspense fallback={<p className="p-8 text-sm text-muted">Iniciando ambiente de execução…</p>}><RepositoryRuntime key={preview.revision} files={preview.files}/></Suspense>}
      </div>
    </div>
    <footer className="border-t border-border px-4 py-2 text-xs text-muted">{preview ? `${branch} · ${preview.revision.slice(0, 7)} · ${Object.keys(preview.files).length} arquivos` : branch || "GitHub"}</footer>
  </section>;
}