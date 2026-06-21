import { useState } from "react";
import { zoomApi, type Meeting } from "../api";

export default function MeetingPage() {
  const [topic, setTopic] = useState("Valuation Demo Call");
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [signature, setSignature] = useState<{ signature: string; sdkKey: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createMeeting() {
    setLoading(true);
    setError(null);
    try {
      const created = await zoomApi.createMeeting({ topic });
      setMeeting(created);
      const sig = await zoomApi.signature({ meetingNumber: String(created.zoom_meeting_id), role: 0 });
      setSignature(sig);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Meeting</h2>
      <div className="card">
        <label>
          Topic{" "}
          <input value={topic} onChange={(e) => setTopic(e.target.value)} />
        </label>{" "}
        <button onClick={() => void createMeeting()} disabled={loading}>
          {loading ? "Creating…" : "Create meeting (mock REST)"}
        </button>
        {error && <p style={{ color: "#ff8f8f" }}>{error}</p>}
      </div>

      {meeting && (
        <div className="card">
          <h3>{meeting.topic}</h3>
          <p>ID: {meeting.zoom_meeting_id}</p>
          <p>
            Join URL:{" "}
            <a href={meeting.join_url} target="_blank" rel="noreferrer">
              {meeting.join_url}
            </a>
          </p>
          <p>Status: {meeting.status}</p>
        </div>
      )}

      <div className="card">
        <h3>Simulated Meeting SDK Embed</h3>
        <div className="embed-panel">
          {signature ? (
            <div>
              <p>Component View placeholder — real @zoom/meetingsdk WASM deferred to Faz 2</p>
              <p>sdkKey: {signature.sdkKey}</p>
              <p style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>signature: {signature.signature.slice(0, 48)}…</p>
            </div>
          ) : (
            <p>Create a meeting to generate backend signature</p>
          )}
        </div>
      </div>
    </div>
  );
}
