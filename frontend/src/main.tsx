import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useSettingsStore } from './store/settingsStore';
import { useAuthStore } from './store/authStore';
import './styles/index.css';

// Apply theme immediately before render to avoid flash
const theme = useSettingsStore.getState().theme;
const root = document.documentElement;
if (theme === 'dark') root.classList.add('dark');
else if (theme === 'system') {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
}

// Init Supabase auth listener
useAuthStore.getState().initAuth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
