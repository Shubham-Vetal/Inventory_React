import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ItemsProvider } from './context/ItemsContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ItemsProvider>
        <App />
      </ItemsProvider>
    </BrowserRouter>
  </React.StrictMode>
);