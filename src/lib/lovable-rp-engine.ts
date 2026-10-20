export type GitHubRepoOption = {
  full_name: string;
  name: string;
  default_branch: string;
  private: boolean;
  html_url: string;
};

type TreeEntry = { path: string; type: string; size?: number; sha: string };
type Change = { path: string; content: string };

const GITHUB_API = "https://api.github.com";
const GEMINI_MODEL = "gemini-3.8-flash";
const OPENAI_MODEL = "openai/gpt-4.1-mini";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export type AIProvider = "gemini" | "openai" | "openrouter";
export type AIModelOption = { id: string; name: string };
const MAX_CONTEXT_FILES = 8;
const MAX_FILE_CHARS = 32000;
const MAX_PATCH_FILES = 10;

function safeRepoName(value: string) {
  const repo = value.trim();
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new Error("Informe o repositório no formato dono/nome.");
  }
  return repo;
}

async function githubRequest<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });
  const raw = await response.text();
  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) {
    const detail = String(data?.message || `GitHub HTTP ${response.status}`);
    if (response.status === 401) throw new Error("A autorização do GitHub expirou ou foi recusada. Vá em Conexões, desconecte e conecte o GitHub novamente.");
    if (response.status === 403) {
      const remaining = response.headers.get("x-ratelimit-remaining");
      const scopes = response.headers.get("x-oauth-scopes");
      if (remaining === "0") throw new Error("O limite de requisições da API do GitHub foi atingido. Aguarde a renovação do limite e tente novamente.");
      if (/rate limit/i.test(detail)) throw new Error("O GitHub limitou temporariamente as requisições. Aguarde alguns minutos e tente novamente. Detalhe: " + detail);
      if (/resource not accessible by integration|insufficient permissions/i.test(detail)) throw new Error("A autorização atual do GitHub não tem permissão para esta operação. Reconecte o GitHub e autorize o escopo repo; se for uma organização, o administrador pode precisar aprovar o aplicativo. Detalhe: " + detail);
      if (/name already exists|already exists/i.test(detail)) throw new Error("Já existe um repositório com esse nome na sua conta. Escolha outro nome. Detalhe: " + detail);
      throw new Error("O GitHub recusou a operação (HTTP 403). " + detail + (scopes ? " Escopos autorizados: " + scopes + "." : " Verifique se o OAuth App tem o escopo repo e se há políticas da organização bloqueando a criação."));
    }
    if (response.status === 404) throw new Error("Repositório, branch ou arquivo não encontrado. Confira o acesso e o nome informado. Detalhe: " + detail);
    if (response.status === 422) {
      if (/already exists|name already exists/i.test(detail)) throw new Error("Já existe um repositório com esse nome. Troque o nome e tente novamente.");
      throw new Error("O GitHub não aceitou os dados enviados (HTTP 422). " + detail);
    }
    throw new Error(detail);
  }
  return data as T;
}

export async function validateGitHubToken(token: string) {
  if (!token.trim()) throw new Error("Informe um token do GitHub.");
  const user = await githubRequest<{ login: string; name?: string }> (token.trim(), "/user");
  return { login: user.login, name: user.name || user.login };
}

export async function validateGeminiApiKey(apiKey: string) {
  if (!apiKey.trim()) throw new Error("Informe uma chave da API Gemini.");
  const models = await listGeminiModels(apiKey);
  const textModels = models.filter((model) => !/(image|tts|audio|live|embedding|vision|veo|imagen)/i.test(model.id));
  const preferred = textModels.find((model) => /gemini-3\.8-flash/i.test(model.id)) || textModels.find((model) => /flash/i.test(model.id)) || textModels[0] || models[0];
  if (!preferred) throw new Error("A chave foi aceita, mas não há modelos Gemini compatíveis com geração de texto.");
  await callAI("gemini", apiKey, 'Responda somente JSON: {"ok":true,"message":"conectado"}.', preferred.id);
  return true;
}

