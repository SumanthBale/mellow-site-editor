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

- Keep email/SMS lexical analysis in a browser-safe pure module with tests; this makes heuristic rules reproducible without AI or network access.
- Use separate email and SMS content routes sharing the scanner and result views; this keeps navigation and module-specific inputs clear.
- Use the AI Gateway SDK only inside server functions for new message explanations; this keeps secrets and message inference out of browser bundles.
- Store all scan types in the existing owner-protected scans table with additive columns; this preserves URL history and existing access policies.
