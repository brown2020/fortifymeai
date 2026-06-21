# Navigation, Account, And Sign-Out

## Navbar

- Navbar keeps protected links hidden while auth is loading.
- Authenticated desktop nav now has an account menu instead of direct profile link clutter.
- Mobile menu includes protected links, account link, and sign-out only for authenticated users.

## Account Menu

- Desktop account menu includes display identity, account link, and sign-out.
- Profile page password reset action now sends a Firebase reset email.

## Avatar

- Avatar resolution implemented as safe Firebase Google `photoURL` host (`lh3.googleusercontent.com`) when present, otherwise generated initial.
- Uploaded account avatar is not implemented in this product yet.

## Footer Hard Sign-Out

- Public home footer now includes a visible "Hard sign out" control.
- It calls the shared logout action and navigates to the signed-out home page.
- It is safe while already signed out because server session clear is idempotent and client cleanup is best-effort.

## Navbar And Footer State Matrix

| State | Navbar Result | Footer Hard Logout Result | Evidence |
| --- | --- | --- | --- |
| Unknown/bootstrap | Protected links hidden | Visible on home | Source |
| Signed out | Public sign-in/sign-up links | Clears stale server cookie if clicked | Source and DELETE QA |
| Signed in unverified | Account/protected UI after Firebase state; sign-up/sign-in route to verify page | Clears state | Source |
| Signed in verified | Protected links plus account menu | Clears state | Source |
| Non-admin | No admin links | Clears state | Discovery |
| Admin | N/A, no admin UI | Clears state | Discovery |
| Stale/invalid | Session sync failure clears user state | Clears cookie/storage | Source |
| After logout | Public UI after navigation | Idempotent | Source and HTTP logout QA |
