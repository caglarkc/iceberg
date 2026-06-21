import { useEffect, useState } from "react";
import { zoomApi } from "../api";

export default function DiagnosticsPage() {
  const [health, setHealth] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    void zoomApi.health().then(setHealth);
  }, []);

  return (
    <div>
      <h2>Diagnostics</h2>
      <div className="card">
        <pre>{JSON.stringify(health, null, 2)}</pre>
      </div>
      <div className="card">
        <h3>Known limitations (Ay 1)</h3>
        <ul>
          <li>ZOOM_MODE=mock — no real Zoom API calls</li>
          <li>Meeting SDK WASM embed deferred to Faz 2</li>
          <li>Zoom Phone Smart Embed deferred — feasibility + mock events only</li>
          <li>Webhook HTTPS/ngrok setup deferred to Faz 2</li>
          <li>start_url never exposed to non-host API consumers</li>
        </ul>
      </div>
    </div>
  );
}
