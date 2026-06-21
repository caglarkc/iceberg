import { useEffect, useState } from "react";
import { zoomApi, type WebhookEvent } from "../api";

export default function EventsPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);

  async function refresh() {
    setEvents(await zoomApi.events());
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div>
      <h2>Webhook Events</h2>
      <div className="card">
        <button onClick={() => void zoomApi.replayWebhook("meetingEnded").then(refresh)}>Replay meeting.ended</button>{" "}
        <button onClick={() => void zoomApi.replayWebhook("recordingCompleted").then(refresh)}>Replay recording.completed</button>{" "}
        <button onClick={() => void zoomApi.replayWebhook("phoneCallCompleted").then(refresh)}>Replay phone call</button>
      </div>
      <table className="table card">
        <thead>
          <tr>
            <th>Type</th>
            <th>Time</th>
            <th>Processed</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td>{e.event_type}</td>
              <td>{new Date(e.event_ts).toLocaleString()}</td>
              <td>{e.processed ? "yes" : "no"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
