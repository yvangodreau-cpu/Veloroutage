import React from 'react'
import ReactDOM from 'react-dom/client'
import BRouterApp from './BRouterApp.jsx'
import './index.css'

// Register PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => {
    console.log('PWA prête');
    
    // Vérifier les mises à jour
    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
  });
}

// Listener pour les mises à jour
let refreshing = false;
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (refreshing) return;
  refreshing = true;
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BRouterApp />
  </React.StrictMode>,
)
