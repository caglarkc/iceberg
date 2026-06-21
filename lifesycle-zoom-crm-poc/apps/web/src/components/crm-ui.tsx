"use client";

import { Calendar, Clock, Copy, Video } from "lucide-react";
import { useState } from "react";

export interface TimelineEventView {
  id: string;
  event_type: string;
  title: string;
  description?: string | null;
  occurred_at: string;
  metadata?: Record<string, unknown>;
}

const ICONS: Record<string, string> = {
  "meeting.scheduled": "📅",
  "meeting.started": "▶️",
  "meeting.ended": "✅",
  "meeting.cancelled": "❌",
  "follow_up.created": "📝",
  "appointment.scheduled": "🏠"
};

export function TimelinePanel({ events }: { events: TimelineEventView[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        No timeline activity yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Timeline</h3>
      <ol className="space-y-4">
        {events.map((event) => (
          <li key={event.id} className="flex gap-3 border-l-2 border-slate-100 pl-3">
            <span className="text-lg leading-none">{ICONS[event.event_type] ?? "•"}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{event.title}</p>
              {event.description && <p className="text-xs text-slate-500">{event.description}</p>}
              <p className="mt-1 text-xs text-slate-400">
                {new Date(event.occurred_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export interface MeetingView {
  id: string;
  topic: string;
  status: string;
  start_time?: string | null;
  join_url: string;
  password?: string | null;
  zoom_meeting_id: string;
  actual_duration_min?: number | null;
  recording_status?: string | null;
  transcript_status?: string | null;
}

export function MeetingCard({
  meeting,
  onJoinEmbed,
  onRefresh
}: {
  meeting: MeetingView;
  onJoinEmbed?: () => void;
  onRefresh?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const statusColor =
    meeting.status === "started"
      ? "bg-green-100 text-green-700"
      : meeting.status === "ended"
        ? "bg-slate-100 text-slate-600"
        : "bg-blue-100 text-blue-700";

  async function copyLink() {
    await navigator.clipboard.writeText(meeting.join_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{meeting.topic}</p>
          <p className="text-xs text-slate-500">ID: {meeting.zoom_meeting_id}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusColor}`}>{meeting.status}</span>
      </div>
      {meeting.start_time && (
        <p className="mb-2 flex items-center gap-1 text-xs text-slate-600">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(meeting.start_time).toLocaleString("en-GB", { timeZone: "Europe/London" })}
        </p>
      )}
      {meeting.actual_duration_min != null && (
        <p className="mb-2 flex items-center gap-1 text-xs text-slate-600">
          <Clock className="h-3.5 w-3.5" />
          Duration: {meeting.actual_duration_min} min
        </p>
      )}
      {meeting.transcript_status === "pending" && (
        <span className="mb-2 inline-block rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
          Transcript processing
        </span>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {onJoinEmbed && meeting.status !== "ended" && meeting.status !== "cancelled" && (
          <button
            onClick={onJoinEmbed}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
          >
            <Video className="h-3.5 w-3.5" />
            Join in Lifesycle
          </button>
        )}
        <button
          onClick={() => window.open(meeting.join_url, "_blank")}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
        >
          Join in Zoom
        </button>
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied!" : "Copy Link"}
        </button>
        {onRefresh && (
          <button onClick={onRefresh} className="text-xs text-slate-500 hover:text-brand-600">
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

export function EmbedSlideOver({
  open,
  topic,
  onClose
}: {
  open: boolean;
  topic: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-xs uppercase text-slate-500">Simulated Meeting SDK</p>
            <p className="font-semibold">{topic}</p>
          </div>
          <button onClick={onClose} className="rounded-lg px-3 py-1 text-sm hover:bg-slate-100">
            End & return
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-900 p-6 text-white">
          <div className="flex h-40 w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
            <Video className="h-12 w-12 text-slate-500" />
          </div>
          <p className="text-center text-sm text-slate-300">
            Mock embed panel — real Meeting SDK WASM deferred to production. Signature validated via mock service.
          </p>
          <button
            onClick={() => window.open("https://zoom.us", "_blank")}
            className="text-xs text-brand-300 underline"
          >
            Open in Zoom (fallback)
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScheduleMeetingModal({
  open,
  defaultStartTime,
  defaultTopic,
  onClose,
  onSubmit,
  loading
}: {
  open: boolean;
  defaultStartTime?: string;
  defaultTopic?: string;
  onClose: () => void;
  onSubmit: (data: { startTime: string; duration: number; topic: string }) => void;
  loading?: boolean;
}) {
  const [startTime, setStartTime] = useState(defaultStartTime ?? "");
  const [duration, setDuration] = useState(60);
  const [topic, setTopic] = useState(defaultTopic ?? "");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Schedule Zoom Meeting</h2>
        <div className="space-y-3">
          <label className="block text-sm">
            Topic
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Start time
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Duration (minutes)
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={90}>90</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm hover:bg-slate-100">
            Cancel
          </button>
          <button
            disabled={loading || !startTime || !topic}
            onClick={() =>
              onSubmit({
                startTime: new Date(startTime).toISOString(),
                duration,
                topic
              })
            }
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Meeting"}
          </button>
        </div>
      </div>
    </div>
  );
}
