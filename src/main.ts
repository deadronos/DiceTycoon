import './styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootEl = document.getElementById('app') as HTMLElement;
const root = createRoot(rootEl);
root.render(React.createElement(App));
