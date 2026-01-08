import React, { useEffect, useState } from 'react';
import '../App.css';

let idCounter = 0;
export const showToast = (message, type = 'info', timeout = 4000) => {
  const event = new CustomEvent('tsj-show-toast', { detail: { id: ++idCounter, message, type, timeout } });
  window.dispatchEvent(event);
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const t = e.detail;
      setToasts(prev => [...prev, t]);
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id));
      }, t.timeout || 4000);
    };
    window.addEventListener('tsj-show-toast', handler);
    return () => window.removeEventListener('tsj-show-toast', handler);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="tsj-toast-container" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`tsj-toast tsj-toast-${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
};

export default Toast;
