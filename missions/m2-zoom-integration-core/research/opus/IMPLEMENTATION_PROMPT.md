# M2 — Zoom SDK & Phone Integration — Implementation Prompt

> **Referans:** `SHARED_RESEARCH_REPORT_opus.md` §2 (Zoom ekosistemi) — kaynaklar orada.
> **Tarih:** 2026-06-20
> **Hedef:** Partner-level Zoom yetenek haritası + çalışan embed POC + Phone feasibility.

## Bağlam

Iceberg Digital artık resmi Zoom Partner. M2, Zoom SDK/API ile neler yapılabileceğini haritalamak ve **platform-agnostic `zoom-integration-core`** servisini kurmaktır — bu servis M3'ün (Lifesycle CRM) production path'ini besler.

Kritik araştırma sonuçları (SHARED §2):
- Meeting SDK = Zoom UI embed; Video SDK = white-label; REST = backend yönetimi.
- S2S OAuth ile meeting create (`meeting:write:meeting`), SDK JWT ile join (HMAC-SHA256).
- **Zoom Phone'da server-side outbound call API YOK** — sadece URI scheme / Smart Embed; event'ler webhook ile alınabilir.

## Hedef Ürün

1. **zoom-integration-core** mikroservisi: S2S OAuth token yönetimi + SDK JWT signature endpoint + REST meeting CRUD + webhook receiver.
2. **Embedded Meeting POC** (web): demo arayüzünden meeting create → join (Meeting SDK Web Component View).
3. **Zoom Phone Feasibility + click-to-call POC** (Smart Embed) + webhook event listener (call ended → workflow stub).
4. **Product Capability Map** (≥15 fikir, etiketli).

## Kapsam

### In Scope
- Backend: token servisi, signature endpoint, `POST /meetings`, recording/transcript fetch.
- Frontend: Component View embed (dedicated `/meeting` route, izolasyon).
- Phone: Smart Embed click-to-call + webhook event tablosu.
- Capability map + Partner escalation listesi.

