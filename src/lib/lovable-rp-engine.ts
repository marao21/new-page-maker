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
const GEMINI_MODEL = "gemini-2.5-flash";
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
    const detail = data?.message || `GitHub HTTP ${response.status}`;
    if (response.status === 401) throw new Error("Token do GitHub inválido ou expirado.");
    if (response.status === 403) throw new Error("O GitHub negou o acesso. Confira as permissões do token e o limite de requisições.");
    if (response.status === 404) throw new Error("Repositório, branch ou arquivo não encontrado. Confira o acesso e o nome informado.");
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
  await callGemini(apiKey, 'Responda somente JSON: {"ok":true,"message":"conectado"}.');
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

async function callGemini(apiKey: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.15,
          responseMimeType: "application/json",
          maxOutputTokens: 16384,
        },
      }),
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `Gemini HTTP ${response.status}`;
    if (response.status === 400 || response.status === 403) throw new Error(`Não foi possível usar a chave Gemini: ${message}`);
    if (response.status === 429) throw new Error("O limite da API Gemini foi atingido. Aguarde ou confira as cotas.");
    throw new Error(message);
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || "").join("") || "";
  if (!text.trim()) throw new Error("O Gemini não retornou uma resposta. Tente novamente com um pedido mais específico.");
  try { return JSON.parse(text.replace(/^\uFEFF/, "").replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "")); }
  catch { throw new Error("A resposta da IA não veio em JSON válido. Tente novamente."); }
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
  if (!value || typeof value !== "object") throw new Error(`A IA retornou ${label} em formato inválido.`);
  return value as T;
}

export async function executeGitHubEdit(args: {
  githubToken: string;
  geminiApiKey: string;
  repository: string;
  branch: string;
  request: string;
  onProgress?: (message: string) => void;
}) {
  const token = args.githubToken.trim();
  const apiKey = args.geminiApiKey.trim();
  const repo = safeRepoName(args.repository);
  const branch = args.branch.trim() || "main";
  const request = args.request.trim();
  const progress = args.onProgress || (() => {});
  if (!token) throw new Error("Conecte o GitHub nas configurações.");
  if (!apiKey) throw new Error("Informe a chave da API Gemini nas configurações.");
  if (request.length < 3) throw new Error("Descreva a alteração que deseja realizar.");
  if (request.length > 12000) throw new Error("O pedido ultrapassa o limite de 12.000 caracteres.");

  progress("Verificando acesso ao GitHub...");
  await validateGitHubToken(token);
  const branchData = await githubRequest<any>(token, `/repos/${repo}/branches/${encodeURIComponent(branch)}`);
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
  const selection = await callGemini(apiKey, [
    "Você é um engenheiro de software cuidadoso. Selecione os arquivos existentes mais relevantes para implementar o pedido.",
    "Responda somente JSON com a forma {\"paths\":[\"caminho/arquivo.ext\"],\"reason\":\"motivo breve\"}.",
    "Escolha no máximo 8 caminhos que existam exatamente na lista. Prefira componentes, rotas, estilos e configurações estritamente necessárias. Não escolha arquivos secretos, dependências instaladas ou arquivos de lock.",
    "PEDIDO DO USUÁRIO:\n" + request,
    "ARQUIVOS DO REPOSITÓRIO:\n" + treeList,
  ].join("\n\n"));
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
    await callGemini(apiKey, [
      "Você é um agente de engenharia de software que edita um repositório GitHub.",
      "Retorne SOMENTE JSON válido: {\"summary\":\"resumo em português\",\"commitMessage\":\"mensagem curta de commit\",\"changes\":[{\"path\":\"caminho relativo\",\"content\":\"conteúdo COMPLETO do arquivo\"}]}.",
      "Edite somente o necessário para cumprir o pedido. Para cada arquivo modificado, devolva o conteúdo COMPLETO, não um diff. Não invente APIs, não remova funcionalidades não relacionadas, não inclua markdown fences e não altere arquivos secretos.",
      "Inclua no máximo 10 arquivos. Se o pedido não puder ser implementado com o contexto fornecido, devolva changes vazio e explique o motivo em summary.",
      "PEDIDO:\n" + request,
      "BRANCH: " + branch,
      "ARQUIVOS ATUAIS:\n" + fileContext,
    ].join("\n\n")),
    "as alterações",
  );
  const changes = Array.isArray(generated.changes) ? generated.changes.slice(0, MAX_PATCH_FILES) : [];
  if (!changes.length) throw new Error(generated.summary || "A IA não propôs nenhuma alteração.");
  const seen = new Set<string>();
  for (const change of changes) {
    if (!change || typeof change.path !== "string" || typeof change.content !== "string") throw new Error("A IA retornou uma alteração de arquivo inválida.");
    if (!isAllowedTextPath(change.path, new TextEncoder().encode(change.content).length)) throw new Error(`O caminho ${change.path} não é permitido para edição automática.`);
    if (seen.has(change.path)) throw new Error(`A IA retornou o arquivo ${change.path} mais de uma vez.`);
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
