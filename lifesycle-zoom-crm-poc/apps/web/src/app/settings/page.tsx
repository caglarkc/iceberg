export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const config = {
    zoomMode: process.env.ZOOM_MODE ?? "mock",
    zoomServiceUrl: process.env.ZOOM_SERVICE_URL ?? "(in-process mock adapter)",
    featureEmbed: process.env.FEATURE_EMBED_SDK ?? "true",
    featureFollowUp: process.env.FEATURE_FOLLOW_UP_TASKS ?? "false"
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">Settings</h1>
      <p className="mb-6 text-sm text-slate-500">Demo environment configuration (read-only)</p>
      <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="flex justify-between px-4 py-3 text-sm">
            <dt className="font-medium capitalize text-slate-600">{key.replace(/([A-Z])/g, " $1")}</dt>
            <dd className="font-mono text-xs text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
