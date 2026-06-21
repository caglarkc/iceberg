import type { ZoomProvider } from "../providers/zoom-provider.interface.js";
import type { ZoomStore } from "../store.js";

export async function createMeeting(provider: ZoomProvider, store: ZoomStore, input: Parameters<ZoomProvider["createMeeting"]>[0]) {
  const meeting = await provider.createMeeting(input);
  return store.saveMeeting(meeting);
}

export async function getMeeting(provider: ZoomProvider, store: ZoomStore, id: string) {
  const cached = store.getMeeting(id);
  if (cached) return cached;
  const meeting = await provider.getMeeting(id);
  return store.saveMeeting(meeting);
}

export async function listMeetings(provider: ZoomProvider, store: ZoomStore) {
  const meetings = await provider.listMeetings();
  meetings.forEach((m) => store.saveMeeting(m));
  return store.listMeetings();
}
