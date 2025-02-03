// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const tileCount = 15;   // タイルの枚数（固定）
const columns = 4;      // 横に並ぶ列数（固定）

if (typeof global === 'undefined') {
  window.global = window;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{ width: '80%', position: 'relative', margin: '0 auto' }}>
      <App tileCount={tileCount} columns={columns} />
    </div>
  </StrictMode>
);
