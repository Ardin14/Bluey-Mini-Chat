## Bluey Mini Chat

This app was created using https://getmocha.com.
Need help or want to join the community? Join our [Discord](https://discord.gg/shDEGBSe2d).

Lightweight simulated Bluetooth chat UI built with Vite + React + TypeScript and Tailwind CSS.

This repository is prepared to be connected to GitHub and deployed on Vercel.

Features
- Simulated Bluetooth service (for demo / dev)
- Message queue and chat UI components
- Cloudflare Worker source present in `src/worker` (not deployed to Vercel by default)

Local development

Install dependencies and run the dev server:

```powershell
npm ci
npm run dev
```

Build

```powershell
npm run build
```

Connect to GitHub & deploy to Vercel
1. Push this repo to GitHub (create a new repo and push main/master).
2. In Vercel, import the GitHub repository.
	- Build command: `npm run build`
	- Output directory: `dist` (Vite default)
3. (Optional) In the Vercel project settings set the Node version to 18+.

CI

A basic GitHub Actions workflow is included at `.github/workflows/ci.yml` that runs `npm ci`, `npm run lint`, and `npm run build` on push and pull requests.

Notes
- If you plan to deploy the Cloudflare Worker in `src/worker`, that is a separate deployment target (Cloudflare Workers) and is not deployed to Vercel by default.
- Update the `repository.url` field in `package.json` to point to your GitHub repository.

Support

Join the upstream community: https://getmocha.com or the project's Discord referenced in the original template.
