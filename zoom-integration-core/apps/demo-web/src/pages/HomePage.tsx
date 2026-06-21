import { useEffect, useState } from "react";
import { zoomApi } from "../api";

export default function HomePage() {
  const [health, setHealth] = useState<{ oauth: string; sdk: string; mode: string } | null>(null);
  const [summary, setSummary] = useState({ possible: 0, needs: 0, not: 0, escalate: 0 });

  useEffect(() => {
    void zoomApi.health().then(setHealth);
    void zoomApi.capabilityMap().then((data) => {
      setSummary({
        possible: data.items.filter((i) => i.status === "possible_now").length,
        needs: data.items.filter((i) => i.status === "needs_license").length,
        not: data.items.filter((i) => i.status === "not_possible").length,
        escalate: data.items.filter((i) => i.status === "escalate").length
      });
    });
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Iceberg Zoom Partner — Capability Lab (Ay 1 mock mode)</p>
      <div className="grid">
        <div className="card">
          <h3>OAuth</h3>
          <span className={`badge ${health?.oauth === "ok" ? "ok" : "warn"}`}>{health?.oauth ?? "…"}</span>
        </div>
        <div className="card">
          <h3>SDK</h3>
          <span className="badge ok">{health?.sdk ?? "…"}</span>
        </div>
        <div className="card">
          <h3>Mode</h3>
          <span className="badge warn">{health?.mode ?? "mock"}</span>
        </div>
      </div>
      <div className="grid" style={{ marginTop: "1rem" }}>
        <div className="card"><h3>Possible Now</h3><p>{summary.possible}</p></div>
        <div className="card"><h3>Needs License</h3><p>{summary.needs}</p></div>
        <div className="card"><h3>Not Possible</h3><p>{summary.not}</p></div>
        <div className="card"><h3>Escalate</h3><p>{summary.escalate}</p></div>
      </div>
    </div>
  );
}
