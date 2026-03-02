import { useState } from "react";
import { urlBase64ToUint8Array } from "./utils";

const VAPID_PUBLIC_KEY =
  "BGfbF6mIKiTS75LJ2c-Cwa0GcQ6Cy-3fVJKw90xHVBLkXt3OcCDr8H8nQKcSkMwpt7GCWHiZGuTT436UlUU4sR0";

function App() {
  const [status, setStatus] = useState("Idle");

  const subscribe = async () => {
    try {
      setStatus("Registering Service Worker...");
      const register = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      setStatus("Waiting for permission...");
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      setStatus("Sending subscription to Backend...");
      await fetch("http://localhost:5000/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: { "Content-Type": "application/json" },
      });

      setStatus("Subscribed Successfully!");
    } catch (error) {
      console.error(error);
      setStatus("Error: " + error);
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Push Test</h1>
      <p>
        Status: <strong>{status}</strong>
      </p>
      <button
        onClick={subscribe}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Enable Notifications
      </button>
    </div>
  );
}

export default App;
