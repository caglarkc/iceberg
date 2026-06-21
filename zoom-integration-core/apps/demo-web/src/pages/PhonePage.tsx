import { useEffect, useState } from "react";
import { zoomApi, type PhoneEvent } from "../api";

export default function PhonePage() {
  const [caps, setCaps] = useState<{ licensed: boolean; notes: string } | null>(null);
  const [events, setEvents] = useState<PhoneEvent[]>([]);
  const [number, setNumber] = useState("+449876543210");

  useEffect(() => {
    void zoomApi.phoneCapabilities().then(setCaps);
    void zoomApi.phoneEvents().then((data) => setEvents([...data.webhook_events, ...data.mock_events]));
  }, []);

  return (
    <div>
      <h2>Zoom Phone (Feasibility)</h2>
      {!caps?.licensed && (
        <div className="card">
          <span className="badge warn">Needs License</span>
          <p>{caps?.notes}</p>
          <p>
            <strong>Server-side outbound call: Not Possible</strong> — no API exists. Smart Embed + user click is the supported path (Faz 2).
          </p>
        </div>
      )}
      <div className="card">
        <h3>Click-to-call POC (simulated)</h3>
        <input value={number} onChange={(e) => setNumber(e.target.value)} />
        <button
          onClick={() => {
            window.open(`tel:${number}`, "_blank");
          }}
        >
          tel: link (opens client)
        </button>
        <p>Smart Embed iframe deferred — mock event log below.</p>
      </div>
      <table className="table card">
        <thead>
          <tr>
            <th>Event</th>
            <th>From</th>
            <th>To</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td>{e.event_type}</td>
              <td>{e.from_number ?? "—"}</td>
              <td>{e.to_number ?? "—"}</td>
              <td>{e.duration_seconds ?? "—"}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
