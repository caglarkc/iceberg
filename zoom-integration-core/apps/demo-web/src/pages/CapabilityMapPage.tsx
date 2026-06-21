import { useEffect, useState } from "react";
import { zoomApi, type CapabilityItem } from "../api";

const statusLabel: Record<string, string> = {
  possible_now: "Possible Now",
  needs_license: "Needs License",
  not_possible: "Not Possible",
  escalate: "Escalate"
};

const implementationLabel: Record<string, string> = {
  real: "Real",
  mock: "Mock",
  simulated: "Simulated",
  none: "—"
};

export default function CapabilityMapPage() {
  const [items, setItems] = useState<CapabilityItem[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    void zoomApi.capabilityMap(filter || undefined).then((d) => setItems(d.items));
  }, [filter]);

  return (
    <div>
      <h2>Capability Map ({items.length} items)</h2>
      <div className="card">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="possible_now">Possible Now</option>
          <option value="needs_license">Needs License</option>
          <option value="not_possible">Not Possible</option>
          <option value="escalate">Escalate</option>
        </select>
      </div>
      {items.map((item) => (
        <div className="card" key={item.feature_key}>
          <span className={`badge ${badgeClass(item.status)}`}>{statusLabel[item.status] ?? item.status}</span>
          {item.implementation && item.implementation !== "none" ? (
            <span className="badge warn" style={{ marginLeft: "0.5rem" }}>
              {implementationLabel[item.implementation] ?? item.implementation}
            </span>
          ) : null}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <p style={{ color: "#8aa0c8" }}>{item.notes}</p>
        </div>
      ))}
    </div>
  );
}

function badgeClass(status: string) {
  if (status === "possible_now") return "ok";
  if (status === "needs_license") return "warn";
  if (status === "not_possible") return "no";
  return "esc";
}
