import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

// Один QueryClient на всё приложение — в нём живёт кэш запросов.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Журнал — статичный файл, перезапрашивать его при возврате на вкладку незачем.
      refetchOnWindowFocus: false,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Не найден элемент #root в index.html');

createRoot(rootElement).render(
  <StrictMode>
    {/* BrowserRouter даёт доступ к URL через useSearchParams/useNavigate */}
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
