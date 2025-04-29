import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupLightning } from "./lib/lightning";

// Initialize the Lightning SDK
setupLightning().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
