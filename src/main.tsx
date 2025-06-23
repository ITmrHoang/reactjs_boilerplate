import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx' # if use BrowserRouter open  <App />
import { store } from '@/store'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './router'; // Import router

// mock api in develop env
async function enableMocking() {
  if (!import.meta.env.DEV) {
    return;
  }
  const { worker } = await import('@/__mock__/api/browser.js');
  return worker.start({
    onunhandledrequest: 'bypass',
  });
}
const queryClient = new QueryClient();

const root = createRoot(document.getElementById('root')!)
enableMocking().then(() => {
  root.render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {/* <App /> */}
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)})