### Out of Scope
- Tam Lifesycle entegrasyonu (M3'e devredilir)
- Production-grade ölçekleme/HA
- Server-side outbound call (mümkün değil — escalate)

## Mimari

```mermaid
graph TD
    FE["Demo FE (React/Vite)<br/>/meeting route (izole)"] -->|POST get-signature| CORE["zoom-integration-core (Node/Express)"]
    FE -->|Smart Embed iframe| ZP["Zoom Phone Smart Embed"]
    CORE -->|S2S OAuth token| ZOAUTH["zoom.us/oauth/token"]
    CORE -->|REST create/get| ZAPI["api.zoom.us/v2"]
    ZAPI -->|webhook| CORE
    CORE --> DB["meetings, recordings, phone_events"]
    FE -->|join(signature)| MSDK["@zoom/meetingsdk (WASM)"]
```

## Tech Stack
- **Backend:** Node.js/Express + TypeScript; `jsrsasign` (SDK JWT), `axios`.
- **Frontend:** React + Vite; `@zoom/meetingsdk` Component View.
- **DB:** PostgreSQL (meetings, recordings, phone_events).
- **Gerekçe:** Resmi sample'lar Node tabanlı (SHARED §2.6), doğrudan fork'lanabilir.

## Data Model
```
ZoomMeeting(id, zoomMeetingId, topic, type, startTime, joinUrl, hostId, status, createdAt)
ZoomRecording(id, meetingUuid, fileType, downloadUrl, transcriptText?, fetchedAt)
PhoneEvent(id, eventType, fromNumber, toNumber, callId, occurredAt, payload)
```

## API Spesifikasyonu
- `POST /zoom/oauth/token` (internal) — S2S token cache (1 saat, otomatik yenile).
- `POST /zoom/signature` — body `{ meetingNumber, role }` → SDK JWT (HMAC-SHA256).
- `POST /zoom/meetings` — REST `POST /v2/users/me/meetings` proxy.
- `GET /zoom/meetings/:uuid/recordings` — recording_files (TRANSCRIPT filtrele).
- `GET /zoom/meetings/:uuid/transcript` — AI Companion transcript (instance UUID, double-encode).
- `POST /zoom/webhook` — `meeting.ended`, `recording.completed`, `phone.*` event ingest + imza doğrulama.

## UI/UX Spesifikasyonu
- **/meeting (izole route):** "Create Meeting" → topic gir → create → "Join" → Component View embed (resize/popper config).
- **/phone:** Smart Embed iframe + "Call" butonu (`zp-make-call` postMessage) → event log tablosu (ringing/connected/ended).
- **/capability-map:** etiketli özellik listesi (filtreleme).

## Yetenek Matrisi (Capability Map — ≥15, etiketli)

| # | Özellik | Durum |
|---|---------|-------|
| 1 | Backend'den meeting create (REST) | ✅ Possible Now |
| 2 | Web'de Zoom meeting embed (Meeting SDK) | ✅ Possible Now |
| 3 | Başka user adına meeting başlatma (ZAK) | ✅ Possible Now |
| 4 | Cloud recording transcript çekme | ✅ Possible Now (cloud recording gerekli) |
| 5 | AI Companion transcript (recording'siz) | ✅ Possible Now (ayar + instance UUID) |
| 6 | Meeting metadata/participants | ✅ Possible Now |
| 7 | Tam custom video UI | ⚠️ Needs License (Video SDK, Build credits) |
| 8 | Meeting SDK tam re-skin | ❌ Not Possible (sınırlı CSS) |
| 9 | Click-to-call (web) | ✅ Possible Now (Smart Embed) |
| 10 | URI ile arama başlatma | ✅ Possible Now (Zoom client gerekli) |
| 11 | Server-side outbound call (client'sız) | ❌ Not Possible → Escalate |
| 12 | Call ended → workflow tetikleme | ✅ Possible Now (webhook/Smart Embed event) |
| 13 | Missed call → WhatsApp follow-up | ✅ Possible Now (event + 3rd party) |
| 14 | SMS gönderme (Smart Embed) | ✅ Possible Now (`zp-input-sms`) |
| 15 | Call recording event | ✅ Possible Now (event) |
| 16 | Webinar embed | ✅ Possible Now (Meeting SDK) |
| 17 | Meeting kaydını CRM record'a loglama | ✅ Possible Now (M3 ile) |

## GitHub'dan Kullanılacak Referanslar
1. **zoom/meetingsdk-auth-endpoint-sample** — signature endpoint, doğrudan fork.
2. **zoom/meetingsdk-react-sample** — React embed iskeleti.
3. **zoom/meetingsdk-web-sample** — Component vs Client View.
4. **zoom/webhook-sample** — webhook + imza doğrulama.
5. **zoom/skills** — REST/OAuth/recording pipeline örnekleri.

## Uygulama Adımları
- [ ] `zoom-integration-core` iskeleti + env (Client ID/Secret/Account ID, SDK Key/Secret)
- [ ] S2S OAuth token cache servisi
- [ ] SDK JWT signature endpoint (jsrsasign)
- [ ] REST meeting create proxy
- [ ] FE `/meeting` izole route + Component View embed
- [ ] Recording/transcript fetch (iki yol)
- [ ] Webhook receiver + imza doğrulama
- [ ] Smart Embed click-to-call + event log
- [ ] Capability map sayfası
- [ ] Partner escalation listesi + README

## Test Planı
- Token cache expiry/refresh.
- Signature: bilinen payload ile JWT doğrulama.
- Webhook imza doğrulama (geçerli/geçersiz).
- Embed join happy path (manuel/E2E).

## Demo Senaryosu
1. Demo arayüzünden "Create Meeting" → meeting oluşur.
2. "Join" → Zoom meeting sayfada embed olur (Component View).
3. Meeting biter → webhook `meeting.ended` → transcript otomatik çekilir → ekranda gösterilir.
4. Phone sekmesi: numara gir → click-to-call → call event'leri canlı log'a düşer.
5. Capability map + "server-side call neden mümkün değil" notu sunulur.

## Production Architecture (M3'e paylaşım)
`zoom-integration-core` bağımsız mikroservis; M3 sadece HTTP ile tüketir (signature, create, transcript). Auth/token/webhook tek yerde toplanır.

## Lisans & Maliyet Analizi
- Meeting SDK: Zoom Workplace plan / ISV anlaşması kapsamı (Partner avantajı netleştirilmeli).
- Video SDK: Build Platform credits ($100/$450 aylık taban) — sadece white-label gerekirse.
- Cloud recording: ayrı ücretlendirme olabilir.

## Zoom Partner Escalation Listesi
- [ ] Partner SDK'da ek scope/erişim farkı var mı?
- [ ] Server-side outbound call için partner-only çözüm var mı?
- [ ] ISV embed lisansı mevcut Workplace planını kapsıyor mu?
- [ ] Cloud recording/transcript için hesap düzeyinde ön gereksinimler?

## Diğer Mission'lara Bağlantı
- **M3:** Bu servisi tüketir (CRM-specific UX ekler).
- **M4:** Webhook/transcript pipeline pattern'i Plaud ile paralel.

## Kırmızı Çizgiler
- Server-side outbound call'u "mümkün" diye sunma — Not Possible / Escalate.
- Meeting SDK'yı host CSS'inden izole et (dedicated route/iframe).
- Client Secret / SDK Secret asla frontend'e sızmaz; signature backend'de üretilir.
