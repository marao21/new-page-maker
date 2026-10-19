import { useEffect, useState } from "react";
import { Code2, Download, Monitor, Sparkles, Trash2 } from "lucide-react";

export function LocalPreviewBuilder() {
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");

  useEffect(() => {
    setHtml(sessionStorage.getItem("lovable-rp-web-local-preview-html") || "");
    setOpenaiKey(sessionStorage.getItem("lovable-rp-web-openai-key") || "");
    setGeminiKey(sessionStorage.getItem("lovable-rp-web-gemini-key") || "");
  }, []);

  async function generate() {
    if (!prompt.trim()) { alert("Descreva o projeto que deseja pré-visualizar."); return; }
    const key = provider === "openai" ? openaiKey : geminiKey;
    if (!key) { alert("Conecte primeiro a chave " + (provider === "openai" ? "OpenAI" : "Gemini") + " na aba Conexões."); return; }
    setBusy(true);
    try {
      const instruction = html ? ("Edite o HTML atual para cumprir a solicitação, preservando o que não foi pedido para mudar. Responda APENAS com o HTML completo atualizado, sem markdown. Não use bibliotecas externas, frameworks, chamadas de rede, credenciais ou backend.\nHTML ATUAL:\n" + html + "\nALTERAÇÃO SOLICITADA:\n" + prompt) : ("Crie um protótipo de site completo em um único arquivo HTML autônomo para pré-visualização. Responda apenas com HTML completo, sem markdown. Inclua CSS em style e JavaScript inline opcional. Não use bibliotecas externas, frameworks, build tools, chamadas de rede, credenciais ou backend. Faça design responsivo e interativo usando HTML/CSS/JS puro. Pedido: " + prompt);
      let result = "";
      if (provider === "openai") {
        const response = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
          body: JSON.stringify({ model: "gpt-4.1-mini", input: instruction, temperature: 0.4 }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error?.message || "Falha ao gerar pela OpenAI.");
        result = Array.isArray(data?.output) ? data.output.flatMap((item: any) => Array.isArray(item?.content) ? item.content : []).filter((part: any) => part?.type === "output_text").map((part: any) => part.text || "").join("") : "";
      } else {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(key), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: instruction }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 12000 } }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error?.message || "Falha ao gerar pelo Gemini.");
        result = data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || "").join("") || "";
      }
      result = result.trim();
      if (result.startsWith("```")) result = result.replace(/^```(?:html)?\s*/i, "").replace(/\s*```\s*$/, "");
      if (!result.toLowerCase().includes("<html") && !result.toLowerCase().includes("<!doctype")) throw new Error("A IA não retornou HTML válido. Tente novamente com um pedido mais específico.");
      setHtml(result);
      sessionStorage.setItem("lovable-rp-web-local-preview-html", result);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Não foi possível gerar a prévia.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-xl bg-pink-50 p-3 text-pink-600"><Code2 className="h-5 w-5" /></div>
        <div><h3 className="font-bold">Editor visual com prévia ao vivo</h3><p className="mt-1 text-sm text-slate-500">Crie a página, peça alterações por texto e acompanhe o resultado antes de hospedar.</p></div>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <button onClick={() => setProvider("openai")} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${provider === "openai" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200"}`}>OpenAI API</button>
        <button onClick={() => setProvider("gemini")} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${provider === "gemini" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200"}`}>Gemini API</button>
      </div>
      <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} placeholder="Descreva o projeto ou a alteração que deseja fazer." className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100" />
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={generate} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-pink-700 disabled:opacity-60"><Sparkles className="h-4 w-4" />{busy ? "Gerando ou editando..." : (html ? "Aplicar alteração e atualizar prévia" : "Criar projeto e ver prévia")}</button>
        {html && <button onClick={() => { const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "lovable-rp-preview.html"; a.click(); URL.revokeObjectURL(url); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"><Download className="h-4 w-4" />Baixar HTML</button>}
        {html && <button onClick={() => { setHtml(""); sessionStorage.removeItem("lovable-rp-web-local-preview-html"); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"><Trash2 className="h-4 w-4" />Limpar</button>}
      </div>
      <p className="mt-3 text-[11px] leading-5 text-slate-500">Protótipo HTML isolado — não é ainda um projeto React/Vite completo. A chave da IA fica nesta sessão do navegador.</p>
      {html ? <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2"><Monitor className="h-4 w-4 text-emerald-700" /><span className="text-xs font-semibold text-slate-600">Prévia local • não publicada</span></div>
        <iframe title="Prévia local do protótipo" srcDoc={html} sandbox="allow-scripts allow-forms allow-popups allow-downloads" referrerPolicy="no-referrer" className="h-[70vh] min-h-[500px] w-full bg-white" />
        <details className="border-t border-slate-200"><summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-slate-600">Ver e editar código HTML</summary><textarea value={html} onChange={(event) => { setHtml(event.target.value); sessionStorage.setItem("lovable-rp-web-local-preview-html", event.target.value); }} rows={16} spellCheck={false} className="w-full border-t border-slate-200 p-3 font-mono text-xs outline-none" /></details>
      </div> : <div className="mt-4 flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center"><Monitor className="mb-3 h-8 w-8 text-slate-400" /><p className="font-semibold">Sua prévia aparecerá aqui</p><p className="mt-1 max-w-lg text-sm text-slate-500">Nenhuma hospedagem é necessária para criar esse protótipo.</p></div>}
    </section>
  );
}
