import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

if (typeof window !== "undefined") {
  const root = document.querySelector("#root");

  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <p>frontend</p>
      </React.StrictMode>,
    );
  }
}
