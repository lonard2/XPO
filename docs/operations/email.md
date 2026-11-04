# Email Operations

Delivery is load-bearing: OTP codes, booking confirmations, meeting
requests and reminders all travel by email. This page covers everything
an operator needs beyond "set RESEND_API_KEY".

## Sending domain and authentication

All mail sends as `EMAIL_FROM`, default `XPO MICE <no-reply@xpo.events>`.
Receivers trust it only when the domain authenticates. Set these three
DNS records where `xpo.events` is hosted (values for Resend; the Resend
dashboard shows the exact DKIM hostname and value for the domain):

```text
# SPF: authorize Resend to send for the domain
Type: TXT   Host: @ (or send, if mail goes out from a subdomain)
Value: v=spf1 include:amazonses.com ~all

# DKIM: Resend provides the selector hostname and public key
Type: TXT   Host: <selector>._domainkey
Value: v=DKIM1; k=rsa; p=<public key from the Resend dashboard>

# DMARC: start quarantining, move to reject once legitimate flow is clean
Type: TXT   Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:ops@xpo.events; fo=1
```

Without SPF and DKIM, booking confirmations land in spam for strict
receivers. Without DMARC, anyone can spoof the sender. Verify with any
DMARC checker after deploying, before the first real event.

## Bounce and complaint webhooks

Resend posts delivery events to `POST https://<host>/api/email/webhooks`.
Register it in the Resend dashboard under Webhooks with events
`email.bounced` and `email.complained`, then set the signing secret:

```bash
RESEND_WEBHOOK_SECRET="whsec_..."
```

Requests are verified by Svix signature when the secret is set. Without
it, production refuses webhook calls (boot logs a warning) while
development accepts them. An unauthenticated endpoint would let anyone
suppress anyone else's notifications, so there is no open mode in prod.

## Suppression semantics

A bounced or complained address lands in `EmailSuppression` and stops
receiving everything except OTP codes:

| Mail | Suppressed address |
| --- | --- |
| OTP codes | Always sends. Suppressing them locks people out. |
| Booking, meeting, reminder mail | Skipped with a warning log (`email-suppressed`). |

The skip is deliberate, never silent: watch for the `email-suppressed`
warning if delegates report missing mail. There is no marketing mail in
this codebase, so there is no unsubscribe path; complaints mean the
recipient marked our transactional mail as spam, which is exactly when
we must stop sending it.

## "My mail stopped arriving"

1. Check whether the address is suppressed: the warning log names it.
2. Verify the address is valid again (typo fixed, inbox restored).
3. Lift it explicitly as an admin:

```bash
curl -X DELETE https://<host>/api/email/suppressions \
  -H "Content-Type: application/json" \
  -H "Cookie: <admin session>" \
  -d '{"email":"delegate@example.com"}'
```

Lifting is a conscious operator action, not a TTL: a suppression records
a receiver verdict, and only a human should overrule it.
