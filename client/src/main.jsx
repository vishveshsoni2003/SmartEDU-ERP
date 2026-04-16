import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";
import { LoadScript } from "@react-google-maps/api";

ReactDOM.createRoot(document.getElementById("root")).render(
  <LoadScript
    googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
    libraries={["places"]}
  >

    <React.StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          <App />
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  </LoadScript>
);
