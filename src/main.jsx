import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './estilos.css';

// Sem StrictMode: no React 19 ele desmonta/remonta as etiquetas <Html> da drei durante o render e enche o console de aviso
createRoot(document.getElementById('raiz')).render(<App />);
