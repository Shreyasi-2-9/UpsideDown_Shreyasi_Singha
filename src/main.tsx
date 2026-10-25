import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register offline App Shell Service Worker in production
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Auto check for updates on navigation
        reg.onupdatefound = () => {
          const installingWorker = reg.installing
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New content is available; will be used on next refresh
                console.info("[SW] New version available")
              }
            }
          }
        }
      })
      .catch((err) => {
        console.warn("[SW] Registration failed:", err)
      })
  })
}
