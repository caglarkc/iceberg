"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  EmbedSlideOver,
  MeetingCard,
  ScheduleMeetingModal,
  TimelinePanel,
  type MeetingView,
  type TimelineEventView
} from "@/components/crm-ui";

interface ContactDetail {
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    type: string;
  };
  properties: Array<{ id: string; address_line1: string; postcode: string | null; city: string | null }>;
  appointments: Array<{ id: string; type: string; scheduled_at: string; property_id: string | null }>;
  timeline: TimelineEventView[];
  meetings: MeetingView[];
}

export default function ContactDetailClient({ contactId }: { contactId: string }) {
  const [data, setData] = useState<ContactDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleContext, setScheduleContext] = useState<{
    propertyId?: string;
    appointmentId?: string;
    defaultStart?: string;
    defaultTopic?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedTopic, setEmbedTopic] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/contacts/${contactId}`);
    if (!res.ok) {
      setError("Failed to load contact");
      return;
    }
    setData(await res.json());
  }, [contactId]);

  useEffect(() => {
    load();
  }, [load]);

  async function createMeeting(form: { startTime: string; duration: number; topic: string }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contacts/${contactId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: scheduleContext.propertyId,
          appointment_id: scheduleContext.appointmentId,
          start_time: form.startTime,
          duration: form.duration,
          topic: form.topic,
          type: "scheduled"
        })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Failed to create meeting");
      setScheduleOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function startInstant() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contacts/${contactId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "instant", start_time: new Date().toISOString() })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Failed to start meeting");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function joinEmbed(meeting: MeetingView) {
    const res = await fetch(`/api/meetings/${meeting.id}/embed-signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: 1 })
    });
    if (!res.ok) {
      window.open(meeting.join_url, "_blank");
      return;
    }
    setEmbedTopic(meeting.topic);
    setEmbedOpen(true);
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Loading contact…</p>;
  }

  const valuationAppt = data.appointments.find((a) => a.type === "valuation");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div>
          <Link href="/" className="text-xs text-brand-600 hover:underline">
            ← Contacts
          </Link>
          <h1 className="mt-2 text-2xl font-bold">
            {data.contact.first_name} {data.contact.last_name}
          </h1>
          <p className="text-sm text-slate-500">
            {data.contact.email} · {data.contact.phone}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">Properties</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.properties.map((p) => (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-300"
              >
                <p className="font-medium">{p.address_line1}</p>
                <p className="text-xs text-slate-500">
                  {p.city}, {p.postcode}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold uppercase text-slate-500">Meetings</h2>
            <button
              onClick={() => {
                setScheduleContext({
                  propertyId: data.properties[0]?.id,
                  appointmentId: valuationAppt?.id,
                  defaultStart: valuationAppt?.scheduled_at?.slice(0, 16),
                  defaultTopic: undefined
                });
                setScheduleOpen(true);
              }}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
            >
              Schedule Zoom Meeting
            </button>
            <button
              onClick={startInstant}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
            >
              Start Instant Meeting
            </button>
          </div>
          <div className="space-y-3">
            {data.meetings.length === 0 ? (
              <p className="text-sm text-slate-500">No meetings yet.</p>
            ) : (
              data.meetings.map((m) => (
                <MeetingCard key={m.id} meeting={m} onJoinEmbed={() => joinEmbed(m)} onRefresh={load} />
              ))
            )}
          </div>
        </section>
      </div>

      <div>
        <TimelinePanel events={data.timeline} />
      </div>

      <ScheduleMeetingModal
        open={scheduleOpen}
        defaultStartTime={scheduleContext.defaultStart}
        onClose={() => setScheduleOpen(false)}
        onSubmit={createMeeting}
        loading={loading}
      />
      <EmbedSlideOver open={embedOpen} topic={embedTopic} onClose={() => setEmbedOpen(false)} />
    </div>
  );
}