export async function listOpenRouterModels(apiKey: string): Promise<AIModelOption[]> {
  if (!apiKey.trim()) throw new Error("Informe a chave OpenRouter para carregar os modelos.");
  const response = await fetch(OPENROUTER_BASE_URL + "/models?output_modalities=text", {
    headers: { Authorization: "Bearer " + apiKey.trim() },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || "Falha ao listar modelos OpenRouter (HTTP " + response.status + ").");
  return (data?.data || []).map((m: any) => ({ id: String(m.id), name: String(m.name || m.id) })).filter((m: AIModelOption) => m.id);
}

export async function listOpenAIModels(apiKey: string): Promise<AIModelOption[]> {
  if (!apiKey.trim()) throw new Error("Informe a chave OpenAI para carregar os modelos.");
  const response = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: "Bearer " + apiKey.trim() } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || "Falha ao listar modelos OpenAI (HTTP " + response.status + ").");
  return (data?.data || []).filter((m: any) => /^(gpt-|o[1349]|chatgpt-)/i.test(String(m.id))).map((m: any) => ({ id: String(m.id), name: String(m.id) })).sort((a: AIModelOption, b: AIModelOption) => a.name.localeCompare(b.name));
}

export async function listGeminiModels(apiKey: string): Promise<AIModelOption[]> {
  if (!apiKey.trim()) throw new Error("Informe a chave Gemini para carregar os modelos.");
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", { headers: { "x-goog-api-key": apiKey.trim() } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || "Falha ao listar modelos Gemini (HTTP " + response.status + ").");
  return (data?.models || []).filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.some((method: string) => /generateContent/i.test(method))).map((m: any) => ({ id: String(m.name || "").replace(/^models\//, ""), name: String(m.displayName || m.name || "") })).filter((m: AIModelOption) => m.id);
}

export async function validateOpenAIApiKey(apiKey: string) {
  if (!apiKey.trim()) throw new Error("Informe uma chave da API OpenAI.");
  await callAI("openai", apiKey, 'Responda somente JSON: {"ok":true,"message":"conectado"}.');
  return true;
}

export async function listGitHubRepositories(token: string): Promise<GitHubRepoOption[]> {
  const data = await githubRequest<any[]>(token.trim(), "/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member");
  return data.map((repo) => ({
    full_name: repo.full_name,
    name: repo.name,
    default_branch: repo.default_branch || "main",
    private: !!repo.private,
    html_url: repo.html_url,
  }));
}

function containsLikelySecret(content: string) {
  return /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:ghp_|github_pat_|AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{20,}|sb_secret_[A-Za-z0-9_]+)/.test(content)
    || /(?:api[_-]?key|access[_-]?token|client[_-]?secret|service[_-]?role[_-]?key|password)\s*[:=]\s*["'][^"']{12,}["']/i.test(content);
}

function decodeBase64Utf8(value: string) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64Utf8(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

async function callAI(provider: AIProvider, apiKey: string, prompt: string, selectedModel?: string) {
  let response: Response;
  let data: any;
  if (provider === "openai" || provider === "openrouter") {
    const isOpenRouter = provider === "openrouter";
    response = await fetch(isOpenRouter ? `${OPENROUTER_BASE_URL}/chat/completions` : "https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
        ...(isOpenRouter ? { "HTTP-Referer": "https://new-page-maker.vercel.app", "X-OpenRouter-Title": "New Page Maker" } : {}),
      },
      body: JSON.stringify(isOpenRouter ? {
        model: selectedModel || OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.15,
      } : {
        model: selectedModel || "gpt-4.1-mini",
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
        temperature: 0.15,
      }),
    });
    data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || `HTTP ${response.status}`;
      const providerName = provider === "openrouter" ? "OpenRouter" : "OpenAI";
      if (response.status === 401 || response.status === 403) throw new Error(`Chave ${providerName} inválida ou sem permissão: ${message}`);
      if (response.status === 429) throw new Error(`Limite ou saldo da ${providerName} atingido. Confira sua conta e cotas.`);
      throw new Error(`Não foi possível usar ${providerName}: ${message}`);
    }
    const outputText = provider === "openrouter"
      ? data?.choices?.[0]?.message?.content || ""
      : Array.isArray(data?.output)
        ? data.output.flatMap((item: any) => Array.isArray(item?.content) ? item.content : []).filter((part: any) => part?.type === "output_text").map((part: any) => part.text || "").join("")
        : "";
    if (!outputText.trim()) throw new Error("A OpenAI não retornou texto. Tente novamente.");
    try { return JSON.parse(outputText.replace(/^\uFEFF/, "").replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "")); }
    catch { throw new Error("A resposta da OpenAI não veio em JSON válido. Tente novamente."); }
  }

  // Se o modelo selecionado estiver sobrecarregado ou indisponível, tenta outros modelos de texto.
  const geminiFallbacks = [GEMINI_MODEL, "gemini-flash-latest", "gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
  const geminiModels = [...new Set([selectedModel, ...geminiFallbacks].filter((model): model is string => !!model))];
  let lastStatus = 0;
  let lastMessage = "";

  for (const model of geminiModels) {
    response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey.trim() },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.15, responseMimeType: "application/json" },
      }),
    });
    data = await response.json().catch(() => ({}));
    if (response.ok) {
      const text = (data?.candidates?.[0]?.content?.parts || []).map((part: any) => part?.text || "").join("");
      if (!text.trim()) throw new Error("O Gemini (" + model + ") não retornou texto.");
      try { return JSON.parse(text.replace(/^\uFEFF/, "").replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "")); }
      catch { throw new Error("A resposta do Gemini (" + model + ") não veio em JSON válido."); }
    }
    lastStatus = response.status;
    lastMessage = data?.error?.message || "Gemini HTTP " + response.status;
    if (response.status === 404 || response.status === 429 || response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504) continue;
    if (response.status === 401 || response.status === 403) throw new Error("A chave Gemini foi recusada: " + lastMessage);
    throw new Error("Erro da API Gemini (HTTP " + response.status + "): " + lastMessage);
  }
  throw new Error("O Gemini está temporariamente indisponível em todos os modelos tentados (HTTP " + lastStatus + "): " + lastMessage + " Aguarde um pouco ou escolha outro modelo nas configurações.");
}

