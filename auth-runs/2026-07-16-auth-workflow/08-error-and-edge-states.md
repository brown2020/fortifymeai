# Error And Edge States

- Fixed the deployment edge case where the hosting handler lacked Node's CommonJS-to-ESM require bridge.
- Same-origin session guards, safe redirects, user-facing Firebase errors, and stale-session handling are unchanged.
- The repair removes the startup exception rather than exposing dependency details to users.
