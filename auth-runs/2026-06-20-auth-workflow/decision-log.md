# Decision Log

| ID | Decision | Evidence | Alternatives | Result |
| --- | --- | --- | --- | --- |
| DEC-001 | Keep Firebase as provider and harden missing flows instead of migrating providers. | Firebase packages and client/Admin code exist; no non-Firebase auth provider evidence found. | Replace with another provider or defer auth work. | Proceed with Firebase-native hardening. |
| DEC-002 | Replace custom JWT session cookie internals with Firebase Admin session cookies while keeping the public cookie name stable. | Current session route verifies Firebase ID token then signs custom JWT; workflow and Firebase docs prefer Admin session cookies for server truth. | Keep custom JWT session. | Implement Firebase Admin session cookie verification/creation. |
| DEC-003 | Treat Firebase Console provider/domain/action URL status as an external setup checklist, not invented local proof. | Code/env names are present, but Console provider enablement and authorized domains cannot be proven from repo files. | Stop before local code changes. | Proceed with code-ready implementation and record setup checklist. |
