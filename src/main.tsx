import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { StatsProvider } from './contexts/StatsContext.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <StatsProvider>
        <App />
      </StatsProvider>
    </AuthProvider>
  </ThemeProvider>
);
