#!/usr/bin/env node

/**
 * Version Bump Script for Obsidian Plugin
 *
 * Usage: bun run version [patch|minor|major]
 *
 * Bumps version in all required files, commits, tags, and pushes.
 * Default bump type: patch
 *
 * What it does:
 * 1. Bumps version in package.json, manifest.json, versions.json
 * 2. Commits all changes with message "chore(release): X.Y.Z"
 * 3. Creates git tag "X.Y.Z"
 * 4. Pushes commit + tag to origin
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

const BUMP_TYPE = process.argv[2] || 'patch'

if (!['patch', 'minor', 'major'].includes(BUMP_TYPE)) {
  console.error(`❌ Invalid bump type: "${BUMP_TYPE}". Use: patch, minor, or major`)
  process.exit(1)
}

// --- Read current files ---
const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'))

let versions = {}
try {
  versions = JSON.parse(readFileSync('versions.json', 'utf-8'))
} catch {
  // Will be created
}

const currentVersion = pkg.version
const [major, minor, patch] = currentVersion.split('.').map(Number)

// --- Calculate new version ---
let newVersion
switch (BUMP_TYPE) {
  case 'major':
    newVersion = `${major + 1}.0.0`
    break
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`
    break
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`
    break
}

console.log(`\n📦 Bumping version: ${currentVersion} → ${newVersion} (${BUMP_TYPE})\n`)

// --- Update package.json ---
pkg.version = newVersion
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
console.log('  ✅ package.json')

// --- Update manifest.json ---
manifest.version = newVersion
writeFileSync('manifest.json', JSON.stringify(manifest, null, 2) + '\n')
console.log('  ✅ manifest.json')

// --- Update versions.json ---
const minAppVersion = manifest.minAppVersion
versions[newVersion] = minAppVersion
writeFileSync('versions.json', JSON.stringify(versions, null, 2) + '\n')
console.log('  ✅ versions.json')

// --- Git commit, tag, push ---
const run = (cmd) => {
  console.log(`  🔧 ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

console.log('')
run('git add package.json manifest.json versions.json')
run(`git commit -m "chore(release): ${newVersion}"`)
run(`git tag "${newVersion}"`)
run(`git push origin main "${newVersion}"`)

console.log(`\n🚀 Released ${newVersion} — commit + tag pushed!\n`)
