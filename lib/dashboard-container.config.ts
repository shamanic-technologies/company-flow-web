/**
 * This file contains static configurations for the AI Dashboard WebContainer.
 */

import { DashboardFileTree } from '@agent-base/types';

/**
 * The default file system tree for a "Hello World" Vite + React + Tremor dashboard.
 * Used when no specific dashboard is selected.
 */
export const viteFiles: DashboardFileTree = {
  'package.json': {
    file: {
      contents: `
{
  "name": "vite-react-starter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tremor/react": "latest",
    "@headlessui/react": "latest"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.33",
    "autoprefixer": "^10.4.17"
  }
}`,
    },
  },
  'vite.config.ts': {
    file: {
      contents: `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`,
    },
  },
  'index.html': {
    file: {
      contents: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Generated Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    },
  },
  'src': {
    directory: {
      'main.tsx': {
        file: {
          contents: `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,
        },
      },
      'App.tsx': {
        file: {
          contents: `
import { Card, Title, Text } from '@tremor/react';
export default function Example() {
  return (
    <main className="p-12">
      <Card className="mx-auto max-w-xs">
        <Title>Hello World!</Title>
        <Text>This is a Tremor dashboard running in a WebContainer.</Text>
      </Card>
    </main>
  );
}`,
        },
      },
      'index.css': {
        file: {
          contents: `
@tailwind base;
@tailwind components;
@tailwind utilities;
      `,
        },
      },
    }
  },
  'tailwind.config.cjs': {
    file: {
        contents: `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`
    }
  },
  'postcss.config.cjs': {
    file: {
        contents: `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
    }
  }
};

/**
 * This script is injected into the WebContainer's preview iframe.
 * It overrides the global `fetch` function to proxy requests to the host window
 * via `postMessage` for secure authentication handling.
 */
export const fetchInterceptorScript = `
  const originalFetch = window.fetch;
  const pendingRequests = new Map();

  window.addEventListener('message', (event) => {
    if (event.data.type === 'WC_FETCH_RESPONSE') {
      const { requestId, response, error } = event.data.payload;
      const promise = pendingRequests.get(requestId);
      if (promise) {
        if (error) {
          promise.reject(new Error(error));
        } else {
          promise.resolve(new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          }));
        }
        pendingRequests.delete(requestId);
      }
    }
  });

  window.fetch = (url, options) => {
    return new Promise((resolve, reject) => {
      const requestId = Date.now() + Math.random();
      pendingRequests.set(requestId, { resolve, reject });

      window.parent.postMessage({
        type: 'WC_FETCH_REQUEST',
        payload: {
          requestId,
          url: url.toString(),
          options: {
            method: options?.method,
            headers: options?.headers ? Object.fromEntries(new Headers(options.headers).entries()) : {},
            body: options?.body,
          }
        }
      }, '*');
    });
  };
`; 