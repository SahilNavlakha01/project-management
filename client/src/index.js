import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'antd/dist/reset.css';
import { message } from 'antd';

const root = ReactDOM.createRoot(document.getElementById('root'));
message.config({ top: 80, duration: 2 });

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);