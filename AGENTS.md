<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Registration classifies Supabase errors in a browser-safe helper and guards submissions synchronously; this prevents duplicate sends without retrying or bypassing provider quotas.
- The editor uses a dedicated repository preview loader pinned to an immutable GitHub commit; static HTML runs sandboxed and Vite runs in a lazy-loaded Sandpack Node environment, never an AI reconstruction. Tool/config dot-folders and files that look like credentials are excluded from the preview rather than blocking it, so secrets never reach the sandbox.
- GitHub permission errors are explained by token type (GitHub App ghu_, fine-grained, classic) because GitHub Apps ignore OAuth scopes.
- New GitHub projects validate the complete scaffold before creating a private initialized repository, then verify the branch after uploading; edit mode targets the selected repository and preserves its existing tree.
