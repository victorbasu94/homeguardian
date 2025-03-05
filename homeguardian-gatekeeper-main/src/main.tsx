import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import our mock API integration in development mode
if (import.meta.env.DEV) {
  import('./lib/mockApiIntegration');
  console.log('Mock API integration enabled for development');
}

createRoot(document.getElementById("root")!).render(<App />);
