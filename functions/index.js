
'use strict';
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const functionsV1 = require('firebase-functions/v1');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

initializeApp();
const db = getFirestore();

const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);

async function incrementMetric(metric, eventDate = new Date(), eventId = '') {
  const day = dayKey(eventDate);
  const summary = db.collection('creator_analytics').doc('summary');
  const daily = db.collection('creator_analytics').doc('daily').collection('days').doc(day);
  const markerId = (metric + '-' + (eventId || day)).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 140);
  const marker = db.collection('creator_analytics').doc('processed_events').collection('events').doc(markerId);

  await db.runTransaction(async tx => {
    const alreadyProcessed = await tx.get(marker);
    if (alreadyProcessed.exists) return;
    tx.set(summary, { [metric]: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    tx.set(daily, { date: day, [metric]: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    tx.create(marker, { metric, date: day, processedAt: FieldValue.serverTimestamp() });
  });
}

exports.trackUserActivity = onCall({ enforceAppCheck: false }, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign-in required.');
  const uid = request.auth.uid;
  const day = dayKey();
  const userActivity = db.collection('user_activity').doc(uid);
  const activity = userActivity.collection('days').doc(day);
  const daily = db.collection('creator_analytics').doc('daily').collection('days').doc(day);
  const eventType = request.data && request.data.eventType;
  const rawName = request.data && request.data.eventName;
  const allowed = eventType === 'destination' || eventType === 'feature';
  const eventName = allowed && typeof rawName === 'string'
    ? rawName.trim().replace(/[\/\\.#$\[\]]/g, '-').slice(0, 80)
    : '';
  const eventSlug = eventName.toLowerCase().replace(/\s+/g, '-');
  const eventRef = eventName
    ? db.collection('creator_analytics').doc(eventType === 'destination' ? 'popular_destinations' : 'popular_features')
        .collection('items').doc(eventSlug)
    : null;
  const eventDedupRef = eventRef ? userActivity.collection('events').doc(eventType + '-' + eventSlug + '-' + day) : null;

  await db.runTransaction(async tx => {
    const reads = [tx.get(userActivity), tx.get(activity)];
    if (eventDedupRef) reads.push(tx.get(eventDedupRef));
    const [rootSnap, daySnap, eventDedupSnap] = await Promise.all(reads);

    if (!daySnap.exists) {
      const metrics = { date: day, activeUsers: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() };
      if (rootSnap.exists) metrics.returningUsers = FieldValue.increment(1);
      tx.set(daily, metrics, { merge: true });
      tx.create(activity, { date: day, createdAt: FieldValue.serverTimestamp() });
    }

    tx.set(userActivity, {
      firstSeenAt: rootSnap.exists ? (rootSnap.data().firstSeenAt || FieldValue.serverTimestamp()) : FieldValue.serverTimestamp(),
      lastSeenAt: FieldValue.serverTimestamp()
    }, { merge: true });

    if (eventRef && (!eventDedupSnap || !eventDedupSnap.exists)) {
      tx.set(eventRef, { name: eventName, count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      tx.set(eventDedupRef, { type: eventType, name: eventName, date: day, createdAt: FieldValue.serverTimestamp() });
    }
  });

  return { recorded: true };
});

exports.getCreatorAnalytics = onCall(async request => {
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Creator admin access required.');
  }

  const summaryRef = db.collection('creator_analytics').doc('summary');
  const dailyRef = db.collection('creator_analytics').doc('daily').collection('days');
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 29);
  const sinceKey = dayKey(since);
  const todayKey = dayKey();

  const [summarySnap, dailySnap, todaySnap, activitySnap, popularDestinationsSnap, popularFeaturesSnap] = await Promise.all([
    summaryRef.get(),
    dailyRef.orderBy('date', 'desc').limit(30).get(),
    dailyRef.doc(todayKey).get(),
    db.collectionGroup('days').where('date', '>=', sinceKey).get(),
    db.collection('creator_analytics').doc('popular_destinations').collection('items').orderBy('count', 'desc').limit(10).get(),
    db.collection('creator_analytics').doc('popular_features').collection('items').orderBy('count', 'desc').limit(10).get()
  ]);

  const days = dailySnap.docs.map(doc => {
    const d = doc.data();
    return {
      date: d.date || doc.id,
      activeUsers: d.activeUsers || 0,
      posts: d.posts || 0,
      stories: d.stories || 0,
      registrations: d.registrations || 0,
      reports: d.reports || 0,
      returningUsers: d.returningUsers || 0
    };
  });

  const uniqueUids = { wau: new Set(), mau: new Set() };
  const weekStart = new Date();
  weekStart.setUTCHours(0, 0, 0, 0);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  const weekKey = dayKey(weekStart);

  activitySnap.docs.forEach(doc => {
    if (!doc.ref.path.startsWith('user_activity/')) return;
    const d = doc.data();
    const uid = doc.ref.parent.parent && doc.ref.parent.parent.id;
    if (!uid || !d.date) return;
    uniqueUids.mau.add(uid);
    if (d.date >= weekKey) uniqueUids.wau.add(uid);
  });

  const summary = summarySnap.exists ? summarySnap.data() : {};

  return {
    totals: {
      registrations: summary.registrations || 0,
      posts: summary.posts || 0,
      stories: summary.stories || 0,
      reports: summary.reports || 0
    },
    activity: {
      dau: todaySnap.exists ? (todaySnap.data().activeUsers || 0) : 0,
      returningUsers: todaySnap.exists ? (todaySnap.data().returningUsers || 0) : 0,
      wau: uniqueUids.wau.size,
      mau: uniqueUids.mau.size
    },
    popularDestinations: popularDestinationsSnap.docs.map(doc => ({ name: doc.data().name || doc.id, count: doc.data().count || 0 })),
    popularFeatures: popularFeaturesSnap.docs.map(doc => ({ name: doc.data().name || doc.id, count: doc.data().count || 0 })),
    daily: days
  };
});

exports.deleteOwnPost = onCall(async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign-in required.');
  const postId = request.data && request.data.postId;
  if (typeof postId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(postId)) {
    throw new HttpsError('invalid-argument', 'A valid postId is required.');
  }

  const postRef = db.collection('posts').doc(postId);
  const snap = await postRef.get();
  if (!snap.exists) return { removed: false, reason: 'not-found' };

  const data = snap.data() || {};
  if (data.authorUid !== request.auth.uid) throw new HttpsError('permission-denied', 'You can only delete your own post.');

  if (data.mediaPath && typeof data.mediaPath === 'string' && data.mediaPath.startsWith('posts/' + request.auth.uid + '/')) {
    try {
      await getStorage().bucket().file(data.mediaPath).delete({ ignoreNotFound: true });
    } catch (error) {
      throw new HttpsError('internal', 'Media cleanup failed; post was not removed.');
    }
  }

  await db.recursiveDelete(postRef);
  return { removed: true };
});

exports.moderateRemovePost = onCall(async request => {
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Creator admin access required.');
  }

  const postId = request.data && request.data.postId;
  if (typeof postId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(postId)) {
    throw new HttpsError('invalid-argument', 'A valid postId is required.');
  }

  const postRef = db.collection('posts').doc(postId);
  const snap = await postRef.get();
  if (!snap.exists) return { removed: false, reason: 'not-found' };

  const data = snap.data() || {};
  if (data.mediaPath && typeof data.mediaPath === 'string' && data.mediaPath.startsWith('posts/' + data.authorUid + '/')) {
    try {
      await getStorage().bucket().file(data.mediaPath).delete({ ignoreNotFound: true });
    } catch (error) {
      throw new HttpsError('internal', 'Media cleanup failed; post was not removed.');
    }
  }

  await db.recursiveDelete(postRef);
  return { removed: true };
});

exports.onAuthUserCreated = functionsV1.auth.user().onCreate(async user => {
  const createdAt = user.metadata && user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date();
  await incrementMetric('registrations', createdAt, 'auth-' + user.uid);
});

exports.onPostCreated = onDocumentCreated('posts/{postId}', async event => {
  const data = event.data.data() || {};
  await incrementMetric('posts', event.data.createTime ? event.data.createTime.toDate() : new Date(), event.id);
});

exports.onStoryCreated = onDocumentCreated('stories/{storyId}', async event => {
  await incrementMetric('stories', event.data.createTime ? event.data.createTime.toDate() : new Date(), event.id);
});

exports.onReportCreated = onDocumentCreated('reports/{reportId}', async event => {
  await incrementMetric('reports', event.data.createTime ? event.data.createTime.toDate() : new Date(), event.id);
});
