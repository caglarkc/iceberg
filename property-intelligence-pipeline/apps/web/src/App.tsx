import { useEffect, useState } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL ?? "";

type InboxItem = {
  id: string;
  title?: string;
  recorded_at: string;
  status: string;
  provider_recording_id: string;
  match?: {
    confidence: number;
    queue: string;
    reason_chips: string[];
    candidates_json: Array<{ property_id: string; confidence: number; reason_chips: string[] }>;
  };
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

function Banner() {
  return (
    <div className="border-b border-amber-500/40 bg-amber-950/40 px-4 py-2 text-sm text-amber-100">
      Mock-first POC — Plaud adapter swappable; human review required before CRM apply.
    </div>
  );
}

function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: InboxItem[] }>("/api/plaud/inbox")
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false));
  }, []);

  async function seedMock() {
    await api("/api/plaud/ingest/mock", { method: "POST" });
    const data = await api<{ items: InboxItem[] }>("/api/plaud/inbox");
    setItems(data.items);
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Plaud Inbox</h1>
          <p className="text-slate-400">Valuation transcripts awaiting match / review</p>
        </div>
        <button
          type="button"
          onClick={seedMock}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500"
        >
          Load mock fixtures
        </button>
      </div>
      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link to={`/recordings/${item.id}`} className="text-lg font-medium text-sky-300 hover:underline">
                    {item.title ?? item.provider_recording_id}
                  </Link>
                  <p className="text-sm text-slate-400">{new Date(item.recorded_at).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-wide">{item.status}</span>
              </div>
              {item.match && (
                <p className="mt-2 text-sm text-slate-300">
                  Match: {(item.match.confidence * 100).toFixed(0)}% · {item.match.queue}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RecordingPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState<{
    recording: InboxItem;
    transcript?: { text: string; summary?: string };
    match?: InboxItem["match"] & { status: string };
    extraction?: { id: string; fields_json: Record<string, { value: unknown; confidence: number; evidence_quote: string | null; status: string }> };
  } | null>(null);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    api<typeof detail>(`/api/plaud/recordings/${id}`).then(setDetail);
  }, [id]);

  if (!detail) return <p className="p-6 text-slate-400">Loading recording…</p>;

  async function runMatch() {
    const match = await api<InboxItem["match"]>(`/api/plaud/recordings/${id}/match`, { method: "POST" });
    setDetail((d) => (d ? { ...d, match: match as never } : d));
  }

  async function confirm(propertyId: string) {
    await api(`/api/plaud/recordings/${id}/match/confirm`, {
      method: "POST",
      body: JSON.stringify({ property_id: propertyId })
    });
    const refreshed = await api<typeof detail>(`/api/plaud/recordings/${id}`);
    setDetail(refreshed);
  }

  async function runExtract() {
    if (!consent) {
      setMessage("Recording consent required before extraction.");
      return;
    }
    await api(`/api/plaud/recordings/${id}/extract`, { method: "POST" });
    const refreshed = await api<typeof detail>(`/api/plaud/recordings/${id}`);
    setDetail(refreshed);
    setMessage("Extraction complete — review fields below.");
  }

  async function approveField(key: string) {
    if (!detail?.extraction) return;
    await api(`/api/plaud/review/${detail.extraction.id}/decide`, {
      method: "POST",
      body: JSON.stringify({ decisions: { [key]: "approved" } })
    });
    const refreshed = await api<typeof detail>(`/api/plaud/recordings/${id}`);
    setDetail(refreshed);
  }

  async function apply() {
    await api(`/api/plaud/recordings/${id}/apply`, { method: "POST" });
    setMessage("Approved fields applied to proposal draft + timeline event.");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="mb-2 text-lg font-semibold">Transcript</h2>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-sm text-slate-300">{detail.transcript?.text}</pre>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <h2 className="mb-2 text-lg font-semibold">Entity match</h2>
          <button type="button" onClick={runMatch} className="mb-3 rounded bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600">
            Run match
          </button>
          {detail.match?.candidates_json?.map((c) => (
            <div key={c.property_id} className="mb-2 rounded-lg border border-slate-700 p-3">
              <div className="flex justify-between text-sm">
                <span>{c.property_id}</span>
                <span>{(c.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {c.reason_chips.map((chip) => (
                  <span key={chip} className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                    {chip}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => confirm(c.property_id)}
                className="mt-2 text-xs text-sky-400 hover:underline"
              >
                Confirm match
              </button>
            </div>
          ))}
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
          This valuation was recorded with vendor consent for proposal processing only.
        </label>

        <button type="button" onClick={runExtract} className="rounded-lg bg-violet-600 px-4 py-2 text-sm hover:bg-violet-500">
          Run AI extraction
        </button>

        {detail.extraction && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h2 className="mb-2 text-lg font-semibold">Review extraction</h2>
            {Object.entries(detail.extraction.fields_json).map(([key, field]) => (
              <div
                key={key}
                className={`mb-3 rounded border p-3 text-sm ${field.confidence < 0.7 ? "border-rose-500/50" : "border-slate-700"}`}
              >
                <div className="font-medium">{key}</div>
                <p className="text-slate-300">{JSON.stringify(field.value)}</p>
                <p className="text-xs italic text-slate-500">{field.evidence_quote}</p>
                <button type="button" onClick={() => approveField(key)} className="mt-1 text-xs text-emerald-400">
                  Approve
                </button>
              </div>
            ))}
            <button type="button" onClick={apply} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-500">
              Apply to proposal
            </button>
          </div>
        )}
        {message && <p className="text-sm text-sky-300">{message}</p>}
      </section>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Banner />
      <nav className="border-b border-slate-800 px-6 py-3 text-sm">
        <Link to="/" className="text-sky-400 hover:underline">
          Inbox
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<InboxPage />} />
        <Route path="/recordings/:id" element={<RecordingPage />} />
      </Routes>
    </>
  );
}
