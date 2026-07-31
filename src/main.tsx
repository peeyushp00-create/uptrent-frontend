import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import './i18n';
import "./index.css";
import "./socialspark/index.css";
import { ThemeProvider } from "./contexts/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
