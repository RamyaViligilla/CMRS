import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App.tsx';
import { Provider } from './provider.tsx';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="375964443095-238j9ol0p6bj534ie6aa0v7cd7hkt949.apps.googleusercontent.com">
    <BrowserRouter>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
