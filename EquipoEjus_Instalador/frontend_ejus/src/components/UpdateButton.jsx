import React, { useEffect, useState } from 'react';
import { tsjService } from '../services/api';

export default function UpdateButton({ token }){
  const [current, setCurrent] = useState(null);
  const [remote, setRemote] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const v = await tsjService.getVersion();
        if(!mounted) return;
        setCurrent(v.version);
      }catch(e){/* ignore */}
    })();
    return ()=> mounted=false;
  },[]);

  const onUpdate = async ()=>{
    if(!confirm('¿Desea instalar la última versión ahora? El servicio se reiniciará.')) return;
    setBusy(true);
    try{
      const res = await tsjService.runUpdate(null, token);
      alert('Resultado: ' + JSON.stringify(res));
    }catch(e){
      alert('Error al actualizar: ' + (e?.response?.data || e.message));
    }finally{
      setBusy(false);
    }
  };

  const checkRemote = async () => {
    setBusy(true);
    try {
      const gh = await fetch('https://api.github.com/repos/LettersDev/equipo_ejus/releases/latest');
      if (gh.ok) {
        const js = await gh.json();
        setRemote(js.tag_name.replace(/^v/,''));
        // Comparar versiones
        if (current && js.tag_name.replace(/^v/, '') !== current) {
          // Buscar el instalador .exe
          const asset = js.assets.find(a => a.name.endsWith('.exe'));
          if (asset && asset.browser_download_url) {
            if (window.confirm(`Nueva versión disponible: v${js.tag_name.replace(/^v/, '')}. ¿Desea descargar el instalador?`)) {
              // Descargar el instalador automáticamente
              const a = document.createElement('a');
              a.href = asset.browser_download_url;
              a.download = '';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              alert('Descarga iniciada. Cuando termine, ejecuta el instalador para actualizar la aplicación.');
            }
          } else {
            alert('No se encontró instalador para esta versión.');
          }
        } else {
          alert('Ya tienes la última versión.');
        }
      }
    } catch (e) {
      console.debug('No se pudo consultar GitHub:', e.message);
      alert('Error comprobando actualización: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  if(!current) return null;

  return (
    <div className="tsj-update-root update-check-footer">
      <button className="btn-primary update-check-btn" onClick={checkRemote} disabled={busy}>
        Comprobar actualización
        <span className="update-version-badge">v{current}</span>
      </button>
    </div>
  );
}
