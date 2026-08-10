import { createApp } from 'vue';
import App from './App.vue';

import "@m3e/web/all";
import './assets/index.css';
import { minimizeWindow, maximizeWindow, closeWindow } from './utils/tauriWindow';

const app = createApp(App);
app.mount('#root');

// Window control handlers (supports Tauri v1/v2 & Web fallback)
setTimeout(() => {
  document.getElementById('titlebar-minimize')?.addEventListener('click', () => {
    minimizeWindow();
  });
  document.getElementById('titlebar-maximize')?.addEventListener('click', () => {
    maximizeWindow();
  });
  document.getElementById('titlebar-close')?.addEventListener('click', () => {
    closeWindow();
  });
}, 100);

