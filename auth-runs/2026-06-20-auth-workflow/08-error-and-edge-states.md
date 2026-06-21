# Error And Edge States

## User-Facing Errors

- Added centralized Firebase error mapping in `src/lib/auth-errors.ts`.
- Login, signup, forgot-password, verify-email, email-action, and profile reset paths use visible page/toast errors.
- Session endpoint returns user-safe JSON errors without credential details.

## Redirect Safety

- Existing `getSafeRedirectPath` retained for callback and redirect-cookie values.
- Proxy preserves same-app callback paths for protected redirects.

## CSRF And Abuse Guardrails

- Session POST/DELETE now reject cross-origin requests by checking `Origin` and Fetch Metadata headers.
- Password reset copy avoids account enumeration by showing generic success text.
- Existing research API has per-user in-memory rate limiting.

## Stale Session Handling

- Firebase session-cookie verification uses revocation checks.
- AuthProvider clears local user state if server session sync fails.
- Logout route and session DELETE clear stale cookies even when the client is already signed out.
