
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// ── Admin panel detection ─────────────────────────────────────────────────────
// Accessible at /?admin — completely separate from the demo visitor flow.
// No link to this URL exists anywhere in the demo UI.
const isAdminRoute = window.location.search.includes('admin') ||
                     window.location.hash.startsWith('#/admin');

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element to mount to');

const root = createRoot(rootElement);

if (isAdminRoute) {
  // Lazy-load admin page — keeps it out of the main bundle entirely
  import('./src/demo/admin/AdminPage').then(({ AdminPage }) => {
    root.render(
      <React.StrictMode>
        <AdminPage />
      </React.StrictMode>,
    );
  });
} else {
  // Main demo flow — no login required
  import('./src/demo/DemoApp').then(({ DemoApp }) => {
    root.render(
      <React.StrictMode>
        <DemoApp />
      </React.StrictMode>,
    );
  });
}
