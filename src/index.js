import './styles/global.css';
import App from './App.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '';
    const app = new App();
    app.mount(root);
  }
});