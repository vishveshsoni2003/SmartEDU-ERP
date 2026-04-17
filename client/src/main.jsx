import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

// NOTE: Google Maps (LoadScript) has been moved to the CreateRoute admin component
// so it only loads on that specific page, not globally. This prevents the
// "google is not defined" crash when VITE_GOOGLE_MAPS_KEY is unset.

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" />
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
