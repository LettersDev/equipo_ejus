const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Fuente de verdad: package.json raiz
const pkgPath = path.join(ROOT, 'package.json');
const { version } = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

console.log(`[sync-version] Sincronizando version ${version}...`);

// 1. Destino: archivo VERSION del backend
const versionFilePath = path.join(ROOT, 'backend_ejus', 'RegistroVisitas_Backend', 'VERSION');
fs.writeFileSync(versionFilePath, version, 'utf-8');
console.log(` - Backend VERSION actualizado.`);

// 2. Destino: App.jsx (UI Frontend)
const appJsxPath = path.join(ROOT, 'frontend_ejus', 'src', 'App.jsx');
if (fs.existsSync(appJsxPath)) {
  let content = fs.readFileSync(appJsxPath, 'utf-8');
  const regex = /<span>Sistema de Control de Visitantes v\d+\.\d+\.\d+<\/span>/g;
  if (regex.test(content)) {
    content = content.replace(regex, `<span>Sistema de Control de Visitantes v${version}</span>`);
    fs.writeFileSync(appJsxPath, content, 'utf-8');
    console.log(` - App.jsx (UI) actualizado.`);
  } else {
    console.warn(` - [!] No se encontro el patron de version en App.jsx`);
  }
}

// 3. Destino: installer.iss (Inno Setup)
const issPath = path.join(ROOT, 'installer.iss');
if (fs.existsSync(issPath)) {
  let content = fs.readFileSync(issPath, 'utf-8');
  // Actualizar AppVersion
  content = content.replace(/AppVersion=\d+\.\d+\.\d+/g, `AppVersion=${version}`);
  // Actualizar OutputBaseFilename
  content = content.replace(/OutputBaseFilename=Instalador_Registro_Visitas_V\d+\.\d+\.\d+/g, `OutputBaseFilename=Instalador_Registro_Visitas_V${version}`);
  fs.writeFileSync(issPath, content, 'utf-8');
  console.log(` - installer.iss actualizado.`);
}

console.log(`[sync-version] Sincronización completada.`);

