# React + Vite + Ionic + Tailwind + TypeScript
---

## Tech Stack

- React
- Vite
- TypeScript
- Ionic React
- Tailwind CSS

---

## Installation

### 1. Create Project
```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

### 2. Install Ionic
```bash
npm install @ionic/react @ionic/react-router ionicons
```

### 3. Install Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Configuration

### Tailwind (`vite.config.ts`)
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### CSS (`src/index.css`)
```css
@import "tailwindcss" important;
```

### Ionic Setup (`src/main.tsx`)
```tsx
import "./index.css";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

import { setupIonicReact } from "@ionic/react";
setupIonicReact();

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### Example App (`src/App.tsx`)
```tsx
import { IonApp, IonContent } from "@ionic/react";

function App() {
  return (
    <IonApp>
      <IonContent className="ion-padding">
        <h1 className="text-2xl font-bold text-blue-500">
          Hello Ionic + Tailwind 🚀
        </h1>
      </IonContent>
    </IonApp>
  );
}

export default App;
```

---

## Run Dev Server
```bash
npm run dev
```

---

## Project Structure
```text
src/
  App.tsx
  main.tsx
  index.css
```

---

## Notes

- Tailwind works inside Ionic components via `className`
- Ionic uses Shadow DOM but utility classes still apply
- Avoid overcomplicating layout with both Ionic + Tailwind at the same time

---

## Preview
<img width="1920" height="1014" alt="image" src="https://github.com/user-attachments/assets/2dc2d83d-4b36-45e7-becc-f3b28ca7964d" />

