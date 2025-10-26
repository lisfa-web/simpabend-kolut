import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import DevErrorBoundary from "./components/DevErrorBoundary";
import "./index.css";

console.log("[DEBUG] Bootstrapping app");
createRoot(document.getElementById("root")!).render(
  <DevErrorBoundary>
    <App />
  </DevErrorBoundary>
);
