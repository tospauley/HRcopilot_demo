
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
  // Check if visitor chose to view the real application (set by Landing role picker)
  const guestRole = sessionStorage.getItem('hr360_guest_role');

  if (guestRole) {
    // Load the real App directly — full role-based sidebar, no login
    import('./App').then(({ default: App }) => {
      root.render(
        <React.StrictMode>
          <App />
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
}
