import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Brain, CheckCircle2, ClipboardList, Database, FileText, Gauge, ShieldCheck } from "lucide-react";
import type { AIReviewRecord, EvidenceEntry, Mission, ReadinessScore, Submission, UserRole } from "@iceberg/shared";
import "./styles.css";

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";
const roles: UserRole[] = ["admin", "intern", "mentor", "leadership"];

type Summary = {
  totalMissions: number;
  submittedThisWeek: number;
  blockedCount: number;
  avgReadiness: number;
};

function App() {
  const [role, setRole] = useState<UserRole>("admin");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string>("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [review, setReview] = useState<AIReviewRecord | null>(null);
  const [handover, setHandover] = useState<string>("");
  const [message, setMessage] = useState("Ready");

  const selectedMission = useMemo(
    () => missions.find((mission) => mission.id === selectedMissionId) ?? missions[0],
    [missions, selectedMissionId]
  );

  async function refresh() {
    const missionList = await api<Mission[]>("/api/missions", role);
    setMissions(missionList);
    if (!selectedMissionId && missionList[0]) setSelectedMissionId(missionList[0].id);
    if (role === "admin" || role === "leadership") {
      setSummary(await api<Summary>("/api/dashboard/summary", role));
    }
    const mission = missionList.find((item) => item.id === selectedMissionId) ?? missionList[0];
    if (mission) setReadiness(await api<ReadinessScore>(`/api/missions/${mission.id}/readiness`, role));
  }

  useEffect(() => {
    refresh().catch((error) => setMessage(error.message));
  }, [role, selectedMissionId]);

  async function generateMission() {
    const generated = await api<{ draft: Mission }>("/api/missions/generate", "admin", {
      method: "POST",
      body: {
        idea: "Plaud transcript CRM integration for property valuation workflows with evidence, review and handover controls",
        categoryHint: "Property Intelligence"
      }
    });
    const created = await api<Mission>("/api/missions", "admin", {
      method: "POST",
      body: { ...generated.draft, status: "active", aiGenerated: true }
    });
    setSelectedMissionId(created.id);
    setMessage("AI mission draft generated and saved for admin review.");
    await refresh();
  }

  async function addEvidence() {
    if (!selectedMission) return;
    await api<EvidenceEntry>(`/api/missions/${selectedMission.id}/evidence`, "intern", {
      method: "POST",
      body: {
        claim: "Mock-first delivery keeps tests and CI independent from live provider credentials.",
        sourceType: "document",
        sourceTitle: "Shared Plan Constraints",
        reliability: "high",
        notes: "AI outputs stay in human review queue."
      }
    });
    setMessage("Evidence added with reliability label.");
    await refresh();
  }

  async function createSubmission() {
    if (!selectedMission) return;
    const created = await api<Submission>(`/api/missions/${selectedMission.id}/submissions`, "intern", {
      method: "POST",
      body: {
        repoUrl: "https://github.com/iceberg/iceberg-x-intelligence-poc",
        demoUrl: "http://localhost:5173",
        notes: "Demo flow completed with mock LLM and human review gate.",
        hasReadme: true,
        deliverableChecklist: selectedMission.expectedDeliverables.map((name, index) => ({ name, completed: index < 4 }))
      }
    });
    const submitted = await api<{ submission: Submission; warning?: string }>(`/api/submissions/${created.id}/submit`, "intern", {
      method: "POST"
    });
    setSubmission(submitted.submission);
    setMessage(submitted.warning ?? "Submission sent to mentor queue.");
    await refresh();
  }

  async function generateReview() {
    const target = submission ?? (await firstSubmission());
    if (!target) return;
    await api<Submission>(`/api/submissions/${target.id}/status`, "mentor", {
      method: "PATCH",
      body: { status: "under_review", mentorFeedback: "AI review requested." }
    });
    const draft = await api<AIReviewRecord>(`/api/submissions/${target.id}/ai-review`, "mentor", { method: "POST" });
    const edited = await api<AIReviewRecord>(`/api/ai-reviews/${draft.id}`, "mentor", {
      method: "PATCH",
      body: { humanReviewStatus: "edited", suggestedFeedback: `${draft.suggestedFeedback} Mentor approved for demo.` }
    });
    await api<AIReviewRecord>(`/api/ai-reviews/${draft.id}/publish`, "mentor", { method: "POST" });
    setReview(edited);
    setMessage("AI review generated, mentor-edited, and published.");
    await refresh();
  }

  async function generateHandover() {
    if (!selectedMission) return;
    const result = await api<{ contentMarkdown: string }>(`/api/missions/${selectedMission.id}/handover/generate`, "mentor", {
      method: "POST"
    });
    setHandover(result.contentMarkdown);
    setMessage("Handover markdown generated.");
  }

  async function firstSubmission(): Promise<Submission | null> {
    const submissions = await api<Submission[]>("/api/submissions", "mentor");
    return submissions[0] ?? null;
  }

  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow">M1 Proof of Concept</p>
          <h1>Iceberg X Intelligence Layer</h1>
        </div>
        <label>
          Role
          <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="summary">
        <Metric icon={<ClipboardList />} label="Missions" value={summary?.totalMissions ?? missions.length} />
        <Metric icon={<CheckCircle2 />} label="Submitted" value={summary?.submittedThisWeek ?? 0} />
        <Metric icon={<Gauge />} label="Avg readiness" value={`${summary?.avgReadiness ?? readiness?.totalScore ?? 0}%`} />
        <Metric icon={<ShieldCheck />} label="AI governance" value="human-gated" />
      </section>

      <section className="workspace">
        <aside className="mission-list">
          <h2>Missions</h2>
          {missions.map((mission) => (
            <button
              className={mission.id === selectedMission?.id ? "mission active" : "mission"}
              key={mission.id}
              onClick={() => setSelectedMissionId(mission.id)}
            >
              <strong>{mission.title}</strong>
              <span>{mission.category} · difficulty {mission.difficultyLevel}</span>
            </button>
          ))}
        </aside>

        <section className="detail">
          <div className="panel hero-panel">
            <div>
              <p className="eyebrow">Current mission</p>
              <h2>{selectedMission?.title ?? "No mission selected"}</h2>
              <p>{selectedMission?.problemStatement}</p>
            </div>
            <div className={`score ${readiness?.label === "Handover-ready" ? "ready" : ""}`}>
              <span>{readiness?.totalScore ?? 0}</span>
              <small>{readiness?.label ?? "Not ready"}</small>
            </div>
          </div>

          <div className="actions">
            <Action icon={<Brain />} title="AI Mission Generator" text="Generate structured brief" onClick={generateMission} />
            <Action icon={<Database />} title="Evidence Vault" text="Add sourced claim" onClick={addEvidence} />
            <Action icon={<ClipboardList />} title="Submission Tracker" text="Submit checklist" onClick={createSubmission} />
            <Action icon={<ShieldCheck />} title="AI Review" text="Mentor-gated review" onClick={generateReview} />
            <Action icon={<FileText />} title="Handover" text="Generate markdown" onClick={generateHandover} />
          </div>

          <div className="panel">
            <h3>Activity</h3>
            <p>{message}</p>
            {review ? <p>Published review: {review.suggestedFeedback}</p> : null}
            {handover ? <pre>{handover.slice(0, 1200)}</pre> : null}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric(props: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="metric">
      {props.icon}
      <span>{props.label}</span>
      <strong>{props.value}</strong>
    </div>
  );
}

function Action(props: { icon: React.ReactNode; title: string; text: string; onClick: () => void | Promise<void> }) {
  return (
    <button className="action" onClick={() => Promise.resolve(props.onClick()).catch((error: Error) => console.error(error))}>
      {props.icon}
      <strong>{props.title}</strong>
      <span>{props.text}</span>
    </button>
  );
}

async function api<T>(path: string, role: UserRole, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "x-user-role": role
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

createRoot(document.getElementById("root")!).render(<App />);