function isAllowedTextPath(path: string, size = 0) {
  if (!path || path.startsWith("/") || path.split("/").includes("..")) return false;
  if (/(^|\/)(\.env(?:\.|$)|secrets?\.|credentials?\.|id_rsa|\.npmrc|\.pypirc)/i.test(path)) return false;
  if (/(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$/i.test(path)) return false;
  if (path.startsWith(".git/") || path.startsWith("node_modules/")) return false;
  if (path.startsWith(".github/workflows/") || path.startsWith(".github/actions/")) return false;
  if (size > 180000) return false;
  return /\.(tsx?|jsx?|mjs|cjs|vue|svelte|astro|css|scss|html|json|md|mdx|sql|yaml|yml|toml)$/i.test(path);
}

function pathRelevance(path: string, request: string) {
  const terms = request.toLowerCase().match(/[a-zà-ú0-9_-]{3,}/gi) || [];
  const normalizedPath = path.toLowerCase();
  let score = 0;
  for (const term of terms) if (normalizedPath.includes(term)) score += 3;
  if (/routes?\/index|pages?\/index|app\.(tsx?|jsx?)$/.test(normalizedPath)) score += 4;
  if (/styles?\.(css|scss)$|global\.css$|index\.css$/.test(normalizedPath)) score += 3;
  if (/components?\//.test(normalizedPath)) score += 2;
  if (/package\.json$|lock/.test(normalizedPath)) score -= 10;
  return score;
}

function parseJsonResponse<T>(value: unknown, label: string): T {
  if (typeof value === "string") {
    const cleaned = value.replace(/^\uFEFF/, "").replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    try { value = JSON.parse(cleaned); } catch { throw new Error(`A IA retornou ${label} sem JSON válido.`); }
  }
  if (!value || typeof value !== "object") throw new Error(`A IA retornou ${label} em formato inválido.`);
  return value as T;
}


export function validateProjectFiles(value: unknown): Change[] {
  if (!Array.isArray(value) || !value.length || value.length > 20) throw new Error("A IA deve retornar todos os arquivos do projeto, até 20 arquivos.");
  const seen = new Set<string>();
  const files: Change[] = [];
  for (const file of value) {
    if (!file || typeof file.path !== "string" || typeof file.content !== "string" || !file.content.trim() || !isAllowedTextPath(file.path, new TextEncoder().encode(file.content).length) || containsLikelySecret(file.content)) throw new Error("A IA retornou um arquivo inválido ou com credenciais. Nenhum repositório foi criado.");
    if (seen.has(file.path)) throw new Error(`Arquivo duplicado: ${file.path}. Nenhum repositório foi criado.`);
    seen.add(file.path); files.push(file);
  }
  for (const path of ["package.json", "index.html", "src/main.tsx", "src/App.tsx", "src/index.css"]) {
    if (!seen.has(path)) throw new Error(`O projeto está incompleto: falta ${path}. Nenhum repositório foi criado.`);
  }
  const pkg = JSON.parse(files.find(f => f.path === "package.json")?.content || "{}");
  if (!pkg.scripts?.dev || !pkg.scripts?.build || !pkg.dependencies?.react || !pkg.devDependencies?.vite && !pkg.dependencies?.vite) throw new Error("package.json incompleto: faltam comandos ou dependências React/Vite.");
  return files;
}

export async function createGitHubProject(args: {
  githubToken: string;
  aiProvider: AIProvider;
  aiModel: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  openrouterApiKey?: string;
  projectName: string;
  request: string;
  onProgress?: (message: string) => void;
}) {
  const token = args.githubToken.trim();
  const provider = args.aiProvider;
  const apiKey = ((provider === "openai" ? args.openaiApiKey : provider === "openrouter" ? args.openrouterApiKey : args.geminiApiKey) || "").trim();
  if (!token) throw new Error("Conecte o GitHub antes de criar um projeto.");
  if (!apiKey) throw new Error("Conecte a chave do provedor de IA selecionado.");
  const progress = args.onProgress || (() => {});
  const repoName = args.projectName.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
  if (!repoName) throw new Error("Informe um nome válido para o projeto.");
  progress("A IA está planejando o projeto e decidindo se precisa de banco de dados...");
  const plan = parseJsonResponse<{ needsSupabase: boolean; reason: string; description: string; files: Array<{path:string;content:string}>; summary: string }>(
    await callAI(provider, apiKey, [
      "Você é um agente que cria projetos web completos do zero.",
      'Responda apenas JSON válido: {"needsSupabase":boolean,"reason":string,"description":string,"summary":string,"files":[{"path":string,"content":string}]}' ,
      "Decida com critério: páginas estáticas, landing pages e sites institucionais simples normalmente NÃO precisam de Supabase. Login, dados persistentes, painel, marketplace, cadastro, pedidos ou banco de dados normalmente precisam. Não adicione chaves secretas. Gere arquivos completos, no máximo 20 arquivos e 180000 caracteres por arquivo. Gere um projeto Vite + React + TypeScript funcional com package.json, index.html, src/main.tsx, src/App.tsx e src/index.css. Se precisar de Supabase, inclua a dependência e integração por variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY, mas não invente credenciais nem suponha que o projeto Supabase já existe.",
      "NOME DO REPOSITÓRIO: " + repoName,
      "PEDIDO DO USUÁRIO: " + args.request,
    ].join("\n\n"), args.aiModel),
    "o plano do novo projeto"
  );
  const files = validateProjectFiles(plan.files);
  progress("Criando repositório " + repoName + " no GitHub...");
  const repo = await githubRequest<any>(token, "/user/repos", {
    method: "POST",
    body: JSON.stringify({ name: repoName, description: String(plan.description || args.request).slice(0, 300), private: true, auto_init: true }),
  });
  const fullName = String(repo.full_name);
  const branch = String(repo.default_branch || "main");
  try {
  const initial = await githubRequest<any>(token, `/repos/${fullName}/branches/${encodeURIComponent(branch)}`);
  const initialSha = initial.commit.sha;
  progress("Gravando " + files.length + " arquivos iniciais no novo repositório...");
  const blobs = await Promise.all(files.map(async (file) => {
    const blob = await githubRequest<any>(token, "/repos/" + fullName + "/git/blobs", { method: "POST", body: JSON.stringify({ content: file.content, encoding: "utf-8" }) });
    return { path: file.path, mode: "100644", type: "blob", sha: blob.sha };
  }));
  const tree = await githubRequest<any>(token, "/repos/" + fullName + "/git/trees", { method: "POST", body: JSON.stringify({ tree: blobs }) });
  const commit = await githubRequest<any>(token, "/repos/" + fullName + "/git/commits", { method: "POST", body: JSON.stringify({ message: "feat: scaffold new project", tree: tree.sha, parents: [initialSha] }) });
  await githubRequest<any>(token, `/repos/${fullName}/git/refs/heads/${encodeURIComponent(branch)}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
  const verified = await githubRequest<any>(token, `/repos/${fullName}/branches/${encodeURIComponent(branch)}`);
  if (verified.commit?.sha !== commit.sha) throw new Error("O commit não foi confirmado na branch.");
  return { repository: fullName, branch, commitSha: commit.sha, commitUrl: "https://github.com/" + fullName + "/commit/" + commit.sha, repoUrl: String(repo.html_url), summary: String(plan.summary || "Projeto inicial criado."), files: files.map((file) => file.path), needsSupabase: !!plan.needsSupabase, supabaseReason: String(plan.reason || "") };
  } catch (error) {
    throw new Error(`O repositório foi criado em ${repo.html_url}, mas não foi possível confirmar todos os arquivos. Selecione esse repositório para continuar; não crie outro com o mesmo nome. ${error instanceof Error ? error.message : "Falha no GitHub."}`);
  }
}

async function scaffoldEmptyRepository(args: {
  token: string; provider: AIProvider; apiKey: string; model?: string; repository: string; request: string; branch: string; progress: (message: string) => void;
}) {
  args.progress("O repositório está vazio. A IA vai criar a estrutura completa do projeto...");
  const plan = parseJsonResponse<{ files: Array<{ path: string; content: string }>; summary?: string; commitMessage?: string }>(
    await callAI(args.provider, args.apiKey, [
      "Você é um agente de engenharia de software responsável por criar um projeto web COMPLETO do zero dentro de um repositório GitHub existente e vazio.",
      'Responda somente JSON válido: {"summary":"resumo em português","commitMessage":"mensagem de commit","files":[{"path":"caminho/arquivo","content":"conteúdo completo"}]}.',
      "Gere todos os arquivos necessários para que o pedido funcione, não apenas instruções. Por padrão use Vite + React + TypeScript, package.json, index.html, src/main.tsx, src/App.tsx, src/index.css e configuração necessária. Inclua telas, componentes, navegação, validações e arquivos de configuração relevantes ao pedido. Para sistemas com login/dados, prepare integração com Supabase via variáveis de ambiente, sem inventar credenciais. Não inclua .env, tokens, segredos ou arquivos de lock. Gere no máximo 25 arquivos, cada arquivo com até 180000 caracteres.",
      "REPOSITÓRIO: " + args.repository,
      "PEDIDO DO USUÁRIO: " + args.request,
    ].join("\n\n"), args.model),
    "os arquivos do projeto",
  );
  if (!Array.isArray(plan.files) || !plan.files.length) throw new Error("A IA não gerou os arquivos necessários para iniciar o projeto.");
  if (plan.files.length > 25) throw new Error("O projeto retornou mais de 25 arquivos. Divida o pedido em etapas.");
  const files = plan.files.filter((file) => file && typeof file.path === "string" && typeof file.content === "string" && file.path.length < 240 && !file.path.startsWith("/") && !file.path.split("/").includes("..") && !/(^|\/)(\.env(?:\.|$)|secrets?\.)/i.test(file.path));
  if (!files.length) throw new Error("A IA não retornou arquivos válidos para o repositório.");
  args.progress("Gravando " + files.length + " arquivos iniciais no GitHub...");
  const blobs = await Promise.all(files.map(async (file) => {
    const blob = await githubRequest<any>(args.token, "/repos/" + args.repository + "/git/blobs", { method: "POST", body: JSON.stringify({ content: file.content, encoding: "utf-8" }) });
    return { path: file.path, mode: "100644", type: "blob", sha: blob.sha };
  }));
  const tree = await githubRequest<any>(args.token, "/repos/" + args.repository + "/git/trees", { method: "POST", body: JSON.stringify({ tree: blobs }) });
  const commit = await githubRequest<any>(args.token, "/repos/" + args.repository + "/git/commits", { method: "POST", body: JSON.stringify({ message: String(plan.commitMessage || "feat: create initial project").slice(0, 120), tree: tree.sha, parents: [] }) });
  await githubRequest<any>(args.token, "/repos/" + args.repository + "/git/refs", { method: "POST", body: JSON.stringify({ ref: "refs/heads/" + args.branch, sha: commit.sha }) });
  return { summary: String(plan.summary || "Projeto criado do zero no repositório existente."), commitSha: String(commit.sha), commitUrl: "https://github.com/" + args.repository + "/commit/" + commit.sha, repository: args.repository, branch: args.branch, files: files.map((file) => file.path) };
}

export async function executeGitHubEdit(args: {
  githubToken: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  openrouterApiKey?: string;
  aiProvider?: AIProvider;
  aiModel?: string;
  repository: string;
  branch: string;
  request: string;
  onProgress?: (message: string) => void;
}) {
  const token = args.githubToken.trim();
  const provider: AIProvider = args.aiProvider || "gemini";
  const apiKey = ((provider === "openai" ? args.openaiApiKey : provider === "openrouter" ? args.openrouterApiKey : args.geminiApiKey) || "").trim();
  const repo = safeRepoName(args.repository);
  const branch = args.branch.trim() || "main";
  const request = args.request.trim();
  const progress = args.onProgress || (() => {});
  if (!token) throw new Error("Conecte o GitHub nas configurações.");
  if (!apiKey) throw new Error(provider === "openai" ? "Informe a chave da API OpenAI nas configurações." : provider === "openrouter" ? "Informe a chave da API OpenRouter nas configurações." : "Informe a chave da API Gemini nas configurações.");
  if (request.length < 3) throw new Error("Descreva a alteração que deseja realizar.");
  if (request.length > 12000) throw new Error("O pedido ultrapassa o limite de 12.000 caracteres.");

  progress("Verificando acesso ao GitHub...");
  await validateGitHubToken(token);
  let branchData: any;
  try {
    branchData = await githubRequest<any>(token, `/repos/${repo}/branches/${encodeURIComponent(branch)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/Branch not found|Repositório, branch ou arquivo não encontrado/i.test(message)) throw error;
    const existingRepo = await githubRequest<any>(token, `/repos/${repo}`);
    const branches = await githubRequest<any[]>(token, `/repos/${repo}/branches?per_page=100`);
    if (Array.isArray(branches) && branches.length === 0) {
      const initialBranch = String(existingRepo.default_branch || branch || "main");
      return scaffoldEmptyRepository({ token, provider, apiKey, model: args.aiModel || "", repository: repo, request, branch: initialBranch, progress });
    }
    throw new Error("A branch '" + branch + "' não existe no repositório " + repo + ". Selecione uma branch existente em Conexões ou use Criar projeto do zero. O repositório não está vazio, por isso não foi alterado.");
  }
  const headSha = branchData?.commit?.sha;
  if (!headSha) throw new Error("Não foi possível identificar o último commit da branch.");
  progress("Lendo a estrutura do repositório...");
  const treeData = await githubRequest<any>(token, `/repos/${repo}/git/trees/${encodeURIComponent(headSha)}?recursive=1`);
  if (treeData?.truncated) progress("O repositório é grande; usando os caminhos retornados pelo GitHub.");
  const tree: TreeEntry[] = (treeData?.tree || [])
    .filter((item: any) => item.type === "blob" && isAllowedTextPath(item.path, Number(item.size || 0)))
    .map((item: any) => ({ path: item.path, type: item.type, size: item.size, sha: item.sha }));
  if (!tree.length) throw new Error("Não encontrei arquivos de código adequados para editar nesse repositório.");

  progress("Selecionando os arquivos relevantes...");
  const treeList = tree.slice(0, 1200).map((item) => item.path + (item.size ? ` (${item.size} bytes)` : "")).join("\n");
  const selection = await callAI(provider, apiKey, [
    "Você é um engenheiro de software cuidadoso. Selecione os arquivos existentes mais relevantes para implementar o pedido.",
    "Responda somente JSON com a forma {\"paths\":[\"caminho/arquivo.ext\"],\"reason\":\"motivo breve\"}.",
    "Escolha no máximo 8 caminhos que existam exatamente na lista. Prefira componentes, rotas, estilos e configurações estritamente necessárias. Não escolha arquivos secretos, dependências instaladas ou arquivos de lock.",
    "PEDIDO DO USUÁRIO:\n" + request,
    "ARQUIVOS DO REPOSITÓRIO:\n" + treeList,
  ].join("\n\n"), args.aiModel);
  const selectedPaths = Array.isArray(selection?.paths)
    ? selection.paths.filter((path: unknown): path is string => typeof path === "string" && tree.some((entry) => entry.path === path)).slice(0, MAX_CONTEXT_FILES)
    : [];
  const fallbackPaths = [...tree]
    .sort((a, b) => pathRelevance(b.path, request) - pathRelevance(a.path, request))
    .slice(0, MAX_CONTEXT_FILES)
    .map((entry) => entry.path);
  const paths = [...new Set([...selectedPaths, ...fallbackPaths])].slice(0, MAX_CONTEXT_FILES);
  const selectedFiles: Array<{ path: string; content: string }> = [];
  for (const path of paths) {
    const entry = tree.find((item) => item.path === path);
    if (!entry || Number(entry.size || 0) > 180000) continue;
    try {
      const file = await githubRequest<any>(token, `/repos/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(headSha)}`);
      if (file?.encoding !== "base64" || typeof file.content !== "string") continue;
      const content = decodeBase64Utf8(file.content);
      if (content.length <= MAX_FILE_CHARS && !containsLikelySecret(content)) selectedFiles.push({ path, content });
    } catch {
      // Ignore a file that changed or could not be read; other context may still be sufficient.
    }
  }
  if (!selectedFiles.length) throw new Error("Não consegui ler os arquivos de texto do repositório. Confira as permissões de Contents: Read.");
  progress(`Analisando ${selectedFiles.length} arquivos e preparando as alterações...`);
  const fileContext = selectedFiles.map((file) => `--- ARQUIVO: ${file.path} ---\n${file.content}\n--- FIM DO ARQUIVO ---`).join("\n\n");
  const generated = parseJsonResponse<{ summary?: string; commitMessage?: string; changes?: Change[] }>(
    await callAI(provider, apiKey, [
      "Você é um agente de engenharia de software que edita um repositório GitHub.",
      "Retorne SOMENTE JSON válido: {\"summary\":\"resumo em português\",\"commitMessage\":\"mensagem curta de commit\",\"changes\":[{\"path\":\"caminho relativo\",\"content\":\"conteúdo COMPLETO do arquivo\"}]}.",
      "Edite somente o necessário para cumprir o pedido. Para cada arquivo modificado, devolva o conteúdo COMPLETO, não um diff. Não invente APIs, não remova funcionalidades não relacionadas, não inclua markdown fences e não altere arquivos secretos.",
      "Inclua no máximo 10 arquivos. Se o pedido não puder ser implementado com o contexto fornecido, devolva changes vazio e explique o motivo em summary.",
      "PEDIDO:\n" + request,
      "BRANCH: " + branch,
      "ARQUIVOS ATUAIS:\n" + fileContext,
    ].join("\n\n"), args.aiModel),
    "as alterações",
  );
  if (Array.isArray(generated.changes) && generated.changes.length > MAX_PATCH_FILES) throw new Error("A IA retornou mais de 10 alterações. Nenhum arquivo foi salvo; divida o pedido em etapas.");
  const changes = Array.isArray(generated.changes) ? generated.changes : [];
  if (!changes.length) throw new Error(generated.summary || "A IA não propôs nenhuma alteração.");
  const seen = new Set<string>();
  for (const change of changes) {
    if (!change || typeof change.path !== "string" || typeof change.content !== "string") throw new Error("A IA retornou uma alteração de arquivo inválida.");
    if (!isAllowedTextPath(change.path, new TextEncoder().encode(change.content).length)) throw new Error(`O caminho ${change.path} não é permitido para edição automática.`);
    if (seen.has(change.path)) throw new Error(`A IA retornou o arquivo ${change.path} mais de uma vez.`);
    if (tree.some(entry => entry.path === change.path) && !selectedFiles.some(file => file.path === change.path)) throw new Error(`A IA tentou substituir ${change.path} sem ler o arquivo. Nenhuma alteração foi salva.`);
    if (containsLikelySecret(change.content)) throw new Error("A IA retornou possíveis credenciais. Nenhum arquivo foi salvo.");
    seen.add(change.path);
    if (change.content.length > 180000) throw new Error(`O arquivo ${change.path} ultrapassa o limite de tamanho.`);
  }

  progress(`Preparando commit com ${changes.length} arquivo(s)...`);
  const commitData = await githubRequest<any>(token, `/repos/${repo}/git/commits/${headSha}`);
  const baseTree = commitData?.tree?.sha;
  if (!baseTree) throw new Error("Não foi possível carregar a árvore Git para criar o commit.");
  const blobs = await Promise.all(changes.map(async (change) => {
    const blob = await githubRequest<any>(token, `/repos/${repo}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: change.content, encoding: "utf-8" }),
    });
    return { path: change.path, mode: "100644", type: "blob", sha: blob.sha };
  }));
  const newTree = await githubRequest<any>(token, `/repos/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTree, tree: blobs }),
  });
  const commit = await githubRequest<any>(token, `/repos/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: String(generated.commitMessage || `feat: ${request.slice(0, 60)}`).slice(0, 120),
      tree: newTree.sha,
      parents: [headSha],
    }),
  });
  const latest = await githubRequest<any>(token, `/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  if (latest?.object?.sha !== headSha) {
    throw new Error("A branch mudou durante a execução. Nenhum commit foi aplicado; atualize o projeto e tente novamente.");
  }
  progress("Gravando e verificando o commit no GitHub...");
  await githubRequest<any>(token, `/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  const verifiedBranch = await githubRequest<any>(token, `/repos/${repo}/branches/${encodeURIComponent(branch)}`);
  if (verifiedBranch?.commit?.sha !== commit.sha) {
    throw new Error("O GitHub aceitou a atualização, mas a verificação final da branch não confirmou o commit. Confira o histórico do repositório antes de repetir o comando.");
  }
  return {
    summary: String(generated.summary || "Alterações aplicadas."),
    commitSha: String(commit.sha),
    commitUrl: `https://github.com/${repo}/commit/${commit.sha}`,
    repository: repo,
    branch,
    files: changes.map((change) => change.path),
  };
}
