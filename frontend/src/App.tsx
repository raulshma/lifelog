
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@components/Layout';
import { Home } from '@components/Home';
import { DayTracker, KnowledgeBase, Vault, DocumentHub, Inventory } from '@modules';
import type { AppProps } from '@types';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App({ children }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="day-tracker" element={<DayTracker />} />
            <Route path="knowledge-base" element={<KnowledgeBase />} />
            <Route path="vault" element={<Vault />} />
            <Route path="document-hub" element={<DocumentHub />} />
            <Route path="inventory" element={<Inventory />} />
          </Route>
        </Routes>
        {children}
      </Router>
    </QueryClientProvider>
  );
}

export default App;
