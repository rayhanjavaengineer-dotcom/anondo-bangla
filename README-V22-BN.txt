Anondo Bangla v22.1 — Global Explore, Travel Identity & Firebase Configured

This release contains the same 47 project files from the supplied v22 archive.
Firebase Web App config has been populated for project anondo-bangla-87c40.

Included authentication code:
- Email/Password account registration and sign-in
- Google sign-in
- Password reset email
- Email verification request after registration
- Sign-out and signed-in account display

Travel Identity remains optional. Existing profile editor, photos, travel records,
features, local-storage keys, logos and image assets are retained. No cloud sync is
implemented: profile and travel data remain on the current device/browser.

BEFORE TESTING ONLINE AUTHENTICATION
1. In Firebase Console > Authentication, enable Email/Password and Google providers.
2. Add the exact deployed website hostname to Authentication > Settings > Authorized domains.
3. Deploy all 47 files to the hosting root.
4. Open Profile > Travel Identity and test registration, sign-in, reset, Google and logout.

See FIREBASE-SETUP-BN.txt for the full Bengali checklist. Real Firebase sign-in and
hosting runtime still require deployment and owner-side Firebase provider/domain settings.
