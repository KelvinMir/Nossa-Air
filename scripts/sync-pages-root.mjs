import { copyFileSync, cpSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

copyFileSync(resolve(root, 'dist/index.html'), resolve(root, 'index.html'))

rmSync(resolve(root, 'assets'), { recursive: true, force: true })
cpSync(resolve(root, 'dist/assets'), resolve(root, 'assets'), { recursive: true })
cpSync(resolve(root, 'dist/imagens'), resolve(root, 'imagens'), { recursive: true })
