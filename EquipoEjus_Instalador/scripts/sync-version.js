#!/usr/bin/env node
/**
 * sync-version.js
 * Lee la version del package.json raiz y la escribe en
 * backend_ejus/RegistroVisitas_Backend/VERSION
 * Se ejecuta automaticamente antes del build (via "prebuild" en package.json).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Fuente de verdad: package.json raiz
const pkgPath = path.join(ROOT, 'package.json');
const { version } = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

// Destino: archivo VERSION del backend
const versionFilePath = path.join(
  ROOT,
  'backend_ejus',
  'RegistroVisitas_Backend',
  'VERSION'
);

const current = fs.existsSync(versionFilePath)
  ? fs.readFileSync(versionFilePath, 'utf-8').trim()
  : null;

if (current === version) {
  console.log(`[sync-version] VERSION ya esta en ${version}, sin cambios.`);
} else {
  fs.writeFileSync(versionFilePath, version, 'utf-8');
  console.log(`[sync-version] VERSION actualizado: ${current ?? '(nuevo)'} → ${version}`);
}
