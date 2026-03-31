[Setup]
; --- Información básica de la aplicación ---
AppId={{com.ejus.registro}}
AppName=Registro de Visitas TSJ-DEM
AppVersion=1.0.5
AppPublisher=Luis Rodriguez - TSJ
AppComments=Aplicación de Registro de Visitas para el Equipo de Justicia Social

; --- Directorio de Instalación ---
; Se instalará en C:\Program Files (x86)\RegistroVisitasTSJ
DefaultDirName={autopf}\RegistroVisitasTSJ
DefaultGroupName=Registro de Visitas TSJ
AllowNoIcons=yes

; --- Configuración del Instalador Final ---
OutputDir=C:\Users\Luis Rodriguez\Desktop\EquipoEjus\Instalador_Final
OutputBaseFilename=Instalador_Registro_Visitas_V1.0.5
; El escudo de EJUS para el instalador .exe
SetupIconFile=C:\Users\Luis Rodriguez\Desktop\EquipoEjus\EquipoEjus_Instalador\build\icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Dirs]
; Permisos totales para que el backend de Django pueda escribir en la DB SQLite
Name: "{app}\resources\django_backend"; Permissions: users-full

[Files]
; 1. El archivo de icono de EJUS (Vital para que el acceso directo no salga en blanco)
Source: "C:\Users\Luis Rodriguez\Desktop\EquipoEjus\EquipoEjus_Instalador\build\icon.ico"; DestDir: "{app}"; Flags: ignoreversion

; 2. Aplicación Electron principal
Source: "C:\Users\Luis Rodriguez\Desktop\EquipoEjus\EquipoEjus_Instalador\dist_electron\win-unpacked\RegistroVisitasEjus.exe"; DestDir: "{app}"; Flags: ignoreversion

; 3. Archivos de soporte de Electron (Aquí va el código que contiene el logo TSJ del login dentro del ASAR)
Source: "C:\Users\Luis Rodriguez\Desktop\EquipoEjus\EquipoEjus_Instalador\dist_electron\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "resources\django_backend\*, resources\db.sqlite3"

; 4. Carpeta del Backend Django
Source: "C:\Users\Luis Rodriguez\Desktop\EquipoEjus\EquipoEjus_Instalador\backend_ejus\RegistroVisitas_Backend\dist\django_backend\*"; DestDir: "{app}\resources\django_backend"; Flags: ignoreversion recursesubdirs createallsubdirs

; 5. Base de Datos (Solo se instala si no existe para no borrar registros previos)
Source: "C:\Users\Luis Rodriguez\Desktop\EquipoEjus\EquipoEjus_Instalador\backend_ejus\RegistroVisitas_Backend\db.sqlite3"; DestDir: "{app}\resources\django_backend"; Flags: onlyifdoesntexist uninsneveruninstall

[Icons]
; Forzamos el uso del IconFilename apuntando al escudo de EJUS copiado en el paso 1 de [Files]
Name: "{group}\Registro de Visitas TSJ"; Filename: "{app}\RegistroVisitasEjus.exe"; IconFilename: "{app}\icon.ico"
Name: "{autodesktop}\Registro de Visitas TSJ"; Filename: "{app}\RegistroVisitasEjus.exe"; Tasks: desktopicon; IconFilename: "{app}\icon.ico"

[Run]
; Ejecutar automáticamente tras instalar
Filename: "{app}\RegistroVisitasEjus.exe"; Description: "{cm:LaunchProgram,Registro de Visitas TSJ}"; Flags: nowait postinstall skipifsilent