/**
 * Prueba de email de actualización de pedido vía Resend.
 * Uso: node --env-file=.env.local scripts/resend-order-status.mjs [order_number] [status] [tracking]
 * Ejemplo: node --env-file=.env.local scripts/resend-order-status.mjs INM-20260520-6526 paid
 */

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

const runner = spawnSync(
  'npx',
  ['--yes', 'tsx', path.join(__dirname, 'resend-order-status-runner.ts'), ...args],
  { stdio: 'inherit', shell: true, cwd: path.join(__dirname, '..'), env: process.env },
)

process.exit(runner.status ?? 1)
