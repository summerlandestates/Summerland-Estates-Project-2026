import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// When a deploy swaps hashed chunks, tabs holding the old index.html fail to
// lazy-load routes. Reload once to pick up the fresh build.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const lastReload = Number(sessionStorage.getItem('chunk-error-reload') ?? 0);
  if (Date.now() - lastReload > 10_000) {
    sessionStorage.setItem('chunk-error-reload', String(Date.now()));
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
