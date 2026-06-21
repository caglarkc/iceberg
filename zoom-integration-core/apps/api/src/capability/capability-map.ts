export type CapabilityStatus = "possible_now" | "needs_license" | "not_possible" | "escalate";

/** Ay 1 honesty: how much of this feature is real vs mock/simulated in the POC. */
export type CapabilityImplementation = "real" | "mock" | "simulated" | "none";

export interface CapabilityItem {
  feature_key: string;
  title: string;
  description: string;
  status: CapabilityStatus;
  /** Present on all items; `none` for not-yet-implemented / license-blocked features. */
  implementation: CapabilityImplementation;
  notes: string;
}

export const CAPABILITY_MAP: CapabilityItem[] = [
  { feature_key: "meeting_create_rest", title: "Backend meeting create (REST)", description: "S2S OAuth + meeting:write:meeting", status: "possible_now", implementation: "mock", notes: "Mock verified — RealZoomAdapter Faz 2" },
  { feature_key: "meeting_sdk_embed", title: "Meeting SDK Component View embed", description: "CRM slide-over embed", status: "possible_now", implementation: "simulated", notes: "Simulated embed UI in Ay 1; WASM Faz 2" },
  { feature_key: "join_url_share", title: "Join URL storage and sharing", description: "Fastest MVP path", status: "possible_now", implementation: "real", notes: "Implemented" },
  { feature_key: "zak_host_delegation", title: "Host delegation (ZAK token)", description: "Create meeting on behalf of user", status: "possible_now", implementation: "mock", notes: "Documented — not demoed" },
  { feature_key: "meeting_metadata", title: "Meeting metadata and participants", description: "REST API read", status: "possible_now", implementation: "mock", notes: "Mock list/get" },
  { feature_key: "webhook_meeting_lifecycle", title: "meeting.started / meeting.ended webhooks", description: "Idempotent ingest", status: "possible_now", implementation: "mock", notes: "Mock replay supported" },
  { feature_key: "recording_completed", title: "recording.completed webhook", description: "Cloud recording events", status: "possible_now", implementation: "mock", notes: "Mock fixture" },
  { feature_key: "cloud_transcript", title: "Cloud recording transcript fetch", description: "Recording API + settings", status: "possible_now", implementation: "mock", notes: "Mock transcript returned" },
  { feature_key: "ai_companion_transcript", title: "AI Companion transcript (no recording)", description: "Instance UUID path", status: "needs_license", implementation: "none", notes: "Account setting required" },
  { feature_key: "webinar_embed", title: "Webinar embed", description: "Meeting SDK type=5", status: "possible_now", implementation: "simulated", notes: "Same SDK path — simulated in Ay 1" },
  { feature_key: "video_sdk_custom_ui", title: "Custom video UI (Video SDK)", description: "White-label room", status: "needs_license", implementation: "none", notes: "Different product — not selected for CRM" },
  { feature_key: "meeting_sdk_reskin", title: "Full Meeting SDK re-skin", description: "Zoom branding rules", status: "not_possible", implementation: "none", notes: "Limited CSS" },
  { feature_key: "ai_notetaker_bot", title: "AI notetaker bot via Meeting SDK", description: "Bot join policy", status: "not_possible", implementation: "none", notes: "Use RTMS separately" },
  { feature_key: "phone_click_to_call", title: "Zoom Phone click-to-call (web)", description: "Smart Embed + user click", status: "possible_now", implementation: "simulated", notes: "Feasibility UI — embed Faz 2" },
  { feature_key: "phone_uri_scheme", title: "zoomphonecall:// / tel URI", description: "Opens Zoom client", status: "possible_now", implementation: "real", notes: "tel: link in demo UI" },
  { feature_key: "server_outbound_call", title: "Server-side outbound call (no client)", description: "No API exists", status: "not_possible", implementation: "none", notes: "Critical limitation — demo highlight" },
  { feature_key: "call_workflow_webhook", title: "Call ended → workflow trigger", description: "Webhook + Smart Embed", status: "possible_now", implementation: "mock", notes: "Mock phone events" },
  { feature_key: "missed_call_followup", title: "Missed call → external follow-up", description: "Event + 3rd party API", status: "possible_now", implementation: "real", notes: "crm-adapter ready" },
  { feature_key: "call_log_api", title: "Call log / history API", description: "Phone license + scope", status: "needs_license", implementation: "none", notes: "Deferred" },
  { feature_key: "smart_embed_sms", title: "Smart Embed SMS", description: "Phone license", status: "needs_license", implementation: "none", notes: "Deferred" },
  { feature_key: "rtms", title: "Realtime transcript/media (RTMS)", description: "App config + consent", status: "needs_license", implementation: "none", notes: "Separate evaluation" },
  { feature_key: "marketplace_public", title: "Marketplace public app", description: "Security review", status: "needs_license", implementation: "none", notes: "Faz 2+" },
  { feature_key: "phone_desktop_audio", title: "Phone audio without desktop client", description: "Smart Embed dependency", status: "escalate", implementation: "none", notes: "Partner ticket E4" },
  { feature_key: "isv_custcreate", title: "ISV custCreate user provisioning", description: "Partner-only scope", status: "escalate", implementation: "none", notes: "Partner ticket E6" },
  { feature_key: "partner_rate_limits", title: "Partner rate limits / private API", description: "Partner advantage", status: "escalate", implementation: "none", notes: "Partner ticket E10" },
  { feature_key: "ivr_autodialer", title: "IVR / auto-dialer automation", description: "Enterprise", status: "escalate", implementation: "none", notes: "Partner ticket" },
  { feature_key: "crm_timeline_event", title: "Generic CRM timeline logging", description: "crm-adapter TimelineEvent", status: "possible_now", implementation: "real", notes: "Implemented" }
];

export function filterCapabilities(status?: CapabilityStatus): CapabilityItem[] {
  if (!status) return CAPABILITY_MAP;
  return CAPABILITY_MAP.filter((item) => item.status === status);
}

export function filterByImplementation(implementation?: CapabilityImplementation): CapabilityItem[] {
  if (!implementation) return CAPABILITY_MAP;
  return CAPABILITY_MAP.filter((item) => item.implementation === implementation);
}
