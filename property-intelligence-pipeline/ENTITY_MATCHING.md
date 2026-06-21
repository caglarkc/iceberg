# Entity Matching (M4)

## Formula

```
confidence = 0.25 × appointment_proximity
           + 0.25 × address_match
           + 0.20 × user_match
           + 0.15 × contact_name_match
           + 0.10 × recording_title_match
           + 0.05 × manual_hint
```

## Thresholds

| Confidence | Queue | Behaviour |
|------------|-------|-----------|
| ≥ 0.85 | suggested | Top-1 highlighted; **confirm still required** |
| 0.60 – 0.84 | review | Top-3 + reason chips |
| < 0.60 | unmatched | Manual search |

## Signals

- **appointment_proximity:** recorded_at vs nearest valuation appointment (±30 min = 1.0)
- **address_match:** UK postcode + street fuzzy + house number disambiguation
- **user_match:** Plaud `owner_hint` vs assigned agent email
- **contact_name_match:** Mr/Mrs/Dr names in transcript
- **recording_title_match:** title vs property address fragments
- **manual_hint:** agent UI property pick → 1.0 on selected property

## Governance

AI / matcher **never** auto-binds property to CRM. Agent must call `POST .../match/confirm`.

## Golden fixtures

See `fixtures/m4/expected_matches.json` — T1≥0.90, T2 review, T3 neighbor disambiguation, T4 unmatched.
