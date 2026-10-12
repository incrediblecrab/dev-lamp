# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and GitHub Copilot CLI when working in this repository.

dev-lamp is a TypeScript CLI that runs Lighthouse against a URL in a local Chrome and writes a markdown, text or JSON report. It is published to npm as `dev-lamp` and installs two binaries, `dev-lamp` and `lamp`, both pointing at `bin/dev-lamp.js`. The repository is public.

## Commands

```bash
npm install
npm run build        # tsc -> dist/ (prepublishOnly runs it too)
npm run lint         # tsc --noEmit; this is the only static check
npm run dev          # tsx watch on src/cli/index.ts
node bin/dev-lamp.js analyze http://localhost:3000 --format md   # run the checked-out copy
```

There are no test files. `npm test` runs bare `vitest`, which finds nothing and, in a terminal, stays in watch mode; use `npx vitest run` once tests exist.

## Structure

`src/cli/index.ts` defines the commands (`analyze`/`a`, plus the `wish` and `rub` aliases). `src/core/chrome-manager.ts` launches Chrome and `src/core/lighthouse-runner.ts` drives Lighthouse and owns the list of valid categories. Output goes through `src/formatters/formatter-factory.ts`, which picks a markdown, text or JSON formatter; templates (`minimal`, `detailed`, `github`) live with the markdown formatter. `--threshold` is checked after the report is written, so a failing run still leaves a report on disk.

## Releasing

`files` in `package.json` is the allowlist for what ships (`dist/`, `bin/`, `README.md`, `LICENSE`, `CHANGELOG.md`); `.npmignore` is a leftover and does not decide anything while `files` exists. `CHANGELOG.md` is listed but does not exist. The README states the published version, so bump it alongside `package.json`. The release checklist is in `../README.md`.
