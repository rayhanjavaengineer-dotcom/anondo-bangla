
/* Run only on a trusted admin workstation with GOOGLE_APPLICATION_CREDENTIALS set. */
'use strict';
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const projectId = 'anondo-bangla-87c40';
const uid = process.argv[2];
if (!uid) { console.error('Usage: node set-admin-claim.js FIREBASE_AUTH_UID'); process.exit(1); }
initializeApp({ credential: applicationDefault(), projectId });
getAuth().getUser(uid).then(async user => {
  await getAuth().setCustomUserClaims(uid, { ...(user.customClaims || {}), admin: true });
  console.log('Admin claim enabled for UID:', uid);
  console.log('Ask this user to sign out and sign in again to refresh the ID token.');
}).catch(error => { console.error(error.message); process.exitCode = 1; });
