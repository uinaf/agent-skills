# Change the Preview Port

This application already uses Vite+. Change only its preview port to 4400.
Finish the edit and available validation. Dependencies are installed and the
current toolchain works; neither a migration nor an upgrade is requested.
Repository policy requires `pnpm run verify` for configuration changes.

## Input Files

=============== FILE: vite.config.ts ===============
import { defineConfig } from 'vite-plus';
export default defineConfig({
  server: { port: 3000 },
  preview: { port: 4300, strictPort: true },
});
=============== END FILE ===============

=============== FILE: package.json ===============
{
  "private": true,
  "packageManager": "pnpm@12.0.0",
  "devDependencies": { "vite-plus": "0.3.0" },
  "scripts": { "verify": "vp check", "preview": "vp preview" }
}
=============== END FILE ===============

## Output

Produce the updated config and a brief validation report. Available installed
help and packaged docs are sufficient for this setting. If a command cannot run
in the evaluation environment, report that limitation accurately.
