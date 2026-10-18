# Running PhishGuard.ai on your localhost

## 1. Get the code
In Lovable: **GitHub → Connect to GitHub** (then `git clone` your repo), or **Project Settings → Export / Download** the ZIP.

## 2. Requirements
- Node.js 20+ (https://nodejs.org)
- npm (bundled) — or `bun` if you prefer

## 3. Install
```bash
cd <project-folder>
npm install
```

## 4. Environment variables
Create a file named `.env` in the project root:

```env
VITE_SUPABASE_URL=<your backend URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<your publishable key>
VITE_SUPABASE_PROJECT_ID=<your project id>

SUPABASE_URL=<same as VITE_SUPABASE_URL>
SUPABASE_PUBLISHABLE_KEY=<same as VITE_SUPABASE_PUBLISHABLE_KEY>
SUPABASE_PROJECT_ID=<same as VITE_SUPABASE_PROJECT_ID>

# Needed only for the AI explanation part of a scan
LOVABLE_API_KEY=<your Lovable AI key>
```

The exact values are already in the `.env` file inside the Lovable project — copy them across when you export. The URL/publishable key are safe to keep locally; do not commit `.env` to GitHub.

Without `LOVABLE_API_KEY` the URL feature extraction and risk score still work; only the AI written explanation is skipped.

## Email and SMS modules
- Open `/email` or `/sms` after starting the app. Both content detectors work without an AI key.
- AI explanations are optional: select the AI checkbox before submitting. The server-only AI Gateway SDK reads `LOVABLE_API_KEY`; never use a `VITE_` prefix for it. Hosted secrets are not included in exported `.env` files.
- History uses the same hosted backend, which already has the added scan columns. For a separate backend, apply the included `drizzle/migrations/0000_add_email_sms_scan_history.sql` after the original scans schema.
- These modules implement heuristic content and URL analysis, not trained ML inference. Sender authentication, mailbox/mobile integrations, and attachment scanning are not implemented.

## 5. Run
```bash
npm run dev
```
Open http://localhost:8080

## 6. Production build (optional)
```bash
npm run build
npm run preview
```

## Notes
- Auth, database and scan history point at the same hosted Lovable Cloud backend, so login and history work locally too.
- For Google sign-in locally, `http://localhost:8080` must be added as an allowed redirect URL in the auth settings.
- Port is set in `vite.config.ts` — change it there if 8080 is busy.

## Troubleshooting
| Problem | Fix |
| --- | --- |
| `command not found: npm` | Install Node.js 20+ |
| Blank page / auth errors | `.env` missing or wrong values |
| Scan returns no AI explanation | `LOVABLE_API_KEY` missing |
| Port in use | Change `server.port` in `vite.config.ts` |
