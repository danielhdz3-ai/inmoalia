/**
 * Reenvía email de confirmación con la plantilla actual.
 * Uso: node --env-file=.env.local scripts/resend-order-confirmation.mjs [order_number]
 */

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const orderNumber = process.argv[2] ?? 'INM-20260520-6626'

const runner = spawnSync(
  'npx',
  ['--yes', 'tsx', path.join(__dirname, 'resend-order-confirmation-runner.ts'), orderNumber],
  { stdio: 'inherit', shell: true, cwd: path.join(__dirname, '..'), env: process.env },
)

process.exit(runner.status ?? 1)
