import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { StatsProvider } from './contexts/StatsContext.tsx'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <StatsProvider>
      <App />
    </StatsProvider>
  </ThemeProvider>
);
