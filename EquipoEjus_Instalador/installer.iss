[Setup]
; Información básica de la aplicación
AppId={{com.ejus.registro}}
AppName=Registro de Visitas TSJ-DEM
AppVersion=1.0
AppPublisher=Luis Rodriguez - TSJ
; Directorio por defecto (Se instalará en Archivos de Programa)
DefaultDirName={autopf}\RegistroVisitasTSJ
DefaultGroupName=Registro de Visitas TSJ
AllowNoIcons=yes
; Ruta donde se guardará el instalador final (Cámbiala si prefieres otra carpeta)
OutputDir=C:\Users\Luis Rodriguez\Desktop\EquipoEjus\Instalador_Final
OutputBaseFilename=Instalador_Registro_Visitas
SetupIconFile=C:\Users\Luis Rodriguez\Desktop\EquipoEjus\EquipoEjus_Instalador\build\icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
[Dirs]
; Dar permisos totales a la carpeta del backend para que Windows no bloquee la DB
Name: "{app}\resources\django_backend"; Permissions: users-full

[Files]
; 1. Aplicación Electron principal
Source: "C:\Users\Luis Rodriguez\Desktop\EquipoEjus\EquipoEjus_Instalador\dist_electron\win-unpacked\RegistroVisitasEjus.exe"; DestDir: "{app}"; Flags: ignoreversion

; 2. Archivos de soporte de Electron (Excluyendo carpetas que manejamos manual)
Source: "C:\Users\Luis Rodriguez\Desktop\EquipoEjus\EquipoEjus_Instalador\dist_electron\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "resources\django_backend\*, resources\db.sqlite3"

; 3. Carpeta de Django completa (Generada con --onedir)
Source: "C:\Users\Luis Rodriguez\Desktop\EquipoEjus\EquipoEjus_Instalador\backend_ejus\RegistroVisitas_Backend\dist\django_backend\*"; DestDir: "{app}\resources\django_backend"; Flags: ignoreversion recursesubdirs createallsubdirs

; 4. LA BASE DE DATOS PROTEGIDA
; Solo se instala si no existe. 'uninsneveruninstall' protege tus datos si borras el programa por error.
Source: "C:\Users\Luis Rodriguez\Desktop\EquipoEjus\EquipoEjus_Instalador\backend_ejus\RegistroVisitas_Backend\db.sqlite3"; DestDir: "{app}\resources\django_backend"; Flags: onlyifdoesntexist uninsneveruninstall

[Icons]
Name: "{group}\Registro de Visitas TSJ"; Filename: "{app}\RegistroVisitasEjus.exe"
Name: "{autodesktop}\Registro de Visitas TSJ"; Filename: "{app}\RegistroVisitasEjus.exe"; Tasks: desktopicon

[Run]
; Ejecutar el programa automáticamente al terminar la instalación
Filename: "{app}\RegistroVisitasEjus.exe"; Description: "{cm:LaunchProgram,Registro de Visitas TSJ}"; Flags: nowait postinstall skipifsilent