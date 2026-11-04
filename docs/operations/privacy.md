# Privacy: Retention and Deletion

Who owns what, and what erasure actually does. The retention window itself
is an open legal decision; this page records the mechanism and the default
so the decision can land without code changes.

## What is operational truth vs personal data

| Data | Owner | Erasure behavior |
| --- | --- | --- |
| Bookings, check-ins, voucher claims | Organizer (attendance and inventory truth) | Holder fields scrubbed to "Deleted User"; rows stay |
| Meeting requests | Both sides' history | Requester unlinked, name and email scrubbed; rows stay |
| Waitlist entries | Queue integrity | Name and email scrubbed; position history stays |
| Booth claims | Exhibitor business record | Claimant unlinked, booth returns to unclaimed; company data stays |
| AI reports | Organizer analytics | Kept; they aggregate event data, not personal data |
| Audit rows | Platform compliance | Never scrubbed per-row; deleted only by the retention window |
| Sessions, OTP codes, interests, profile | The delegate | Deleted or anonymized immediately |

Deleting a booking row would rewrite an organizer's attendance history and
inventory counts. Scrubbing the holder fields removes the person while
keeping the event truthful. That is the whole policy.

## Export: `GET /api/profile/export`

Signed-in delegates download profile, passes, meeting requests, waitlist
entries, booth claims and suppression state as JSON. 401 without a session;
a delegate receives only their own rows.

## Erase: `DELETE /api/profile`

Body must read exactly `{ "confirm": "DELETE" }`. The response counts what
was scrubbed. Effects are immediate: sessions die everywhere (instant
logout), the login email becomes `deleted-<id>@deleted.local`, and the
password hash is cleared so the account cannot sign in again.

## Audit retention: `GET /api/cron/retention`

Same scheduler contract as reminders (`Authorization: Bearer
$CRON_SECRET`, every 24 hours is plenty):

```sh
curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/retention
```

`AUDIT_RETENTION_DAYS` unset or invalid means dry-run: the response
reports `wouldDelete` and deletes nothing. Set it only after the legal
decision on the window lands:

```bash
AUDIT_RETENTION_DAYS="365"
```

Until then the job reports accumulation without destroying evidence.
Production boot warns while the variable is missing.
