import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialize theme and header/sidebar template on initial load
const savedTheme = localStorage.getItem('biztech_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if (savedTheme === 'dark') document.body.classList.add('dark-theme');

const savedTemplate = localStorage.getItem('workspace_sidebar_template') || 'none';
const effectiveTemplate = savedTemplate === 'charcoal' ? 'navy' : savedTemplate;
document.documentElement.setAttribute('data-sidebar-template', effectiveTemplate);

// Globally disable mouse wheel changing number input values across the entire application
document.addEventListener('wheel', () => {
  if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'number') {
    document.activeElement.blur();
  }
}, { passive: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
