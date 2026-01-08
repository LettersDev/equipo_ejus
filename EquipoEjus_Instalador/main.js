const { app, BrowserWindow, screen, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let djangoProcess;

function startDjango() {
  const isDev = !app.isPackaged;
  let backendPath;
  let backendDir;

  if (isDev) {
    backendPath = path.join(__dirname, 'backend_ejus', 'RegistroVisitas_Backend', 'dist', 'django_backend', 'django_backend.exe');
  } else {
    // IMPORTANTE: Ahora el exe vive dentro de la carpeta django_backend
    backendPath = path.join(process.resourcesPath, 'django_backend', 'django_backend.exe');
  }
  
  backendDir = path.dirname(backendPath);

  djangoProcess = spawn(backendPath, ['runserver', '127.0.0.1:8000', '--noreload'], {
    shell: false,
    cwd: backendDir // Asegura que la DB se lea de la carpeta de instalación
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200, height: 800, show: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  mainWindow.removeMenu();
  
  // Delay de 2.5 segundos para que Django termine de subir
  setTimeout(() => {
    const indexPath = path.join(__dirname, 'frontend_ejus', 'dist', 'index.html');
    mainWindow.loadFile(indexPath).then(() => {
      mainWindow.maximize();
      mainWindow.show();
    });
  }, 2500);
}

app.whenReady().then(() => {
  startDjango();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (djangoProcess) {
      // Cierre suave para asegurar la escritura de la DB
      djangoProcess.kill('SIGTERM');
    }
    setTimeout(() => {
      spawn("taskkill", ["/f", "/im", "django_backend.exe", "/t"]);
      app.quit();
    }, 1000);
  }
});